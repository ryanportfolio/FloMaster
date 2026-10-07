// The zoom into the leak (ZoomStory.astro), played as one camera move.
//
// Pictures: a stack of levels, each the centre 1/S of the one before at S times the detail
// (S = sqrt 5). At depth z the stage shows level floor(z) scaled by S^(z - i) and the next level
// scaled by S^(z - i - 1), centred; the inner one's faded rim (baked into its alpha) sits where the
// outer one already shows the same picture. A level is never magnified past S (about 2.2x) before
// the next one covers the stage. Drawn with WebGL; the overlays move by transform and opacity only.
//
// Playback: scrolling down into the section starts the story, which then runs on its own clock
// (the timeline in src/data/zoom-story.ts). The section is pinned under the sticky top area while
// it plays and the gesture that started it is absorbed, so fast and slow scrollers see the same
// move at the same speed. A second scroll or swipe ends it (owner's decision, 2026-10-07): the
// story jumps to its end state and that scroll carries on down (or up) the page. "Second" means a
// new gesture, not the tail of the first:
//   - wheel: a gesture is a run of wheel events less than GAP (300 ms) apart, so a 20-notch flick or
//     a touchpad's momentum tail is one gesture. The first wheel gesture that begins at least GRACE
//     (600 ms) after the start and moves at least MIN_DELTA (30 px) ends it.
//   - touch: a touch that begins at least GRACE after the start ends it once it moves 10 px; the
//     page scrolls with that finger. Earlier touches are absorbed. A tap ends nothing.
//   - keys: a fresh press (not a key repeat) of an arrow, Page Up/Down or Space at least GRACE after
//     the start ends it and scrolls as usual.
// End, Home, Tab, focus moving into the section, anchor links, find-in-page and the scrollbar end
// it at once (end state). When it ends, scrolling carries on down the page. Coming back up shows
// the end state; the story replays only after the visitor has left the section upward and comes
// down into it again. Every layer is fetched and decoded before playback; if one is not ready when
// its moment comes, the clock waits on a sharp level. It plays the same with prefers-reduced-motion
// (owner's decision); without script (or without WebGL 2) the markup's still sequence shows instead.
// The column beside the stage (zoom-story-side.js) fills in at the story's beats.
import Lenis from "lenis";
import { createSide } from "./zoom-story-side.js";

