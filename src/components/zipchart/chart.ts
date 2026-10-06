// The hull chart's motion. Still at rest; on each answer one glide over the water to the ZIP, one
// mark, then still again. Reduced motion: the final view in the same task as the written answer.
// Per frame it writes one transform on the land group, label offsets, one water translate and the
// mark; it never reads layout during a glide (sizes come from a ResizeObserver).
import { ZIPS, OUTSIDE } from "./points";
import { zoomPath, duration, targetFor, clampCam, transformOf, REST, EASE_GLIDE, EASE_RING, type Cam } from "./camera";

type Kind = "yes" | "maybe" | "no" | "bad";
type MarkKind = "ring-solid" | "ring-dashed" | "dot" | "none";
type Box = [number, number, number, number];
type Pt = [number, number];
interface Answer { kind: Kind; zip: string; city: string }
interface Label { id: string; el: SVGSVGElement; g: SVGGElement; bx: number; by: number; x: number; y: number; zoom: boolean; city: string; box: Box; op: number; from: number; to: number }
interface Plan {
  a: Answer; mark: MarkKind; pt: number[] | null; to: Cam; redraw: boolean; armed: boolean; pending?: boolean;
  D: number; S: number; path: (t: number) => Cam; ease: (x: number) => number;
  t0: number; m0: number; ms: number; ts: number; ls: number; end: number;
  labelsDone: boolean;
  // Settle-time label anchors that differ from the base ones (the answer's city, the nearest water).
  alt: Map<Label, Pt>;
  // The settle region (box px, top and bottom) that must be in view before the glide starts.
  need: [number, number];
  W: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const hit = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const inBox = (b: Box, W: number, H: number, i: number) => b[0] >= i && b[1] >= i && b[2] <= W - i && b[3] <= H - i;

export function initChart(root: HTMLElement) {
  const camG = root.querySelector<SVGGElement>("[data-cam-g]")!;
  const water = root.querySelector<HTMLElement>(".zc-water")!;
  const markG = root.querySelector<SVGGElement>("[data-mark-g]")!;
  const rings = markG.querySelectorAll<SVGPathElement>("path");
  const draw = root.querySelector<SVGPathElement>("[data-draw]")!;
  const tag = root.querySelector<HTMLElement>("[data-tag]")!;
  const ghost = root.querySelector<HTMLElement>("[data-ghost]")!;
  const credit = root.querySelector<HTMLElement>(".zc-credit")!;
  const wrap = root.parentElement!;
  const factTag = wrap.querySelector<HTMLElement>(".zc-fact .fact-tag");
  const cityPath = new Map([...root.querySelectorAll<SVGPathElement>(".zc-city")].map((p) => [p.dataset.c!, p]));
  const header = document.querySelector<HTMLElement>(".site-header");
  const bar = document.querySelector<HTMLElement>("[data-sticky]");
  const wide = matchMedia("(min-width: 960px)");
  const rm = matchMedia("(prefers-reduced-motion: reduce)");
  const rig = location.search.includes("zcrig");
  const ds = root.dataset;

  const labels: Label[] = [...root.querySelectorAll<SVGSVGElement>("[data-lbl]")].map((el) => {
    const [x, y] = el.dataset.a!.split(",").map(Number);
    const op = el.hasAttribute("data-zoom") ? 0 : 1;
    return { id: el.dataset.lbl!, el, g: el.querySelector("g")!, bx: x, by: y, x, y, zoom: op === 0, city: el.dataset.c || "", box: [0, 0, 0, 0], op, from: op, to: op };
  });
  const restSet = new Set(labels.filter((l) => !l.zoom));

  let W = 0, H = 0, tx0 = 0, ty0 = 0, ox = 0, oy = 0;
  let cam: Cam = [...REST] as Cam;
  let state = "rest";
  let plan: Plan | null = null, queued: Plan | null = null, cur: Plan | null = null;
  let raf = 0, lastTs = 0, labelT0 = -1;
  // What is on screen now (JS copies, never read back from the DOM).
  let markOp = 0, drawOff = 1, markKind: MarkKind = "none", markPt: number[] | null = null;
  let tagOp = 0, tagW = 0, tagH = 0, tagX = 0, tagY = 0, tagOn = false, tagOwner: Plan | null = null;
  // The old tag fades out as a copy, so the new tag's text is written with the answer, never mid-glide.
  let ghostOp = 0, ghostFrom = 0, ghostT0 = -1;
  // A pending answer fades the old mark out at once, without a glide.
  let outT0 = -1, outFrom = 0;
  // The credit gives way to a tag placed over it; the Fact tag (tags on) is kept clear of labels and marks.
  let creditBox: Box = [0, 0, 0, 0], creditHit = false, factBox: Box | null = null, factW = 0, factH = 0;
  let resolveSettled: (v: unknown) => void = () => {};

  const api: Record<string, unknown> = { state, camera: cam, target: null, answer: null, duration: 0, frames: 0, settled: Promise.resolve(null) };
  if (rig) api.samples = [];
  (window as any).__zipchart = api;

  const radius = () => (wide.matches ? 18 : 14);
  const screen = (p: number[], c: Cam): Pt => { const k = W / c[2]; return [(p[0] - c[0]) * k + W / 2, (p[1] - c[1]) * k + H / 2]; };
  const world = (s: Pt, c: Cam): Pt => { const k = W / c[2]; return [(s[0] - W / 2) / k + c[0], (s[1] - H / 2) / k + c[1]]; };
  const fills = (el: SVGGeometryElement, p: Pt) => el.isPointInFill(new DOMPoint(p[0], p[1]));

  function setRing() {
    const r = radius(), d = `M0 ${-r}A${r} ${r} 0 1 1 0 ${r}A${r} ${r} 0 1 1 0 ${-r}`;
    rings.forEach((p) => p.setAttribute("d", d));
    draw.setAttribute("d", d);
  }
  function measure() {
    const b = root.getBoundingClientRect();
    W = b.width; H = b.height;
    tx0 = (96 - ((b.left + scrollX) % 96)) % 96; ty0 = H % 48;
    root.style.setProperty("--zc-jx", `${(-((b.left + scrollX) % 96)).toFixed(2)}px`);
    labels.forEach((l) => { const r = l.g.getBBox(); l.box = [r.x, r.y, r.x + r.width, r.y + r.height]; });
    if (tagOn) { tagW = tag.offsetWidth; tagH = tag.offsetHeight; }
    const cb = credit.getBoundingClientRect();
    creditBox = [cb.left - b.left - 2, cb.top - b.top - 2, cb.right - b.left + 2, cb.bottom - b.top + 2];
    const on = factTag && document.documentElement.classList.contains("tags-on");
    factW = on ? factTag!.offsetWidth : 0; factH = on ? factTag!.offsetHeight : 0;
    setFact(wrap.classList.contains("fact-low"));
  }
  // The Fact tag sits top-left, or bottom-left when a mark would sit under it (tags on only).
  function setFact(low: boolean) {
    wrap.classList.toggle("fact-low", low);
    factBox = factW ? (low ? [6, H - 10 - factH, 10 + factW, H - 6] : [6, 6, 10 + factW, 10 + factH]) : null;
  }

  // ---- Writers ----
  function paint() {
    camG.setAttribute("transform", transformOf(cam));
    const k = W / cam[2], kr = W / REST[2];
    for (const l of labels) {
      if (l.op <= 0 && l.to <= 0) continue;
      const dx = (l.x - cam[0]) * k - (l.bx - REST[0]) * kr, dy = (l.y - cam[1]) * k - (l.by - REST[1]) * kr;
      l.g.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    }
    water.style.transform = `translate3d(${((((tx0 + ox) % 96) + 96) % 96).toFixed(2)}px,${((((ty0 + oy) % 48) + 48) % 48).toFixed(2)}px,0)`;
    if (markPt && markOp > 0) {
      const [mx, my] = screen(markPt, cam);
      markG.setAttribute("transform", `translate(${mx.toFixed(2)} ${my.toFixed(2)})`);
    }
    markG.style.opacity = String(markOp);
    draw.style.strokeDashoffset = String(drawOff);
    // Fully drawn: drop the mask, so the ring has no seam at 12 o'clock.
    markG.classList.toggle("drawn", drawOff <= 0);
    tag.style.opacity = String(tagOp);
    ghost.style.opacity = String(ghostOp);
    credit.style.opacity = creditHit ? String(1 - tagOp) : "";
  }
  function moveCam(c: Cam) {
    const k = W / c[2];
    ox = (ox - (c[0] - cam[0]) * k) % 96; oy = (oy - (c[1] - cam[1]) * k) % 48;
    cam = c; api.camera = c;
  }
  function setMark(m: MarkKind, pt: number[] | null) {
    markKind = m; markPt = pt;
    markG.classList.toggle("dash", m === "ring-dashed");
    markG.classList.toggle("is-dot", m === "dot");
  }
  function setLabelOp(l: Label, v: number) {
    if (v === l.op) return;
    if (l.op <= 0) l.el.style.visibility = "";
    l.op = v; l.el.style.opacity = String(v);
    if (v <= 0) l.el.style.visibility = "hidden";
  }

  // ---- Geometry of a planned settle ----
  const anchorOf = (l: Label, p: Plan | null): Pt => p?.alt.get(l) ?? [l.bx, l.by];
  const labelBox = (l: Label, c: Cam, p: Plan | null, at?: Pt): Box => {
    const [sx, sy] = screen(at ?? anchorOf(l, p), c);
    return [sx + l.box[0] - 2, sy + l.box[1] - 2, sx + l.box[2] + 2, sy + l.box[3] + 2];
  };
  const markBoxOf = (p: Plan, pad: number): Box | null => {
    if (!p.pt || p.mark === "none" || p.a.kind === "bad") return null;
    const [mx, my] = screen(p.pt, p.to), r = (p.mark === "dot" ? 4 : radius() + 3.5) + pad;
    return [mx - r, my - r, mx + r, my + r];
  };
  const tagBox = (): Box => [tagX - 2, tagY - 2, tagX + tagW + 2, tagY + tagH + 2];
  const full = (c: Cam) => c[2] >= 700;
  const ownLabel = (p: Plan) => (p.a.city ? labels.find((l) => l.city === p.a.city) : undefined);

  // Spots around the mark, in screen px, nearest first; text is wide, so above and below come first.
  const RING: Pt[] = [];
  for (const d of [30, 44, 60, 78, 98, 120]) for (const a of [90, 270, 60, 120, 240, 300, 30, 150, 210, 330, 0, 180]) RING.push([Math.cos((a * Math.PI) / 180) * d * 1.6, Math.sin((a * Math.PI) / 180) * d]);

  // The answer's city is always named at the settle: at its usual anchor when that is in view and
  // clear of the mark, else at the nearest spot around the mark that lies inside the city.
  function placeOwn(p: Plan) {
    const own = ownLabel(p), shape = own && cityPath.get(own.city);
    if (!own || !shape || full(p.to)) return;
    const mb = markBoxOf(p, 3);
    const ok = (at: Pt) => { const b = labelBox(own, p.to, p, at); return inBox(b, W, H, 6) && !(mb && hit(b, mb)) && !(factBox && hit(b, factBox)) && !hit(b, creditBox); };
    if (ok([own.bx, own.by])) return;
    const [mx, my] = screen(p.pt!, p.to);
    for (const [dx, dy] of RING) {
      const at = world([mx + dx, my + dy], p.to);
      if (ok(at) && fills(shape, at)) { p.alt.set(own, at); return; }
    }
  }
  // ---- Tag ----
  function writeTag(p: Plan) {
    tagOwner = p;
    const { kind, zip } = p.a;
    tagOn = kind !== "bad";
    tag.hidden = !tagOn;
    if (!tagOn) return;
    tag.innerHTML = kind === "yes" ? `Yes, I cover ${zip}` : kind === "maybe" ? `<b>${zip}</b><span>Call me to check</span>` : `<span>${zip} is outside my area</span><span>I work in the 7 cities of Hampton Roads</span>`;
    tag.classList.toggle("dash", kind === "maybe");
    // An outside answer runs as two full-width lines; beside a dot on a phone (sticky bar shown) it
    // keeps its usual width, so it fits next to the dot near the top instead of under the bar.
    tag.classList.toggle("wide", kind === "no" && !(p.pt && barShown()));
    tagW = tag.offsetWidth; tagH = tag.offsetHeight;
    placeTag(p);
  }
  // Right of the mark, else left of it (spec section 8). When that would cover the mark, a label the
  // settled view shows, or the credit, the tag tries above and below the mark, then the top and the
  // bottom of the chart, and takes the place that covers least (the answer's own city counts most).
  // While a phone's sticky bar is shown the bottom spot costs more than hiding two names: a tag there
  // is under the bar until the whole chart is scrolled into view.
  function placeTag(p: Plan) {
    if (!tagOn) return;
    const spots: [number, number, number][] = [];
    const markBox = markBoxOf(p, 4);
    if (factW) setFact(!!markBox && hit(markBox, [0, 0, 16 + factW, 16 + factH]));
    if (p.pt && p.mark !== "none") {
      const [mx, my] = screen(p.pt, p.to), r = p.mark === "dot" ? 5 : radius(), mid = my - tagH / 2;
      spots.push([mx + r + 10, mid, 0], [mx - r - 10 - tagW, mid, 0], [mx - tagW / 2, my - r - 10 - tagH, 0], [mx - tagW / 2, my + r + 10, 0]);
    }
    spots.push([(W - tagW) / 2, 8, 0], [(W - tagW) / 2, H - 8 - tagH, barShown() ? 120 : 0]);
    // Chart taller than the space between the header and the bar (a phone held sideways): the tag
    // must sit in the part of the chart that is shown, even if it hides a name there.
    const b = band(), short = H > b.bottom - b.top;
    const v0 = Math.max(0, b.top - b.r.top) + 6, v1 = Math.min(H, b.bottom - b.r.top) - 6;
    if (short && v1 - v0 > tagH) spots.push([(W - tagW) / 2, (v0 + v1) / 2 - tagH / 2, 0]);
    // Labels the mark itself will hide do not steer the tag.
    const mb3 = markBoxOf(p, 3), own = ownLabel(p);
    const want = wanted(p.to, p).filter((l) => l === own || !mb3 || !hit(labelBox(l, p.to, p), mb3));
    const lbl = want.map((l) => labelBox(l, p.to, p));
    let best = Infinity;
    for (const [sx, sy, extra] of spots) {
      const x = Math.min(W - 8 - tagW, Math.max(8, sx)), y = Math.min(H - 8 - tagH, Math.max(8, sy));
      const t: Box = [x - 2, y - 2, x + tagW + 2, y + tagH + 2];
      let cost = extra + (short && (y < v0 || y + tagH > v1) ? 500 : 0) + (markBox && hit(t, markBox) ? 1000 : 0) + (hit(t, creditBox) ? 1 : 0) + (factBox && hit(t, factBox) ? 1000 : 0);
      want.forEach((l, i) => { if (hit(t, lbl[i])) cost += l.city && l.city === p.a.city ? 200 : full(p.to) ? 50 : 10; });
      if (cost < best) { best = cost; tagX = x; tagY = y; }
      if (cost === 0) break;
    }
    creditHit = hit([tagX, tagY, tagX + tagW, tagY + tagH], creditBox);
    tag.style.transform = `translate(${tagX.toFixed(1)}px,${tagY.toFixed(1)}px)`;
  }
  // Everything a settle shows that must be in view: the mark and the tag (box px, top and bottom).
  function settleRegion(p: Plan) {
    const parts = [markBoxOf(p, 2), tagOn && p.a.kind !== "bad" ? tagBox() : null].filter(Boolean) as Box[];
    p.need = parts.length ? [Math.min(...parts.map((b) => b[1])), Math.max(...parts.map((b) => b[3]))] : [0, H];
  }
  // Positions for a planned settle, worked out with the answer (no layout reads in the glide).
  function layoutPlan(p: Plan) {
    p.alt = new Map(); p.W = W;
    placeOwn(p);
    writeTag(p);
    settleRegion(p);
  }

  // ---- Labels for a settled view (spec section 6, amendment v3) ----
  // Labels a settled view would show before collisions, highest priority first.
  function wanted(c: Cam, p: Plan): Label[] {
    const mxy = p.pt && p.mark !== "none" && p.a.kind !== "bad" ? screen(p.pt, c) : null;
    const inside = (l: Label, inset: number) => {
      const [sx, sy] = screen(anchorOf(l, p), c);
      return sx >= inset && sy >= inset && sx <= W - inset && sy <= H - inset && inBox(labelBox(l, c, p), W, H, 0);
    };
    const dist = (l: Label) => { if (!mxy) return 0; const [sx, sy] = screen(anchorOf(l, p), c); return Math.hypot(sx - mxy[0], sy - mxy[1]); };
    const own = (l: Label) => !!l.city && l.city === p.a.city;
    let cand: Label[];
    if (full(c)) cand = [...restSet];
    else {
      let cities = labels.filter((l) => l.city && inside(l, 8)).sort((a, b) => Number(own(b)) - Number(own(a)) || dist(a) - dist(b));
      if (!wide.matches) cities = cities.slice(0, 2);
      cand = [...cities, ...labels.filter((l) => !l.city && inside(l, 0))];
    }
    // Water names stay at their own anchors (on their own water) and give way when they collide.
    const rank = (l: Label) => (own(l) ? 0 : l.city ? 1 : l.id.startsWith("shield") ? 2 : 3);
    return cand.sort((a, b) => rank(a) - rank(b));
  }
  function labelSet(c: Cam, p: Plan | null): Set<Label> {
    if (!p) return restSet;
    const out = new Set<Label>(), taken: Box[] = [];
    const mb = markBoxOf(p, 3);
    if (mb) taken.push(mb);
    if (tagOn && p.a.kind !== "bad") taken.push(tagBox()); // boxes inflated 2 px on both sides
    if (factBox) taken.push(factBox);
    if (!creditHit) taken.push(creditBox);
    for (const l of wanted(c, p)) {
      const b = labelBox(l, c, p);
      if (taken.some((t) => hit(t, b))) continue;
      taken.push(b); out.add(l);
    }
    // Never another city's name alone: if the answer's city cannot be named, no city is.
    const own = ownLabel(p);
    if (own && !full(c) && !out.has(own)) for (const l of [...out]) if (l.city) out.delete(l);
    return out;
  }
  // Move labels to their anchors for this settle; one that changes place starts again from hidden.
  function anchorLabels(p: Plan | null) {
    for (const l of labels) {
      const [x, y] = anchorOf(l, p);
      if (x !== l.x || y !== l.y) { l.x = x; l.y = y; setLabelOp(l, 0); }
    }
  }
  function fadeLabels(set: Set<Label>, t0: number) {
    labels.forEach((l) => { l.from = l.op; l.to = set.has(l) ? 1 : 0; });
    labelT0 = t0;
  }
  function stepLabels(ts: number) {
    if (labelT0 < 0) return;
    const f = Math.min(1, Math.max(0, (ts - labelT0) / 150));
    labels.forEach((l) => setLabelOp(l, l.from + (l.to - l.from) * f));
    if (f >= 1) labelT0 = -1;
  }
  function snapLabels(set: Set<Label>) {
    labelT0 = -1;
    labels.forEach((l) => { l.to = set.has(l) ? 1 : 0; setLabelOp(l, l.to); });
  }

  // ---- Test hooks ----
  function attrs(p: Plan | null) {
    ds.state = state; api.state = state;
    ds.cam = cam.map(r1).join(",");
    if (p) {
      ds.kind = p.a.kind; ds.zip = p.a.zip; ds.mark = p.a.kind === "bad" ? "none" : p.mark; ds.dur = String(Math.round(p.D));
      if (p.pt && p.mark !== "none" && p.a.kind !== "bad") { const [mx, my] = screen(p.pt, p.to); ds.markX = String(r1(mx)); ds.markY = String(r1(my)); }
      else { delete ds.markX; delete ds.markY; }
    }
    ds.labels = labels.filter((l) => l.to > 0).map((l) => l.id).join(",");
  }
  function settle(p: Plan, reduced: boolean) {
    state = "settled";
    if (reduced) ds.rm = "1"; else delete ds.rm;
    attrs(p);
    performance.mark("zc-settle");
    resolveSettled({ zip: p.a.zip, kind: p.a.kind, camera: cam.slice(), mark: ds.mark, labels: ds.labels, rm: reduced });
  }

  // ---- Plans ----
  function targetOf(p: Plan): Cam {
    // Narrow chart: lift the view so the mark sits at 40% of the height (spec amendment v2).
    return p.a.kind === "bad" ? (cam.slice() as Cam) : targetFor(p.a.kind, p.pt || undefined, W < 600 ? 0.1 : 0);
  }
  function makePlan(a: Answer): Plan {
    let pt: number[] | null = null, mark: MarkKind = "none";
    if (a.kind === "yes" || a.kind === "maybe") { pt = ZIPS[a.zip] || null; if (pt) mark = a.kind === "yes" ? "ring-solid" : "ring-dashed"; }
    else if (a.kind === "no" && OUTSIDE[a.zip]) { pt = OUTSIDE[a.zip]; mark = "dot"; }
    const p = { a, mark, pt, redraw: false, armed: false, ease: EASE_GLIDE, t0: 0, m0: 0, labelsDone: false, alt: new Map(), need: [0, 0], W } as unknown as Plan;
    p.to = targetOf(p);
    timeline(p);
    return p;
  }
  // Durations and stage times (spec section 9), from the camera as it is now.
  function timeline(p: Plan) {
    const zp = zoomPath(cam, p.to), bad = p.a.kind === "bad", ring = p.mark.startsWith("ring");
    p.path = zp.at; p.S = zp.S;
    p.D = bad || p.redraw ? 0 : duration(cam, p.to, zp.S);
    p.ms = bad ? Infinity : p.redraw ? 0 : p.D > 0 ? 0.8 * p.D : 150;
    p.ts = p.mark === "none" || p.D === 0 ? p.ms : p.ms + (ring ? 150 : 75);
    p.ls = bad ? 0 : p.D > 0 ? p.D : 150;
    p.end = bad ? 150 : p.redraw ? 300 : Math.max(ring ? p.ms + 300 : p.mark === "dot" ? p.ms + 150 : p.ms, p.ts + 150, p.ls + 150);
  }
  // After a retarget the camera keeps its speed and eases up from there (amendment v3): a cubic on
  // the path parameter that starts at the live speed and ends at rest, instead of a fresh ease-out peak.
  const hermite = (s0: number) => (t: number) => s0 * (t * t * t - 2 * t * t + t) + 3 * t * t - 2 * t * t * t;

  function begin(p: Plan, ts: number, dt: number) {
    const prev = plan;
    const pe = prev ? ts - prev.t0 : 0;
    const retarget = !!(prev && !prev.redraw && prev.D > 0 && pe < prev.D);
    // The chart may have changed width while the answer waited: work its settle out again.
    if (!p.redraw && p.a.kind !== "bad" && p.W !== W) { p.to = targetOf(p); layoutPlan(p); }
    timeline(p);
    p.ease = EASE_GLIDE;
    if (retarget && p.D > 0) {
      // Live speed on the old path, in path-length units per ms, matched to the new path's start.
      const h = 0.002, x = pe / prev!.D, v = ((prev!.ease(Math.min(1, x + h)) - prev!.ease(x)) / h) * Math.abs(prev!.S) / prev!.D;
      // Capped low: the new path pans where the old one was mostly zooming, so the same path speed
      // would still jump on screen; the cubic then eases the pan up over the next frames.
      p.ease = hermite(Math.min(0.25, Math.max(0, (v * p.D) / Math.max(1e-6, Math.abs(p.S)))));
    }
    p.t0 = retarget ? ts - Math.min(dt, 34) : ts;
    plan = cur = p;
    p.m0 = markOp; outT0 = -1;
    if (p.redraw) drawOff = 1;
    if (ghostOp > 0) { ghostFrom = ghostOp; ghostT0 = ts; }
    if (p.D > 0) {
      performance.mark("zc-glide", { detail: { zip: p.a.zip } });
      if (retarget) performance.mark("zc-retarget");
    }
    state = p.D > 0 ? "gliding" : "marking";
    api.target = p.to; api.duration = p.D;
    attrs(p);
  }
  function step(p: Plan, ts: number) {
    const e = ts - p.t0;
    if (p.redraw) { drawOff = 1 - EASE_RING(Math.min(1, e / 300)); return e >= 300; }
    // Every frame stays inside the chart's extent (spec section 7), so the view never shows past the map.
    if (p.D > 0) moveCam(clampCam(e >= p.D ? p.to : p.path(p.ease(e / p.D))));
    if (e < p.ms) markOp = p.m0 * Math.max(0, 1 - e / 150);
    else {
      if (markKind !== p.mark || markPt !== p.pt) setMark(p.mark, p.pt);
      const f = Math.min(1, (e - p.ms) / (p.mark === "dot" ? 150 : 300));
      markOp = p.mark === "none" ? 0 : p.mark === "dot" ? f : 1;
      drawOff = p.mark === "dot" ? 0 : 1 - EASE_RING(f);
    }
    if (tagOwner === p) tagOp = tagOn ? Math.min(1, Math.max(0, (e - p.ts) / 150)) : 0;
    if (!p.labelsDone && e >= p.ls) {
      p.labelsDone = true;
      anchorLabels(p);
      fadeLabels(labelSet(p.to, p), p.t0 + p.ls);
    }
    if (state === "gliding" && e >= p.D) { state = "marking"; ds.state = state; api.state = state; }
    return e >= p.end;
  }

  function frame(ts: number) {
    raf = 0;
    (api.frames as number)++;
    const dt = ts - lastTs;
    lastTs = ts;
    if (queued && !queued.pending) {
      if (queued.armed) { const q = queued; queued = null; begin(q, ts, dt); }
      else queued.armed = true;
    }
    if (outT0 >= 0) {
      markOp = outFrom * Math.max(0, 1 - (ts - outT0) / 150);
      if (markOp <= 0) outT0 = -1;
    }
    const p = plan;
    let done = true;
    if (p) {
      done = step(p, ts);
      if (done) {
        plan = null;
        if (p.a.kind === "bad") { setMark("none", null); }
      }
    }
    if (ghostT0 >= 0) {
      ghostOp = ghostFrom * Math.max(0, 1 - (ts - ghostT0) / 150);
      if (ghostOp <= 0) { ghostT0 = -1; ghost.hidden = true; }
    }
    stepLabels(ts);
    paint();
    if (p && done) settle(p, false);
    if (rig) (api.samples as unknown[]).push({ t: ts, cx: cam[0], cy: cam[1], w: cam[2], marks: markOp > 0 && markKind !== "none" ? 1 : 0, tag: tagOp > 0 ? 1 : 0 });
    if (plan || (queued && !queued.pending) || labelT0 >= 0 || ghostT0 >= 0 || outT0 >= 0) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) { lastTs = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; plan = null; queued = null; }

  // ---- In view (spec section 11, amendment v3) ----
  // Only the area between the sticky header and the sticky bottom bar counts. A glide starts when
  // half the chart is there (or, when that space is smaller, 90% of it: a phone held sideways) and
  // its settled mark and tag will be there too.
  const barShown = () => !!bar && !bar.classList.contains("is-waiting") && getComputedStyle(bar).display !== "none";
  function band() {
    const r = root.getBoundingClientRect();
    const top = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    let bottom = innerHeight;
    if (barShown()) {
      const b = bar!.getBoundingClientRect();
      if (b.height > 0) bottom = Math.min(bottom, b.top);
    }
    return { r, top, bottom };
  }
  function canSee(p: Plan) {
    const { r, top, bottom } = band();
    const shown = Math.max(0, Math.min(bottom, r.bottom) - Math.max(top, r.top)) / r.height;
    const need = Math.min(0.5, (0.9 * Math.max(0, bottom - top)) / r.height);
    return shown >= need && r.top + p.need[0] - 2 >= top && r.top + p.need[1] + 2 <= bottom;
  }
  let watching = false, checkRaf = 0;
  const onMove = () => { if (!checkRaf) checkRaf = requestAnimationFrame(check); };
  function watch(on: boolean) {
    if (on === watching) return;
    watching = on;
    for (const ev of ["scroll", "resize"]) {
      if (on) window.addEventListener(ev, onMove, { passive: true });
      else window.removeEventListener(ev, onMove);
    }
  }
  function check() {
    checkRaf = 0;
    const q = queued;
    if (!q || !q.pending) { watch(false); return; }
    if (!canSee(q)) {
      if (!tagOn || H <= band().bottom - band().top) return;
      placeTag(q); settleRegion(q);
      if (!canSee(q)) return;
    }
    watch(false);
    q.pending = false; q.armed = true;
    state = "gliding"; attrs(q);
    kick();
  }

  // Final state at once: reduced motion, or a flip to it mid-glide.
  function finish(p: Plan) {
    stop(); watch(false);
    ghostOp = 0; ghostT0 = -1; ghost.hidden = true; outT0 = -1;
    cur = p;
    if (p.a.kind === "bad") { markOp = 0; setMark("none", null); writeTag(p); tagOp = 0; }
    else {
      if (p.W !== W || !p.need[1]) { p.to = targetOf(p); layoutPlan(p); }
      moveCam(p.to);
      setMark(p.mark, p.pt);
      markOp = p.mark === "none" ? 0 : 1; drawOff = 0;
      tagOp = tagOn ? 1 : 0;
    }
    anchorLabels(p);
    snapLabels(labelSet(cam, p));
    paint();
    api.target = p.to; api.duration = p.D;
    settle(p, true);
  }

  function answer(a: Answer) {
    api.answer = a;
    // A superseded answer's promise resolves at once (no chain that grows with every answer).
    resolveSettled({ superseded: true });
    api.settled = new Promise((r) => (resolveSettled = r));
    const reduced = rm.matches;
    const live = queued || plan;
    if (live && live.a.zip === a.zip && live.a.kind === a.kind && !reduced) return; // still on its way (or redrawing): only the text is read again
    const settledSame = state === "settled" && cur && cur.a.zip === a.zip && cur.a.kind === a.kind;
    if (a.kind === "bad" ? markOp <= 0 && tagOp <= 0 && !live : settledSame && !markKind.startsWith("ring")) {
      // Nothing on the chart changes: the text alone answers.
      if (a.kind === "bad") { cur = makePlan(a); ds.kind = "bad"; ds.zip = ""; ds.mark = "none"; delete ds.markX; delete ds.markY; }
      resolveSettled({ zip: a.zip, kind: a.kind, camera: cam.slice(), mark: ds.mark, labels: ds.labels, rm: reduced });
      return;
    }
    const p = makePlan(a);
    if (settledSame) { p.redraw = true; timeline(p); }
    if (reduced) {
      if (p.redraw) { drawOff = 0; paint(); resolveSettled({ zip: a.zip, kind: a.kind, camera: cam.slice(), mark: ds.mark, labels: ds.labels, rm: true }); }
      else { ghostOp = 0; layoutPlan(p); finish(p); }
      return;
    }
    // The tag's text is written now, with the answer, while it is hidden (no text change mid-glide).
    if (!p.redraw) {
      if (tagOp > 0) {
        ghost.innerHTML = tag.innerHTML; ghost.className = tag.className; ghost.style.transform = tag.style.transform;
        ghost.hidden = false; ghostOp = tagOp; ghostT0 = -1;
      }
      layoutPlan(p); tagOp = 0; paint();
    } else p.need = cur!.need;
    queued = p;
    if (!p.redraw && p.a.kind !== "bad" && !canSee(p)) {
      // Not enough of the chart is in view, or the settled mark or tag would be hidden: wait for it
      // (spec section 11, amended). The view holds, and the old ring, dot, tag and ghost fade out at
      // once, so a half-seen chart never contradicts the text.
      if (raf) cancelAnimationFrame(raf);
      raf = 0; plan = null; p.pending = true;
      const now = performance.now();
      if (markOp > 0) { outFrom = markOp; outT0 = now; }
      if (ghostOp > 0) { ghostFrom = ghostOp; ghostT0 = now; }
      state = "pending"; attrs(p);
      watch(true);
      kick();
      return;
    }
    watch(false);
    state = p.D > 0 ? "gliding" : "marking";
    attrs(p);
    kick();
  }

  root.addEventListener("zc:answer", (e) => answer((e as CustomEvent<Answer>).detail));
  rm.addEventListener("change", () => {
    const p = queued || plan;
    if (rm.matches && p && !p.redraw) finish(p);
  });
  new ResizeObserver(() => {
    measure();
    setRing();
    if (cur && !plan && !queued) {
      if (cur.a.kind !== "bad") placeTag(cur);
      snapLabels(labelSet(cam, cur));
      attrs(cur);
    } else if (plan || queued) placeTag((plan ?? queued)!);
    paint();
  }).observe(root);
  document.fonts?.ready.then(measure);
  // Tags on or off (prototype review bar): measure the Fact tag again and keep it clear.
  new MutationObserver(() => {
    measure();
    if (cur && !plan && !queued) { if (tagOn) placeTag(cur); snapLabels(labelSet(cam, cur)); attrs(cur); paint(); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  // An answer given before this code arrived (HullCheck keeps the last one on the chart).
  const early = (root as HTMLElement & { zcLast?: Answer }).zcLast;
  if (early) { measure(); answer(early); }
}
