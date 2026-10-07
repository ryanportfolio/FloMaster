// The zoom story's column (ZoomStory.astro): a carbon-copy work order, filled in as the camera
// finds the job. Each beat adds its entries and nothing is taken away until the story starts
// over, so nobody has to read against the clock.
//
// Text arrives with harnessfirmware.com's load reveal (site/split-reveal.mjs and .css in
// ryanportfolio/HarnessFirmware.com): the text is split into the lines the browser laid out, each
// line in a clipping mask; its words rise from below the mask while their characters fade in one
// after another. Same numbers: 0.5 s, ease-out cubic (.33, 1, .68, 1), 0.1 s between lines,
// 0.01 s between characters. Tiered: an entry's value 0.12 s after its beat, a note 0.3 s after.
// The exit (when the story starts over) runs the same way upward: words rise out of the top of
// their masks, characters fade, 0.4 s, ease-in cubic. The visible split copy is aria-hidden; a
// visually hidden full string is what screen readers get.
// It plays the same with prefers-reduced-motion (the owner's rule for this story).
export const createSide = (panel) => {
  // ---------- split: masked line > word > character (split-reveal.mjs, without its
  // reduced-motion bypass) ----------
  const split = (el) => {
    const text = el.dataset.text ?? (el.dataset.text = el.textContent.trim().replace(/\s+/g, " "));
    const label = document.createElement("span"); label.className = "sr-label"; label.textContent = text;
    const visual = document.createElement("span"); visual.className = "sr-visual"; visual.setAttribute("aria-hidden", "true");
    const words = text.split(" ").map((w, i) => {
      if (i) visual.append(" ");
      const word = document.createElement("span"); word.className = "sr-word";
      for (const ch of w) { const c = document.createElement("span"); c.className = "sr-char"; c.textContent = ch; word.append(c); }
      visual.append(word);
      return word;
    });
    el.replaceChildren(label, visual);
    const lines = []; let lastTop = NaN;
    for (const w of words) { const top = w.offsetTop; if (!lines.length || Math.abs(top - lastTop) > 2) lines.push([]); lines.at(-1).push(w); lastTop = top; }
    visual.replaceChildren();
    const tier = Number(el.dataset.tier || 0);
    lines.forEach((lw, li) => {
      const mask = document.createElement("span"); mask.className = "sr-mask";
      const line = document.createElement("span"); line.className = "sr-line";
      let ci = 0;
      lw.forEach((w, wi) => {
        if (wi) line.append(" ");
        w.style.setProperty("--d", `${(tier + li * 0.1).toFixed(3)}s`);
        w.style.setProperty("--o", `${(li * 0.06).toFixed(3)}s`);
        for (const c of w.children) { c.style.setProperty("--d", `${(tier + li * 0.1 + ci * 0.01).toFixed(3)}s`); c.style.setProperty("--o", `${(li * 0.06 + ci * 0.004).toFixed(3)}s`); ci++; }
        line.append(w);
      });
      mask.append(line); visual.append(mask);
    });
    el.classList.add("sr");
  };

  // ---------- beats ----------
  // [data-beat="i"] marks everything that belongs to beat i: split text, and effects (the
  // postmark, the snapshot with the leak circled, the stamp) that play on .is-in.
  let beatT = [], shown = [], groups = [];
  const collect = () => {
    const n = Math.max(-1, ...[...panel.querySelectorAll("[data-beat]")].map((e) => Number(e.dataset.beat))) + 1;
    groups = Array.from({ length: n }, (_, i) => [...panel.querySelectorAll(`[data-beat="${i}"]`)]);
    shown = groups.map(() => false);
  };
  const setState = (els, cls, instant) => {
    for (const e of els) {
      e.classList.toggle("is-now", !!instant);
      e.classList.remove("is-in", "is-out");
      if (cls) { if (!instant) void e.offsetWidth; e.classList.add(cls); }
    }
  };
  const show = (i, instant) => { shown[i] = true; setState(groups[i], "is-in", instant); };
  const hide = (i, instant) => {
    shown[i] = false;
    if (instant) { setState(groups[i], null, true); return; }
    setState(groups[i], "is-out", false);
    setTimeout(() => { if (!shown[i]) setState(groups[i], null, true); }, 900);
  };

  let built = false, width = 0;
  const build = () => {
    built = true; width = panel.clientWidth;
    panel.querySelectorAll("[data-sr]").forEach(split); collect();
  };

  return {
    // story times (ms) of the beats, from zoom-story.js once its timeline is built
    setBeats(times) { beatT = times; if (!built) build(); },
    // called on every drawn frame with the story time and mode; instant: no transition
    update(t, mode, instant) {
      if (!built) return;
      for (let i = 0; i < groups.length; i++) {
        const want = mode !== "armed" && t >= beatT[i];
        if (want && !shown[i]) show(i, instant);
        else if (!want && shown[i]) hide(i, instant);
      }
    },
    // the split lines depend on the column's width: split again when it changes
    relayout(force = false) {
      if (!built || (!force && panel.clientWidth === width)) return;
      const was = shown.slice();
      build();
      was.forEach((s, i) => { if (s) show(i, true); });
    },
  };
};