(() => {
  const root = document.documentElement;
  const section = document.getElementById("zoom");
  if (!section) return;
  const pinEl = section.querySelector(".zs-pin");
  const stageEl = section.querySelector(".zs-stage");
  const layerBox = section.querySelector(".zs-layers");
  const canvas = stageEl.querySelector("canvas");
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
  if (!gl) { root.classList.remove("zs-on"); return; }
  const Side = createSide(section.querySelector(".zs-side"));
  const params = new URLSearchParams(location.search);
  const S = Math.sqrt(5), O = 1.25, IW = 1500, IH = 1000, STRIP = 0.5;
  const GRACE = 600, GAP = 300, MIN_DELTA = 30, TOUCH_MIN = 10;
  const STORY = JSON.parse(section.querySelector("#zs-story").textContent);
  const LOG = params.has("log") ? (window.__zsLog = []) : null;

  // ---------- Layers ----------
  const LAYERS = [...layerBox.querySelectorAll("img")].map((img) => ({
    img, key: img.dataset.key, level: Number(img.dataset.level), patchOf: img.dataset.patchOf || null,
    dx: 0, dy: 0, w: IW, h: IH, ready: false, tex: null, avg: null,
  }));
  const byKey = Object.fromEntries(LAYERS.map((l) => [l.key, l]));
  const maxLevel = Math.max(...LAYERS.map((l) => l.level));

  // ---------- Geometry (resize only) ----------
  // top: the section's top on the page; stick: the pin's sticky offset (the header, and the review
  // bar in prototype builds), so the page holds at top - stick.
  let geo = { top: 0, stick: 0, w: 1, h: 1, base: 1, dpr: 1, zStart: 0, phone: false };
  const measure = () => {
    const r = stageEl.getBoundingClientRect();
    const w = r.width, h = r.height;
    // On a phone each level is a half-width strip: at rest it must still span the stage, which the
    // site's phone stage (shorter than the specimen's, under the sticky top area and above the Call
    // and Book bar) would not give by its height alone. This keeps the specimen's phone framing.
    const base = Math.max(O * Math.max(w / IW, h / IH), w < 700 ? w / (IW * STRIP) : 0);
    // the story opens on the whole chart; on a phone (tall stage) on the chart filling the stage
    const fit = w < 700 ? Math.max(w / IW, h / IH) : Math.min(w / IW, h / IH) * 0.94;
    geo = { top: section.getBoundingClientRect().top + scrollY, stick: parseFloat(getComputedStyle(pinEl).top) || 0, w, h, base, dpr: devicePixelRatio || 1, zStart: Math.log(fit / base) / Math.log(S), phone: w < 700 };
    buildTimeline();
    canvas.width = Math.round(w * geo.dpr); canvas.height = Math.round(h * geo.dpr);
    for (const n of NAMES) n.w = 0; // label widths, measured again with the current font
    last = null;
  };

  // ---------- The timeline ----------
  // Segments: hold (still), zoom (z from -> to; exponential zoom: z is the log of the scale, moved
  // at constant speed with an eased start and stop), fade (cross-fade states in place). A zoom may
  // carry a cross-fade keyed to depth (the wall closing on the way out).
  let SEGS = [], TOTAL = 0;
  const zv = (v) => (v === "start" ? geo.zStart : v);
  const buildTimeline = () => {
    SEGS = []; TOTAL = 0;
    for (const s of STORY.timeline) {
      const seg = { ...s, t0: TOTAL };
      for (const k of ["z", "from", "to"]) if (k in seg) seg[k] = zv(geo.phone && seg[k + "Phone"] !== undefined ? seg[k + "Phone"] : seg[k]);
      SEGS.push(seg);
      TOTAL += s.dur;
    }
    Side.setBeats((STORY.beats || []).map((b) => SEGS[b.seg].t0 + b.at));
  };
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  // constant speed with eased ends: velocity ramps up over the first `a` of the time, down over the last
  const trapezoid = (u, a = 0.18) => {
    const v = 1 / (1 - a); // peak speed so that distance = 1
    if (u < a) return (v * u * u) / (2 * a);
    if (u > 1 - a) return 1 - (v * (1 - u) * (1 - u)) / (2 * a);
    return v * (u - a / 2);
  };
  const stateAt = (t) => {
    t = Math.min(TOTAL, Math.max(0, t));
    let seg = SEGS[SEGS.length - 1];
    for (const s of SEGS) if (t < s.t0 + s.dur) { seg = s; break; }
    const u = Math.min(1, (t - seg.t0) / seg.dur);
    const use = seg.use || {};
    if (seg.type === "zoom") {
      const z = seg.from + (seg.to - seg.from) * trapezoid(u);
      let fade = null;
      if (seg.zfade) { const f = seg.zfade; fade = [{ ...f, t: smooth((z - f.z0) / (f.z1 - f.z0)) }]; }
      return { z, use, fade, t };
    }
    if (seg.type === "fade") return { z: seg.z, use, fade: [].concat(seg.fade).map((f) => ({ ...f, t: smooth(u) })), t };
    return { z: seg.z, use, fade: null, t };
  };

  // ---------- What to draw ----------
  const keyFor = (level, use) => use[level] || `L${String(level / 2).replace(".5", "h")}`;
  const plan = ({ z, use, fade: fades }) => {
    const i = Math.max(0, Math.min(maxLevel, Math.floor(z)));
    const out = [];
    // on a phone each level is a half-width strip, narrower than the stage near whole depths: the
    // level outside it is drawn underneath, so its faded sides show the picture, not a flat colour
    for (const lv of geo.phone ? [i - 1, i, i + 1] : [i, i + 1]) {
      if (lv > maxLevel || lv < 0) continue;
      const own = fades && fades.find((f) => f.level === lv);
      const hide = fades && fades.find((f) => f.hideChild && f.level === lv - 1);
      const sc = S ** (z - lv);
      if (own) { if (own.t < 1) out.push([own.from, sc, 1]); if (own.t > 0) out.push([own.to, sc, own.t]); }
      else if (hide) { if (hide.child && hide.t < 1) out.push([hide.child, sc, 1 - hide.t]); }
      else if (keyFor(lv, use) !== "none") out.push([keyFor(lv, use), sc, 1]);
    }
    // a patch state draws over its level's main picture
    const res = [];
    for (const it of out) {
      const of = byKey[it[0]]?.patchOf;
      if (of) { const b = res.find((r) => r[0] === of); if (b) b[2] = Math.max(b[2], it[2]); else res.push([of, it[1], it[2]]); }
      const same = res.find((r) => r[0] === it[0]);
      if (same) same[2] = Math.max(same[2], it[2]); else res.push(it);
    }
    return res;
  };
  const needs = (st) => plan(st).filter((p) => p[2] > 0).map((p) => byKey[p[0]]);

  // ---------- Drawing: WebGL ----------
  // Each level is a texture, uploaded (with mipmaps) before playback, so a frame is two to four
  // textured quads and nothing is decoded or rasterised while the camera moves. (Scaled <img>
  // layers made Chrome re-rasterise tiles mid-zoom: on big images it fell behind and showed
  // unpainted tiles, the white flashes.) The canvas is opaque and cleared to the colour of the
  // outermost picture on screen, as a backstop only: the outer level always covers the stage.
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, `#version 300 es
    in vec2 a; uniform vec4 r; out vec2 v;
    void main() { gl_Position = vec4(mix(r.xy, r.zw, a), 0.0, 1.0); v = vec2(a.x, 1.0 - a.y); }`));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float; in vec2 v; uniform sampler2D t; uniform float o; out vec4 c;
    void main() { c = texture(t, v) * o; }`));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const uR = gl.getUniformLocation(prog, "r"), uO = gl.getUniformLocation(prog, "o");
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const zi = (L) => Number(L.img.style.zIndex || 0);

  // ---------- Over the pictures: place names and the drip ----------
  // Both ride with the camera: a point (x, y) in level L's 1500 x 1000 units is on screen at
  // centre + (x - 750, y - 500) * base * S^(z - L). Names keep their size; they fade as the camera
  // leaves the chart (Norfolk, where the job is, last). The drip is a drop that swells at the tip
  // of the drop hanging under the failed joint, lets go and falls under gravity, on the story
  // clock, so it plays the same on every run and in every recording.
  const fxEl = stageEl.querySelector(".zs-fx");
  const NAMES = [...(fxEl?.querySelectorAll(".zs-name") || [])].map((el) => ({ el, x: Number(el.dataset.x), y: Number(el.dataset.y), late: el.dataset.late === "1", o: -1, tf: "" }));
  const dropEl = fxEl?.querySelector(".zs-drop");
  const DRIP = STORY.drip;
  let dropO = -1, creditO = -1;
  const creditEl = stageEl.querySelector(".zs-credit");
  const setO = (el, o, prev) => { if (Math.abs(o - prev) > 0.002 || (o === 0) !== (prev === 0)) el.style.opacity = o.toFixed(3); return o; };
  const overlay = (z, t) => {
    const cx = geo.w / 2, cy = geo.h / 2;
    for (const n of NAMES) {
      const k = geo.base * S ** z;
      const X = cx + (n.x - 750) * k, Y = cy + (n.y - 500) * k;
      // a label that would run off the stage (the phone shows less of the chart) goes on the other
      // side of its dot; a dot off the stage hides its label
      if (!n.w) { n.w = n.el.offsetWidth; n.side = n.el.classList.contains("zs-name--l") ? "l" : "r"; n.at = n.side; }
      const fits = (s) => (s === "r" ? X + n.w <= geo.w - 6 : X - n.w >= 6);
      const side = fits(n.side) || !fits(n.side === "r" ? "l" : "r") ? n.side : n.side === "r" ? "l" : "r";
      if (side !== n.at) { n.at = side; n.el.classList.toggle("zs-name--l", side === "l"); n.el.classList.toggle("zs-name--r", side === "r"); }
      const edge = smooth((Math.min(X, geo.w - X, Y, geo.h - Y) - 16) / 24);
      const o = edge * (n.late ? 1 - smooth((z - 1.3) / 0.7) : 1 - smooth((z - geo.zStart - 0.3) / 0.6));
      n.o = setO(n.el, o, n.o);
      if (o <= 0) continue;
      const tf = `translate(${X.toFixed(1)}px, ${Y.toFixed(1)}px)`;
      if (tf !== n.tf) { n.tf = tf; n.el.style.transform = tf; }
    }
    // the map credit shows while the OpenStreetMap levels (0 to 5) are on screen
    if (creditEl) creditO = setO(creditEl, 1 - smooth((z - 5.5) / 0.5), creditO);
    if (!dropEl || !DRIP || !SEGS.length) return;
    const a = SEGS[DRIP.segs[0]], b = SEGS[DRIP.segs[1]];
    const t0 = a.t0, t1 = b.t0 + b.dur;
    let o = t >= t0 && t < t1 ? smooth((z - DRIP.level + 0.8) / 0.5) * (1 - smooth((t - t1 + 250) / 250)) : 0;
    let tf = null;
    if (o > 0) {
      const P = DRIP.period, p = ((t - t0) % P) / P, grow = DRIP.grow;
      const k = geo.base * S ** (z - DRIP.level);
      let s = 1, dy = 0;
      if (p < grow) s = 0.3 + 0.7 * smooth(p / grow);
      else {
        const u = (p - grow) / (1 - grow); // 0..1 of the fall
        dy = DRIP.fall * u * u; // from rest under constant gravity
        o *= 1 - smooth((u - 0.8) / 0.2);
      }
      const px = (DRIP.w * k) / 40 * s; // the drop is 40 x 56 in its own units; its point at (20, 2)
      const X = cx + (DRIP.at[0] - 750) * k - 20 * px, Y = cy + (DRIP.at[1] - 500 + dy) * k - 2 * px;
      tf = `translate(${X.toFixed(1)}px, ${Y.toFixed(1)}px) scale(${px.toFixed(4)})`;
    }
    dropO = setO(dropEl, o, dropO);
    if (tf) dropEl.style.transform = tf;
  };

  let last = null;
  const draw = (st, t, instant = false) => {
    const items = plan(st).filter((p) => p[2] > 0).map(([k, sc, op]) => [byKey[k], sc, op]).filter(([L]) => L && L.ready);
    items.sort((a, b) => zi(a[0]) - zi(b[0]));
    const W = canvas.width, H = canvas.height, px = geo.base * geo.dpr; // device px per layer unit at scale 1
    // backstop: the page colour around the opening chart, the outer picture's own colour after
    const back = st.z < 0 || !items[0] ? [246, 248, 251] : items[0][0].avg;
    // Draw only when the outer picture is on the GPU: until then the canvas keeps its last frame
    // (or, before the first one, stays hidden over the plain opening image).
    const outer = Math.max(0, Math.min(maxLevel, Math.floor(st.z)));
    if (items.some(([L]) => L.level === outer)) {
      if (!canvas.classList.contains("is-live")) canvas.classList.add("is-live");
      gl.viewport(0, 0, W, H);
      gl.clearColor(back[0] / 255, back[1] / 255, back[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const [L, sc, op] of items) {
        const k = sc * px, cx = W / 2 + L.dx * k, cy = H / 2 + L.dy * k, hw = (L.w * k) / 2, hh = (L.h * k) / 2;
        gl.bindTexture(gl.TEXTURE_2D, L.tex);
        gl.uniform4f(uR, ((cx - hw) / W) * 2 - 1, 1 - ((cy + hh) / H) * 2, ((cx + hw) / W) * 2 - 1, 1 - ((cy - hh) / H) * 2);
        gl.uniform1f(uO, op);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    overlay(st.z, t);
    Side.update(t, mode, instant);
    if (LOG) LOG.push([performance.now(), scrollY, st.z, t, st.fade ? st.fade[0].t : -1, mode, "", items.map(([L, , op]) => L.key + ":" + op.toFixed(2)).join(" ")]);
  };

  // ---------- Loading: every layer fetched, decoded off the main thread and uploaded first ----------
  const variant = () => {
    if (geo.phone) return geo.dpr > 2.4 ? "p3" : "p2";
    const need = IW * geo.base * geo.dpr; // device pixels across the whole frame at rest
    return need <= 2000 ? "d2000" : need <= 2700 ? "d2700" : "d3300";
  };
  const placeLayer = (L, v) => {
    const phone = v[0] === "p";
    L.w = phone && !L.img.dataset.whole ? IW * STRIP : IW; L.h = IH; L.dx = 0; L.dy = 0;
    const box = L.img.dataset.box; // patch: x, y, w, h in layer units
    if (box) {
      let [bx, by, bw, bh] = box.split(",").map(Number);
      if (phone) { const s0 = (IW - IW * STRIP) / 2, a = Math.max(bx, s0), b = Math.min(bx + bw, s0 + IW * STRIP); bx = a; bw = Math.max(2, b - a); }
      L.w = bw; L.h = bh; L.dx = bx + bw / 2 - IW / 2; L.dy = by + bh / 2 - IH / 2;
    }
  };
  const avgColour = (bmp) => {
    const c = new OffscreenCanvas(1, 1).getContext("2d");
    c.drawImage(bmp, 0, 0, 1, 1);
    return [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  let currentVariant = null, loadRun = 0;
  const frame = () => new Promise((r) => requestAnimationFrame(r));
  const loadAll = async () => {
    // the postmark's chart crop: an SVG <image> would load with the page, so its URL waits until now
    for (const im of section.querySelectorAll("image[data-href]")) { im.setAttribute("href", im.dataset.href); im.removeAttribute("data-href"); }
    const v = variant();
    if (v === currentVariant) return;
    currentVariant = v;
    const run = ++loadRun;
    for (const L of LAYERS) { L.ready = false; if (L.tex) { gl.deleteTexture(L.tex); L.tex = null; } }
    // story order: the levels the camera reaches first come first
    const order = [...LAYERS].sort((a, b) => a.level - b.level || (a.patchOf ? 1 : 0) - (b.patchOf ? 1 : 0));
    const bitmaps = order.map((L) => fetch(`${L.img.dataset.base}-${v}.webp`).then((r) => r.blob()).then((b) => createImageBitmap(b, { premultiplyAlpha: "premultiply" })));
    for (let i = 0; i < order.length; i++) {
      const L = order[i];
      let bmp;
      try { bmp = await bitmaps[i]; } catch { continue; }
      if (run !== loadRun) { bmp.close(); return; }
      placeLayer(L, v);
      L.avg = avgColour(bmp);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      bmp.close();
      L.tex = tex; L.ready = true; last = null;
      await frame(); // one upload per frame
    }
  };

  // ---------- Playback state ----------
  // armed: shows the opening, plays when the visitor scrolls down into the section
  // playing: section pinned, the first gesture absorbed, story on its own clock
  // ended: shows the end state; normal scrolling
  let mode = "armed", T = 0, clock = null, snapUntil = 0, startAt = 0;
  const pinY = () => Math.round(geo.top - geo.stick);
  // the story starts once the section's top comes within this distance of the pinned place
  const reach = () => Math.round(innerHeight * 0.12);
  const toY = (y) => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); };
  // wheel gestures during playback: when the last wheel event came, when the current gesture began
  // and how far it has moved
  let wheelLast = 0, wheelBegan = 0, wheelMoved = 0, touchEnds = false, touchY0 = 0;
  const start = () => {
    mode = "playing"; T = 0; clock = startAt = performance.now();
    wheelLast = wheelBegan = startAt; wheelMoved = 0;
    toY(pinY());
    snapUntil = startAt + 700; // absorb the tail of the entering scroll (wheel smoothing, touch fling)
    // A touch fling runs on the compositor: pulling the page back each frame while it runs makes the
    // page bounce, so for that window the page is not scrollable, which stops the fling.
    if (startAt - lastTouch < 1000) {
      root.style.overflow = "hidden";
      clearTimeout(unclip);
      unclip = setTimeout(() => { root.style.overflow = ""; }, 700);
    }
  };
  let lastTouch = -1e9, unclip = 0;
  let endWhy = null, holdEnded = 0; // holdEnded: while the page scrolls on after End, do not re-arm on the way
  const finish = (why = "end") => { if (unclip) { clearTimeout(unclip); unclip = 0; root.style.overflow = ""; } endWhy = { why, T: Math.round(T), y: Math.round(scrollY), pin: pinY() }; mode = "ended"; T = TOTAL; clock = null; last = null; };
  const late = () => performance.now() - startAt >= GRACE;

  // Input. During playback the first gesture is absorbed and a second one ends the story;
  // otherwise normal scrolling, and a downward movement that reaches the section top starts it.
  const onVirtualScroll = ({ deltaY, event }) => {
    if (LOG) (window.__zsIn ||= []).push([Math.round(performance.now()), event.type, Math.round(deltaY), mode, event.isTrusted]);
    if (event.ctrlKey) return true; // page zoom
    if (mode === "playing") {
      if (event.type !== "wheel") return touchEnds; // touch: handled by the listeners below
      const now = performance.now();
      if (now - wheelLast > GAP) { wheelBegan = now; wheelMoved = 0; } // a new gesture
      wheelLast = now;
      wheelMoved += Math.abs(deltaY);
      if (wheelBegan - startAt >= GRACE && wheelMoved >= MIN_DELTA) { finish("wheel"); return true; } // the page scrolls by it
      if (event.cancelable) event.preventDefault();
      return false;
    }
    if (mode === "armed" && deltaY > 0 && event.type === "wheel") {
      const y = lenis ? lenis.targetScroll : scrollY;
      if (y + deltaY >= pinY() - reach() && y < pinY() + 2) {
        if (event.cancelable) event.preventDefault();
        start();
        return false;
      }
    }
    return true;
  };
  for (const type of ["touchmove", "touchend"]) addEventListener(type, () => { lastTouch = performance.now(); }, { passive: true, capture: true });
  addEventListener("touchstart", (e) => {
    lastTouch = performance.now();
    touchEnds = mode === "playing" && late();
    touchY0 = e.touches[0]?.clientY ?? 0;
  }, { passive: true, capture: true });
  addEventListener("touchmove", (e) => {
    if (mode !== "playing") return;
    // a second swipe: end, and let this finger scroll the page
    if (touchEnds) { if (Math.abs((e.touches[0]?.clientY ?? touchY0) - touchY0) >= TOUCH_MIN) finish("swipe"); return; }
    if (e.cancelable) e.preventDefault();
  }, { passive: false, capture: true });
  const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "];
  const onKey = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // keys typed into a field move its caret, not the page
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    // End from above jumps past the story: it shows its end state and does not start on the way
    if (mode === "armed" && e.key === "End") { finish("key"); holdEnded = performance.now() + 1500; return; }
    if (mode !== "playing") return;
    if (["Home", "End", "Tab"].includes(e.key)) { finish("key"); return; }
    // Space on a button presses it; it does not scroll
    if (!SCROLL_KEYS.includes(e.key) || (e.key === " " && e.target.closest?.("button, [role=button]"))) return;
    // a fresh press after the start ends the story and scrolls as usual; a held key is absorbed
    if (!e.repeat && late()) { finish("key"); return; }
    e.preventDefault();
  };
  // keyboard focus moving into the section shows the end state (every entry in place)
  section.addEventListener("focusin", () => { if (mode !== "ended") { finish("focus"); holdEnded = performance.now() + 1500; } });

  // ---------- Frame loop ----------
  let lenis = null, raf = 0, frozen = false, prevY = null;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    lenis?.raf(now);
    if (frozen) return;
    const y = lenis ? lenis.scroll : scrollY;
    if (mode === "playing") {
      if (Math.abs(y - pinY()) > 2) {
        // moved by something other than the stage: the entering scroll still settling (pull it
        // back), or an escape (End, Home, anchor, focus, find, scrollbar): end at once
        if (now < snapUntil) toY(pinY()); else finish("moved");
      }
      if (mode === "playing") {
        const dt = now - clock; clock = now;
        // the clock only runs while every layer the next moment needs is decoded
        let next = Math.min(TOTAL, T + dt);
        // the opening hold lasts until every picture is on the GPU, so no upload (a stall of up to
        // 0.15 s on a slow phone) lands while the camera moves; usually they are long done by then
        if (SEGS[1] && next > SEGS[1].t0 && !LAYERS.every((L) => L.ready)) next = Math.max(T, SEGS[1].t0);
        if (needs(stateAt(next)).every((L) => L && L.ready)) T = next;
        if (T >= TOTAL) finish();
      }
    } else {
      // a movement into the section from above that did not come through the wheel (touch, keys,
      // scrollbar) also starts the story when it crosses the top
      if (mode === "armed" && prevY !== null && prevY < y && y >= pinY() - reach() && y < pinY() + innerHeight * 0.5) start();
      // left upward: the next visit plays again
      if (mode === "ended" && now > holdEnded && y < pinY() - 0.5 * Math.min(innerHeight, pinY())) { mode = "armed"; T = 0; last = null; }
    }
    prevY = y;
    const t = mode === "armed" ? 0 : T;
    if (last !== t) { last = t; draw(stateAt(t), t); }
  };

  const enable = () => {
    root.classList.add("zs-on");
    measure();
    if (!lenis) lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, virtualScroll: onVirtualScroll });
    // a reload or history move that lands on or below the section shows the end state
    if (scrollY >= pinY() - 2) finish("landed");
    if (!raf) raf = requestAnimationFrame(tick);
  };
  addEventListener("keydown", onKey, { capture: true });
  enable();
  addEventListener("resize", () => { measure(); if (currentVariant) loadAll(); Side.relayout(); }, { passive: true });
  // the section's place on the page moves when fonts or content above it settle, and the pin's
  // offset when the sticky top area changes height
  const ro = new ResizeObserver(() => { if (mode !== "playing") measure(); });
  ro.observe(document.body);
  const header = document.querySelector(".site-header");
  if (header) ro.observe(header);
  document.fonts?.ready.then(() => { if (mode !== "playing") measure(); Side.relayout(true); });

  // fetch and decode everything once the section is about two screens away
  new IntersectionObserver((entries, io) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    loadAll();
  }, { rootMargin: "200% 0px" }).observe(section);

  // Test hook, not used by the page: scripts/check-flows.mjs, check-perf.mjs and the .tmp/scroll-zoom checks read and drive the story through window.__zs.
  const waitReady = async () => { for (let i = 0; i < 1200 && !LAYERS.every((L) => L.ready); i++) await new Promise((r) => setTimeout(r, 25)); };
  window.__zs = {
    geo: () => geo, mode: () => mode, T: () => T, total: () => TOTAL, variant: () => currentVariant, stateAt,
    endWhy: () => endWhy, ready: () => LAYERS.every((L) => L.ready), waitReady, pinY, load: loadAll,
    drawT: async (t) => { frozen = true; await waitReady(); mode = t > 0 ? "ended" : "armed"; draw(stateAt(t), t, true); last = null; },
    drawZ: async (z) => { frozen = true; await waitReady(); draw({ z, use: {}, fade: null }, -1e9, true); last = null; },
    unfreeze: () => { frozen = false; last = null; },
    arm: () => { frozen = false; mode = "armed"; T = 0; last = null; },
    timeline: () => SEGS.map((s) => ({ type: s.type, t0: s.t0, dur: s.dur })),
  };
})();
