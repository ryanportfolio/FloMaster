// Load reveal, ported from harnessfirmware.com's hero (site/hero-pillars.mjs, living-system.mjs,
// dither-effects.css in ryanportfolio/HarnessFirmware.com). Base.astro inlines this file right
// after <main>, so it runs before the first paint. Every page load plays it, also with reduced
// motion (owner's decision); without scripting nothing is hidden.
//
// Tiers, in the order the page reads (ms after the start):
//   1 heading  the h1, split into glyphs: each rises 0.3em on an expo curve while its ink and focus
//              (opacity, blur 0.08em) arrive over the first 60% on a slow-start curve; a front sweeps
//              each row left to right and every row trails the one above. Text before the h1
//              (a crumb) arrives with it.
//   2 lead     the paragraph after the h1, then the lines after it: rise 0.45em, blur 4px, fade
//   3 actions  the first group of buttons ([data-hero-actions]), one button after another
//   4 media    the hero's object or photo: ink in (opacity, blur 6px) and a 20px rise, heavier
//   5 content  blocks of the next sections already on screen; 6 the rest as they scroll in.
//              Section headings rise out of a clip (the site's mask reveal), other blocks as tier 2.
// The site header and license line are there from the first paint.
// [data-reveal="off"] keeps an element and everything in it out. Only opacity, translate,
// filter and clip-path animate, so nothing moves the layout, and every element can be pressed
// while it arrives.
(() => {
  const d = document.documentElement;
  const main = document.getElementById("main");
  if (!main || !d.classList.contains("fm-rv") || !main.animate) { d.classList.add("fm-rv-on"); return; }

  const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)", INK = "cubic-bezier(0.4, 0, 0.2, 1)", SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";
  // Start opacity: a trace of ink rather than none, so Chrome rasters the layer before it shows.
  const TRACE = 0.003;
  // Durations and gaps in ms. The source runs 1000 ms glyphs, a 55 ms/em front and 160 ms rows on one
  // headline; here every part of the first screen has to be in within about a second, so all are shorter.
  const T = { glyph: 650, rowGap: 70, sweep: 180, V: 55, lead: 80, step: 40, actions: 40, button: 40, media: 40, mediaStep: 60, content: 110, sub: 600, ink: 650, mask: 700, batch: 70, batchMax: 350 };
  const reveal = (window.fmReveal = { log: [], t0: 0, replay, finish });
  // Resolves once the first screen is at rest (or the reveal is cut short), for scripts that start motion of their own.
  let settle;
  reveal.settled = new Promise((r) => (settle = r));
  let stopped = false; // finish() ran: nothing more starts
  let holds = new Map(); // element -> paused animation keeping it at TRACE until its turn
  let anims = [];
  let restores = [];
  let io = null;

  const off = (el) => !!el.closest("[data-reveal='off'], [data-sticky]");
  const own = (el) => {
    const cs = getComputedStyle(el);
    return { o: +cs.opacity, tr: cs.translate === "none" || cs.translate === "0px", fi: cs.filter === "none" };
  };
  const run = (el, frames, timing) => { const a = el.animate(frames, { fill: "backwards", id: "fm-reveal", ...timing }); anims.push(a); return a; };
  const hold = (el) => {
    if (holds.has(el)) return;
    const a = el.animate([{ opacity: TRACE }, { opacity: TRACE }], { duration: 1, fill: "both" });
    a.pause();
    holds.set(el, a);
  };
  const release = (el) => { holds.get(el)?.cancel(); holds.delete(el); };
  const note = (el, tier, at, dur) => reveal.log.push({ el, tier, at: Math.round(at), end: Math.round(at + dur) });

  // Tier 2 treatment: rise, blur 4px and fade on the soft curve.
  const sub = (el, tier, at, rise = "0.45em", dur = T.sub) => {
    const s = own(el);
    run(el, [
      { opacity: TRACE * s.o, ...(s.tr && { translate: `0 ${rise}` }), ...(s.fi && { filter: "blur(4px)" }) },
      { opacity: s.o, ...(s.tr && { translate: "0 0" }), ...(s.fi && { filter: "blur(0px)" }) },
    ], { duration: dur, delay: at, easing: SOFT });
    note(el, tier, at, dur);
  };
  // Heavy blocks: ink and focus on the ink curve (as the source's drawing), a 20px rise on expo.
  // A block much taller than the screen skips the blur: one blurred raster of it costs frames.
  const ink = (el, tier, at, rise = 20, dur = T.ink) => {
    const s = own(el);
    const blur = s.fi && el.getBoundingClientRect().height <= innerHeight * 1.5;
    if (s.tr) run(el, [{ translate: `0 ${rise}px` }, { translate: "0 0" }], { duration: dur, delay: at, easing: EXPO });
    run(el, [{ opacity: TRACE * s.o, ...(blur && { filter: "blur(6px)" }) }, { opacity: s.o, ...(blur && { filter: "blur(0px)" }) }], { duration: dur, delay: at, easing: INK });
    note(el, tier, at, dur);
  };
  // Section headings: rise 18px out of a clip that opens from the top.
  const mask = (el, tier, at) => {
    const s = own(el);
    run(el, [
      { clipPath: "inset(12% -0.3em -0.3em)", opacity: TRACE * s.o, ...(s.tr && { translate: "0 18px" }) },
      { clipPath: "inset(-0.3em)", opacity: s.o, ...(s.tr && { translate: "0 0" }) },
    ], { duration: T.mask, delay: at, easing: SOFT });
    note(el, tier, at, T.mask);
  };

  // The h1 as glyphs. A visually hidden copy keeps the heading's text for assistive technology.
  // Each glyph is an inline block, which loses kerning, so each gets the margin that puts it back
  // where the kerned text had it. If the split would wrap differently, the h1 animates whole.
  // When the glyphs have arrived, the original text goes back.
  function glyphs(h, at) {
    if (h.querySelector("a, button, input, select, textarea, img, svg, [id], [tabindex]")) { reveal.split = "has controls"; return null; }
    const original = [...h.childNodes];
    const before = [];
    const range = document.createRange();
    const texts = [];
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) texts.push(n);
    for (const n of texts) {
      let i = 0;
      for (const ch of n.data) {
        if (!/\s/.test(ch)) { range.setStart(n, i); range.setEnd(n, i + ch.length); const r = range.getClientRects()[0]; before.push(r ? { x: r.left, y: r.top } : null); }
        i += ch.length;
      }
    }
    const height = h.getBoundingClientRect().height;
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    const chars = [];
    const words = [];
    const walk = (src, dst) => {
      for (const node of src.childNodes) {
        if (node.nodeType === 1) { const c = node.cloneNode(false); dst.append(c); walk(node, c); continue; }
        if (node.nodeType !== 3) continue;
        for (const part of node.data.split(/(\s+)/)) {
          if (!part) continue;
          if (!part.trim()) { dst.append(" "); continue; }
          // a hyphen can end a line, so it ends a word
          for (const piece of part.match(/[^-]+-*|-+/g)) {
            const w = document.createElement("span");
            w.className = "rv-w";
            for (const ch of piece) { const c = document.createElement("span"); c.className = "rv-c"; c.textContent = ch; w.append(c); chars.push(c); }
            dst.append(w);
            words.push(w);
          }
        }
      }
    };
    walk(h, visual);
    const label = document.createElement("span");
    label.className = "rv-sr";
    label.textContent = h.textContent.replace(/\s+/g, " ").trim();
    h.replaceChildren(label, visual);
    const undo = () => h.replaceChildren(...original);
    if (chars.length !== before.length || before.includes(null)) { undo(); reveal.split = "count " + chars.length + "/" + before.length; return null; }
    // kerning: give each glyph the gap the kerned text had to the glyph before it in its word
    let pos = chars.map((c) => c.getBoundingClientRect());
    let k = 0;
    for (const w of words) {
      const n = w.children.length;
      for (let j = 1; j < n; j++) {
        const gap = before[k + j].x - before[k + j - 1].x - (pos[k + j].left - pos[k + j - 1].left);
        if (Math.abs(gap) > 0.05) w.children[j].style.marginLeft = `${gap.toFixed(2)}px`;
      }
      k += n;
    }
    pos = chars.map((c) => c.getBoundingClientRect());
    const moved = Math.abs(h.getBoundingClientRect().height - height) > 1 || pos.some((r, i) => Math.abs(r.left - before[i].x) > 1.5 || Math.abs(r.top - pos[0].top - (before[i].y - before[0].y)) > 2);
    if (moved) { undo(); reveal.split = "moved"; return null; }
    const fs = parseFloat(getComputedStyle(h).fontSize);
    const rows = [];
    for (const r of pos) { if (!rows.length || Math.abs(r.top - rows[rows.length - 1].top) > fs * 0.5) rows.push({ top: r.top, left: r.left, right: r.right }); const row = rows[rows.length - 1]; row.left = Math.min(row.left, r.left); row.right = Math.max(row.right, r.right); }
    const widest = Math.max(...rows.map((r) => (r.right - r.left) / fs));
    const V = Math.min(T.V, T.sweep / widest);
    let end = at;
    chars.forEach((c, i) => {
      const row = rows.findIndex((r) => Math.abs(pos[i].top - r.top) <= fs * 0.5);
      const delay = at + row * T.rowGap + ((pos[i].left - rows[row].left) / fs) * V;
      run(c, [{ translate: "0 0.3em" }, { translate: "0 0" }], { duration: T.glyph, delay, easing: EXPO });
      run(c, [{ opacity: TRACE, filter: "blur(0.08em)" }, { opacity: 1, filter: "blur(0em)" }], { duration: T.glyph * 0.6, delay, easing: INK });
      end = Math.max(end, delay + T.glyph);
    });
    const mine = anims.slice(-chars.length * 2);
    restores.push(() => undo());
    Promise.all(mine.map((a) => a.finished)).then(() => { if (h.contains(visual)) undo(); }, () => {});
    note(h, 1, at, end - at);
    reveal.split = "glyphs";
    return { lastRow: at + (rows.length - 1) * T.rowGap };
  }

  // ---- what to animate -------------------------------------------------------------------
  const shown = (el) => { const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  // A box that paints itself (a card: fill, border or shadow) arrives whole, never as an empty frame.
  const painted = (cs) => cs.boxShadow !== "none" || cs.backgroundImage !== "none" || !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor) || ["Top", "Right", "Bottom", "Left"].some((k) => parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== "none");
  const widget = (el) => [...el.attributes].some((a) => a.name.startsWith("data-") && !a.name.startsWith("data-astro") && a.name !== "data-reveal");
  const LEAF = /^(H[1-6]|P|FIGURE|IMG|PICTURE|SVG|CANVAS|VIDEO|IFRAME|BLOCKQUOTE|TABLE|FORM|DETAILS|BUTTON|A|LABEL|INPUT|SELECT|TEXTAREA|DL|LI|FIELDSET|ARTICLE|HR|SPAN|STRONG|EM)$/;
  const SKIP = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/;
  const h1 = main.querySelector("h1");
  const hero = h1 ? h1.closest("section") || main.firstElementChild : null;

  function blocks(root, out) {
    for (const c of root.children) {
      if (SKIP.test(c.tagName) || off(c) || c === hero) continue;
      if (hero && c.contains(hero)) { blocks(c, out); continue; }
      const cs = getComputedStyle(c);
      if (cs.display === "contents") { blocks(c, out); continue; }
      if (!shown(c) || cs.position === "fixed" || cs.position === "sticky") continue;
      const text = [...c.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
      const list = c.tagName === "UL" || c.tagName === "OL";
      const box = !LEAF.test(c.tagName) && !text && c.children.length && (c.tagName === "SECTION" || (!widget(c) && !painted(cs) && (!list || /grid|flex/.test(cs.display))));
      if (box || (list && /grid|flex/.test(cs.display) && c.children.length > 1)) blocks(c, out);
      else out.push(c);
    }
    return out;
  }
  const treat = (el, tier, at) => {
    const t = el.tagName;
    if (/^H[2-4]$/.test(t)) mask(el, tier, at);
    else if (/^(IMG|PICTURE|FIGURE|SVG|CANVAS|VIDEO|IFRAME)$/.test(t) || widget(el) || el.getBoundingClientRect().height > innerHeight * 0.5) ink(el, tier, at);
    else sub(el, tier, at);
  };

  // The hero: what sits beside or after the h1's column (the photo, the work order, the tag board).
  const heroParts = () => {
    if (!h1 || off(h1)) return null;
    const copy = h1.parentElement;
    const kids = [...copy.children].filter((c) => !SKIP.test(c.tagName) && !off(c) && shown(c));
    const at = kids.indexOf(h1);
    const media = [];
    for (let n = copy; n && n !== hero; n = n.parentElement) {
      for (let s = n.nextElementSibling; s; s = s.nextElementSibling) if (!SKIP.test(s.tagName) && !off(s) && shown(s)) media.push(s);
    }
    return { before: kids.slice(0, at), after: kids.slice(at + 1), media };
  };

  let parts = null;
  let pending = [];
  function prepare() {
    parts = heroParts();
    if (parts) for (const el of [h1, ...parts.before, ...parts.after, ...parts.media]) hold(el);
    pending = blocks(main, []);
    for (const el of pending) hold(el);
  }

  // ---- the timeline -------------------------------------------------------------------------
  function play() {
    let next = 0;
    if (parts) {
      const kick = parts.before.length ? 60 : 0;
      parts.before.forEach((el) => { release(el); sub(el, 1, 0, "0.3em", 500); });
      release(h1);
      const g = glyphs(h1, kick);
      if (!g) sub(h1, 1, kick, "0.3em", T.glyph);
      let t = (g ? g.lastRow : kick) + T.lead;
      let tier = 2;
      parts.after.forEach((el, i) => {
        release(el);
        const btns = el.querySelectorAll(".btn").length;
        if (tier === 2 && (el.matches("[data-hero-actions]") || (btns && btns === el.children.length))) {
          // the first group of buttons: tier 3, one button after another
          tier = 3;
          t += T.actions - T.step;
          [...el.children].forEach((b, j) => sub(b, 3, t + j * T.button, "0.45em"));
          t += (el.children.length - 1) * T.button;
        } else sub(el, tier, t, i === 0 ? "0.45em" : "0.3em");
        t += T.step;
      });
      next = t + T.media - T.step;
      parts.media.forEach((el, i) => { release(el); ink(el, 4, next + i * T.mediaStep); });
      next += (parts.media.length ? (parts.media.length - 1) * T.mediaStep + T.content : 0);
    }
    // blocks already on screen follow as tier 5; the rest wait to scroll in
    const vh = innerHeight;
    const now = pending.filter((el) => el.getBoundingClientRect().top < vh * 0.92);
    const later = pending.filter((el) => !now.includes(el));
    batch(now, 5, next);
    if (later.length) {
      io = new IntersectionObserver((es) => {
        const hit = es.filter((e) => e.isIntersecting).map((e) => e.target);
        hit.forEach((el) => io.unobserve(el));
        batch(hit.sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1)), 6, 0);
      }, { rootMargin: "0px 0px -8% 0px" });
      later.forEach((el) => io.observe(el));
    }
  }
  function batch(els, tier, at) {
    const step = els.length > 1 ? Math.min(T.batch, T.batchMax / (els.length - 1)) : 0;
    const t0 = performance.now() - reveal.t0;
    els.forEach((el, i) => {
      if (!holds.has(el)) return;
      release(el);
      const before = anims.length;
      treat(el, tier, at + i * step);
      // a batch that starts after the first play is timed from now
      if (tier === 6) { anims.slice(before).forEach((a) => a.play()); reveal.log[reveal.log.length - 1].at += t0; reveal.log[reveal.log.length - 1].end += t0; }
    });
  }

  // Start: once the slab face is in (at most 600 ms), and the page is shown (a prerendered page
  // waits for its activation). The entrances are built paused, then start three frames later,
  // so the first raster of the layers they promote lands before anything moves.
  function start(fresh) {
    const face = fresh && document.fonts && !document.fonts.check("700 1em 'Roboto Slab Variable'")
      ? Promise.race([document.fonts.load("700 1em 'Roboto Slab Variable'"), new Promise((r) => setTimeout(r, 600))]).catch(() => {})
      : Promise.resolve();
    const shownNow = () => (document.prerendering ? new Promise((r) => document.addEventListener("prerenderingchange", r, { once: true })) : null);
    face.then(shownNow).then(() => {
      if (stopped) return;
      reveal.log = [];
      const first = anims.length;
      play();
      const mine = anims.slice(first);
      mine.forEach((a) => a.pause());
      // promote every layer now, so their first raster lands in the three held frames
      const layers = new Set(mine.map((a) => a.effect.target));
      layers.forEach((el) => { el.style.willChange = "translate, opacity, filter"; });
      Promise.all(mine.map((a) => a.finished)).finally(() => { layers.forEach((el) => el.style.removeProperty("will-change")); settle(); }).catch(() => {});
      let n = 3;
      const go = () => {
        if (--n) return requestAnimationFrame(go);
        reveal.t0 = performance.now();
        performance.mark("fm-reveal-start");
        mine.forEach((a) => a.playState === "paused" && a.play());
      };
      requestAnimationFrame(go);
    }).catch(finish);
  }
  // Everything at rest at once: printing, a failure, a check that measures the page at rest.
  function finish() {
    stopped = true;
    for (const el of [...holds.keys()]) release(el);
    anims.forEach((a) => { try { a.finish(); } catch (e) { a.cancel(); } });
    io?.disconnect();
    settle();
  }
  // Prototype review bar: play the reveal again from the top of the page.
  function replay() {
    stopped = false;
    io?.disconnect();
    for (const el of [...holds.keys()]) release(el);
    anims.forEach((a) => a.cancel());
    anims = [];
    restores.forEach((f) => f());
    restores = [];
    scrollTo({ top: 0, behavior: "instant" });
    prepare();
    start(false);
  }
  document.addEventListener("focusin", (e) => {
    for (const el of holds.keys()) if (el.contains(e.target)) { release(el); io?.unobserve(el); }
  });
  addEventListener("beforeprint", finish);

  try {
    prepare();
    start(true);
  } catch (err) {
    finish();
    setTimeout(() => { throw err; });
  } finally {
    d.classList.add("fm-rv-on");
  }
})();
