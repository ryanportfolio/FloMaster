// Page transition checks (global.css "Page transition", Base.astro head script) in headed Chrome:
// full pass on the first link in a tab, short pass after, dissolve on back, taps during and right
// after, reduced motion, the band per presented frame (trace filmstrip), its position at set times
// (paused stills), the licence line and the header, tel: links, the booking hand-off and the
// prerender rules. Run after `astro build`.
// Timing bounds are the contract's (.tmp/wow-loop/page-transition/bar.md, T3, T4).
// CHECK_BASE=http://localhost:<port> runs the checks against another served build.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";

let server, browser, base;
const results = [];
const check = (name, ok, detail = "") => { results.push(!!ok); console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`); };
const desktop = { viewport: { width: 1440, height: 900 } };
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const phone1x = { ...phone, deviceScaleFactor: 1 };
const lastNumber = (v) => { const m = String(v).match(/(-?[\d.]+)(?:px)?\)?\s*$/); return m ? +m[1] : NaN; };
const press = (page, opts, sel) => (opts.hasTouch ? page.tap(sel) : page.click(sel));

// Every page reports its pageswap, pagereveal, ready, start, finished and link clicks to Node, so
// the record survives the navigation that ends the page.
async function context(opts) {
  const ctx = await browser.newContext(opts);
  const log = [];
  await ctx.exposeBinding("__vtReport", (_src, r) => { log.push(r); });
  await ctx.addInitScript(() => {
    const report = (o) => { try { window.__vtReport({ ...o, path: location.pathname, at: Date.now() }); } catch {} };
    addEventListener("pageswap", (e) => report({ ev: "swap", vt: !!e.viewTransition }));
    addEventListener("pagereveal", (e) => {
      const vt = e.viewTransition;
      const nav = performance.getEntriesByType("navigation")[0];
      report({ ev: "reveal", vt: !!vt, prerendered: (nav?.activationStart || 0) > 0 });
      if (!vt) return;
      const t0 = performance.now();
      vt.ready.then(() => {
        const tide = document.querySelector(".fm-tide");
        report({
          ev: "ready", t: performance.now() - t0, types: [...vt.types], ring: document.documentElement.dataset.ring || "",
          tide: tide ? getComputedStyle(tide).display : "missing",
          anims: document.getAnimations().map((a) => `${a.effect?.pseudoElement || "el"} ${a.animationName}`),
        });
        // The transition starts in the frame that resolves ready; that frame's timestamp is its start.
        requestAnimationFrame((ts) => report({ ev: "start", t: ts - t0 }));
      }, () => {});
      vt.finished.then(() => report({ ev: "finished", t: performance.now() - t0 }), () => report({ ev: "skipped" }));
    });
    // Link activations; with sessionStorage "check-block-tel" set, a tel: link is recorded but not dialled.
    addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      report({ ev: "click", href: a.getAttribute("href") });
      if (a.href.startsWith("tel:") && sessionStorage.getItem("check-block-tel")) e.preventDefault();
    });
  });
  const page = await ctx.newPage();
  const waitFor = async (pred, ms = 5000) => { const end = Date.now() + ms; while (Date.now() < end) { const hit = log.find(pred); if (hit) return hit; await page.waitForTimeout(25); } return null; };
  return { ctx, page, log, waitFor };
}
// The ready and finished records for the transition into `path` that started after `since`.
async function transitionInto(s, path, since) {
  const ready = await s.waitFor((r) => r.ev === "ready" && r.path === path && r.at >= since);
  const start = await s.waitFor((r) => r.ev === "start" && r.path === path && r.at >= since);
  const finished = await s.waitFor((r) => (r.ev === "finished" || r.ev === "skipped") && r.path === path && r.at >= since);
  return { ready, finished, ms: finished?.t != null && start ? Math.round(finished.t - start.t) : null };
}
// Changed pixels between two PNG buffers of the same size (sum of channel differences over 24).
async function changedPx(a, b) {
  const [x, y] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
  let n = 0;
  for (let i = 0; i < x.data.length; i += x.info.channels) if (Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]) > 24) n++;
  return n;
}
// Paused stills of one transition: pause every transition animation at ready, seek to each time,
// read the band, the reveal edge and the header's group, and grab the named regions ("bottom":
// the last 12 rows, "licence": the licence line, "header": the sticky header); then finish and
// grab the same regions from the settled page.
async function stills(opts, { from, scroll = 0, link, times, full = true, regions = ["bottom"] }) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => {
    addEventListener("pageswap", (e) => { if (e.viewTransition) sessionStorage.setItem("check-old-head", String(document.querySelector(".site-header").getBoundingClientRect().top)); });
    addEventListener("pagereveal", (e) => {
      const vt = e.viewTransition; if (!vt) return;
      vt.ready.then(() => {
        const ours = (a) => { const pe = a.effect && a.effect.pseudoElement; return (pe && pe.startsWith("::view-transition")) || String(a.animationName).startsWith("fm-"); };
        for (const a of document.getAnimations()) if (ours(a)) a.pause();
        window.__seek = (t) => { for (const a of document.getAnimations()) if (ours(a)) { a.pause(); a.currentTime = t; } };
        window.__finish = () => { for (const a of document.getAnimations()) if (ours(a)) a.finish(); };
        window.__types = [...vt.types];
      }, () => {});
    });
  });
  const page = await ctx.newPage();
  const { width: W, height: H } = opts.viewport;
  const rect = (name) => page.evaluate(([name, W, H]) => {
    if (name === "bottom") return { x: 0, y: H - 12, width: W, height: 12 };
    // (the right 8 px are left out: a phone shows its scroll indicator there after scrolling)
    const r = document.querySelector(name === "licence" ? ".license-band" : ".site-header").getBoundingClientRect();
    return { x: 0, y: Math.max(0, Math.round(r.top)), width: W - 8, height: Math.round(r.height) };
  }, [name, W, H]);
  try {
    await page.goto(`${base}${from}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (!full) await page.evaluate(() => sessionStorage.setItem("fm-tide", "1"));
    if (scroll) { await page.evaluate((y) => scrollTo(0, y), scroll); await page.waitForTimeout(300); }
    await press(page, opts, link);
    await page.waitForFunction(() => window.__seek, null, { timeout: 8000 });
    const at = {};
    for (const t of times) {
      await page.evaluate((t) => window.__seek(t), t);
      await page.waitForTimeout(80);
      // getComputedStyle on a view-transition pseudo-element that does not exist crashes Chrome 15x,
      // so the band and the reveal are only read in the full pass.
      at[t] = await page.evaluate((full) => {
        const cs = (p) => getComputedStyle(document.documentElement, p);
        // The reveal is a gradient mask (opaque above the band's center line, clear below, over the
        // feather); its fully opaque edge is the mask image's midpoint less half the feather.
        const reveal = () => {
          const n = cs("::view-transition-new(root)"), px = (v) => parseFloat(String(v).trim().split(/\s+/)[1]);
          const feather = parseFloat(cs().getPropertyValue("--fm-reveal-feather"));
          return px(n.maskPosition) + px(n.maskSize) / 2 - feather / 2;
        };
        return { band: full ? cs("::view-transition-group(fm-tide)").transform : "", opaqueY: full ? reveal() : NaN, head: cs("::view-transition-group(fm-header)").transform };
      }, full);
      at[t].shots = {};
      for (const r of regions) at[t].shots[r] = await page.screenshot({ clip: await rect(r) });
    }
    const info = await page.evaluate(() => ({ types: window.__types, oldHead: +sessionStorage.getItem("check-old-head") }));
    await page.evaluate(() => window.__finish());
    await page.waitForTimeout(1600);
    info.newHead = await page.evaluate(() => document.querySelector(".site-header").getBoundingClientRect().top);
    const settled = {};
    for (const r of regions) settled[r] = await page.screenshot({ clip: await rect(r) });
    for (const t of times) {
      const r = at[t];
      r.changed = {};
      for (const k of regions) r.changed[k] = await changedPx(r.shots[k], settled[k]);
      r.bandY = lastNumber(r.band);
      r.headY = lastNumber(r.head);
    }
    return { ...info, at, H };
  } finally { await ctx.close(); }
}
// Presented frames of a full pass, from the browser's trace screenshots. Per frame, both edges of
// the band: the lowest screen row that differs from the old page (the leading edge) and the highest
// row that differs from the settled new page (the trailing edge). Where the band crosses navy on
// navy, one edge can read short for a frame; a real backward step moves both. With `stall`,
// the new page's main thread is held for 80 ms in its third frame, as on a slow early frame.
async function filmstrip(opts, { link, stall = false }) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript((stall) => addEventListener("pagereveal", (e) => {
    const vt = e.viewTransition; if (!vt) return;
    vt.ready.then(() => requestAnimationFrame(() => {
      performance.mark("check-vt-start");
      // the real slow frame came two frames in, once the band was already on the compositor
      if (stall) requestAnimationFrame(() => requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 80) {} }));
    }), () => {});
  }), stall);
  const page = await ctx.newPage();
  const H = opts.viewport.height;
  const file = path.join(os.tmpdir(), `check-transition-trace-${process.pid}.json`);
  try {
    await page.goto(`${base}/`, { waitUntil: "load" });
    await page.waitForTimeout(500);
    await browser.startTracing(page, { path: file, screenshots: true, categories: ["blink.user_timing", "disabled-by-default-devtools.screenshot"] });
    await press(page, opts, link);
    await page.waitForTimeout(1800);
    await browser.stopTracing();
    const ev = JSON.parse(fs.readFileSync(file, "utf8")).traceEvents;
    const st = ev.filter((e) => e.name === "check-vt-start").map((e) => e.ts).pop();
    const shots = ev.filter((e) => e.name === "Screenshot" && e.args?.snapshot).sort((a, b) => a.ts - b.ts);
    // reference: the old page as last shown before the transition (after the press, so a pressed
    // link's focus ring is not mistaken for the band)
    const pre = shots.filter((s) => (s.ts - st) / 1000 < -10).pop();
    const ref = pre && (await sharp(Buffer.from(pre.args.snapshot, "base64")).raw().toBuffer());
    // the settled new page: the last frame captured after the transition ended
    const post = shots.filter((s) => (s.ts - st) / 1000 > 950).pop();
    const fin = post && (await sharp(Buffer.from(post.args.snapshot, "base64")).raw().toBuffer());
    const series = [];
    for (const s of shots) {
      const rel = Math.round((s.ts - st) / 1000);
      if (rel < 0 || rel > 1150 || !ref || !fin) continue;
      const img = await sharp(Buffer.from(s.args.snapshot, "base64")).raw().toBuffer({ resolveWithObject: true });
      const { width: w, height: h, channels: ch } = img.info;
      const differs = (r, other) => {
        let n = 0, m = 0;
        for (let x = 2; x < w - 12; x += 3) { const k = (r * w + x) * ch; m++; if (Math.abs(img.data[k] - other[k]) + Math.abs(img.data[k + 1] - other[k + 1]) + Math.abs(img.data[k + 2] - other[k + 2]) > 60) n++; }
        return n > m * 0.5;
      };
      const r0 = Math.round(h * 0.2);
      let y = -1, top = -1;
      for (let r = r0; r < h; r++) if (differs(r, ref)) y = r;
      // trailing edge: only known once it is below the first measured row
      for (let r = r0; r < h; r++) if (differs(r, fin)) { top = r > r0 ? r : -1; break; }
      const css = (v) => (v >= 0 ? Math.round((v * H) / h) : -1);
      series.push({ rel, y: css(y), top: css(top) });
    }
    // Backward: the leading edge rising by more than 4 px, or vanishing after it appeared, while it
    // is in the upper three quarters, and the trailing edge (when on screen in both frames) rising too.
    const back = [], gaps = [];
    for (let i = 1; i < series.length; i++) {
      const p = series[i - 1], c = series[i];
      const topBack = !(p.top > 0 && c.top > 0) || c.top < p.top - 4;
      if (p.y > 0 && p.y < H * 0.75 && c.rel < 600 && (c.y < 0 || c.y < p.y - 4) && topBack) back.push(`${p.rel}ms y${p.y} -> ${c.rel}ms ${c.y < 0 ? "gone" : "y" + c.y}`);
      if (p.rel >= 100 && c.rel <= 1100 && c.rel - p.rel > 34) gaps.push(`${p.rel}->${c.rel}ms`);
    }
    return { frames: series.length, back, gaps };
  } finally { fs.rmSync(file, { force: true }); await ctx.close(); }
}

try {
  if (process.env.CHECK_BASE) base = process.env.CHECK_BASE;
  else { server = await startPreview(4321); base = server.base; }
  browser = await launchPlacedChrome({ place: "offscreen", purpose: "transition checks" });

  // 0. Presented frames: the band only ever moves down, and no frame gap over 34 ms after the first
  // 100 ms (T4), at natural speed on desktop and phone, and on desktop with a slow first frame.
  for (const [name, opts, link, stall] of [["desktop", desktop, "header nav a[href='/pricing']", false], ["phone", phone1x, "a.hero-rating", false], ["desktop, 80 ms slow first frame", desktop, "header nav a[href='/pricing']", true]]) {
    const f = await filmstrip(opts, { link, stall });
    check(`filmstrip ${name}: band edge never moves back in the upper three quarters of the screen during the first 600 ms`, f.frames > 40 && f.back.length === 0, `${f.frames} frames${f.back.length ? `; back: ${f.back.join(", ")}` : ""}`);
    if (!stall) check(`filmstrip ${name}: no presented gap over 34 ms after 100 ms`, f.frames > 40 && f.gaps.length === 0, f.gaps.join(", ") || `${f.frames} frames`);
  }

  // 1-3. Desktop: full pass, then short pass (prerender starts on hover), then back.
  {
    const s = await context(desktop);
    const { page } = s;
    await page.goto(`${base}/`, { waitUntil: "load" });
    check("header logo carries the ring water once, footer logo has none", await page.evaluate(() => document.querySelectorAll("#fm-ring-water").length === 1 && !document.querySelector(".site-footer .lw") && !!document.querySelector(".site-header .lw")));
    let since = Date.now();
    await page.click("header nav a[href='/pricing']");
    let t = await transitionInto(s, "/pricing", since);
    check("first link in a tab runs the full pass", t.ready?.types?.includes("fm-full") === true, t.ready?.types?.join(","));
    check("full pass shows the band and runs the reveal", t.ready?.tide === "block" && t.ready.anims.some((a) => a.includes("fm-band")) && t.ready.anims.some((a) => a.includes("fm-reveal")), t.ready?.tide);
    check("full pass starts the ring water and drop", t.ready?.ring === "full" && t.ready.anims.some((a) => a.includes("fm-lw-level-full")) && t.ready.anims.some((a) => a.includes("fm-drop-fall")));
    check("full pass finishes 1040 to 1200 ms after it starts", t.ms != null && t.ms >= 1040 && t.ms <= 1200, `${t.ms} ms`);
    // Nothing of the transition left on the page: no band, no view-transition animations, and the
    // bottom rows right after it ends match the settled page.
    const W = desktop.viewport.width, H = desktop.viewport.height, rows = { x: 0, y: H - 12, width: W, height: 12 };
    const justAfter = await page.screenshot({ clip: rows });
    const leftovers = await page.evaluate(() => ({ tide: getComputedStyle(document.querySelector(".fm-tide")).display, vt: document.getAnimations().filter((a) => a.effect?.pseudoElement?.startsWith("::view-transition")).length }));
    await page.waitForTimeout(700);
    const afterPx = await changedPx(justAfter, await page.screenshot({ clip: rows }));
    check("nothing of the band left after the pass", leftovers.tide === "none" && leftovers.vt === 0 && afterPx === 0, `band display ${leftovers.tide}, ${leftovers.vt} animations, ${afterPx} bottom-row px changed`);
    check("ring water put away after the pass", await page.evaluate(() => !document.documentElement.dataset.ring));

    // Speculation rules: valid, and they cover inner pages but not /, /book* or /emergency.
    const cdp = await s.ctx.newCDPSession(page);
    const sources = [], ruleErrors = [], prerender = {};
    cdp.on("Preload.preloadingAttemptSourcesUpdated", (e) => { sources.length = 0; sources.push(...e.preloadingAttemptSources.map((x) => new URL(x.key.url).pathname)); });
    cdp.on("Preload.ruleSetUpdated", (e) => { if (e.ruleSet.errorType) ruleErrors.push(e.ruleSet.errorMessage || e.ruleSet.errorType); });
    cdp.on("Preload.prerenderStatusUpdated", (e) => { prerender[new URL(e.key.url).pathname] = e.status + (e.prerenderStatus ? ` ${e.prerenderStatus}` : "") + (e.disallowedMojoInterface ? ` ${e.disallowedMojoInterface}` : ""); });
    await cdp.send("Preload.enable");
    await page.waitForTimeout(400);
    check("speculation rules parse without errors", ruleErrors.length === 0, ruleErrors.join("; "));
    const bad = sources.filter((p) => p === "/" || p.startsWith("/book") || p.startsWith("/emergency"));
    check("prerender candidates exclude /, /book* and /emergency", sources.length > 0 && bad.length === 0, `${sources.length} candidates${bad.length ? `, bad: ${bad.join(" ")}` : ""}`);
    check("prerender candidates include inner pages", ["/reviews", "/about", "/faq"].every((p) => sources.includes(p)));

    await page.hover("header nav a[href='/reviews']");
    for (let i = 0; i < 60 && !/^(Ready|Failure)/.test(prerender["/reviews"] || ""); i++) await page.waitForTimeout(50);
    since = Date.now();
    await page.click("header nav a[href='/reviews']");
    t = await transitionInto(s, "/reviews", since);
    const reveal = await s.waitFor((r) => r.ev === "reveal" && r.path === "/reviews" && r.at >= since - 5000);
    // Chrome never activates a prerender while automation is attached (PrerenderingDisabledByDevTools),
    // so this confirms the rules start one on hover; activation needs a manual check in plain Chrome.
    check("hovering an inner link starts a prerender", !!prerender["/reviews"] && (reveal?.prerendered || /Ready|PrerenderingDisabledByDevTools/.test(prerender["/reviews"])), `status ${prerender["/reviews"]}`);
    check("later links run the short pass", t.ready?.types?.includes("fm-short") === true && t.ready.tide === "none", t.ready?.types?.join(","));
    check("short pass is a dissolve of 380 to 460 ms", t.ms != null && t.ms >= 380 && t.ms <= 460, `${t.ms} ms`);
    check("short pass swells the ring", t.ready?.ring === "short");

    since = Date.now();
    await page.goBack();
    t = await transitionInto(s, "/pricing", since);
    check("back runs the dissolve only", t.ready?.types?.includes("fm-back") === true && t.ready.tide === "none" && !t.ready.ring, t.ready?.types?.join(","));
    check("back dissolve is 380 to 460 ms", t.ms != null && t.ms >= 380 && t.ms <= 460, `${t.ms} ms`);

    // No check for the external DPOR link: browsers never run a view transition across origins, so
    // such a check could not fail. A tel: link stays on the page, so that one can.
    // tel: last: Chrome then holds an "open this app?" prompt that blocks later navigations.
    await page.goto(`${base}/about`, { waitUntil: "load" });
    since = Date.now();
    await page.click("header a.phone");
    await page.waitForTimeout(1200);
    check("tel: link starts no transition and stays on the page", !s.log.some((r) => r.at >= since && (r.ev === "swap" || r.ev === "ready")) && new URL(page.url()).pathname.startsWith("/about"));
    await s.ctx.close();
  }

  // 4. Phone: bar hidden on the old page arrives with the new page; taps work right after.
  {
    const s = await context(phone);
    const { page } = s;
    await page.goto(`${base}/`, { waitUntil: "load" });
    const since = Date.now();
    await page.tap("a.hero-rating");
    const t = await transitionInto(s, "/reviews", since);
    check("phone full pass runs", t.ready?.types?.includes("fm-full") === true, `${t.ms} ms`);
    check("phone full pass finishes 1040 to 1200 ms after it starts", t.ms != null && t.ms >= 1040 && t.ms <= 1200, `${t.ms} ms`);
    check("bottom bar hidden on the old page is uncovered with the new page", t.ready?.anims.some((a) => a.includes("fm-bar-in")) === true);
    await page.tap("header .menu summary");
    await page.waitForTimeout(100);
    check("tap right after the transition works (menu opens)", await page.evaluate(() => document.querySelector("header .menu").open));
    await page.tap("header .menu summary");
    check("bottom bar's Book button takes the tap after the pass", await page.evaluate(() => {
      const b = document.querySelector("[data-sticky] .btn--primary").getBoundingClientRect();
      const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      return !!hit && !!hit.closest("[data-sticky] .btn--primary");
    }));
    await s.ctx.close();
  }

  // 4b. Taps during the full pass reach the link under the finger, once: Call (tel:) and a link to
  // another page, by touch and by mouse. tel: is recorded, not dialled.
  for (const [name, opts, from, firstLink, target, expect] of [
    ["phone tap on the header Call", phone, "/", "a.hero-rating", "header a.phone", "tel"],
    ["desktop click on the header phone number", desktop, "/", "header nav a[href='/pricing']", "header a.phone", "tel"],
    ["desktop click on About", desktop, "/", "header nav a[href='/pricing']", "header nav a[href='/about']", "/about"],
    ["phone tap on the bottom bar's Call", phone, "/faq", "footer a[href='/pricing']", "[data-sticky] .btn--signal", "tel"],
    ["phone tap on the leaving bottom bar's Book", phone, "/faq", "header a.brand", "[data-sticky] .btn--primary", "/book"],
  ]) {
    const s = await context(opts);
    const { page } = s;
    await page.goto(`${base}${from}`, { waitUntil: "load" });
    await page.evaluate(() => sessionStorage.setItem("check-block-tel", "1"));
    if (from === "/faq") { await page.evaluate(() => scrollTo(0, 600)); await page.waitForTimeout(400); }
    // the overlay takes hit testing, so press where the target is on screen (as the visitor sees it)
    const box = await page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, target);
    const since = Date.now();
    await press(page, opts, firstLink);
    const ready = await s.waitFor((r) => r.ev === "ready" && r.at >= since);
    await page.waitForTimeout(300);
    const at = Date.now();
    if (opts.hasTouch) await page.touchscreen.tap(box.x, box.y); else await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(1500);
    const clicks = s.log.filter((r) => r.ev === "click" && r.at >= at);
    const ok = expect === "tel" ? clicks.filter((c) => c.href.startsWith("tel:")).length === 1 : new URL(page.url()).pathname === expect && clicks.filter((c) => c.href === expect).length <= 1;
    check(`during the full pass, ${name} works once`, !!ready?.types?.includes("fm-full") && ok, `${clicks.map((c) => c.href).join(" ") || "no link activated"}; now on ${new URL(page.url()).pathname}`);
    await s.ctx.close();
  }

  // 5. Reduced motion: a dissolve of at most 250 ms, no band, drop or slosh.
  {
    const s = await context({ ...desktop, reducedMotion: "reduce" });
    const { page } = s;
    await page.goto(`${base}/`, { waitUntil: "load" });
    const since = Date.now();
    await page.click("header nav a[href='/pricing']");
    const t = await transitionInto(s, "/pricing", since);
    check("reduced motion: transition is the calm dissolve", t.ready?.types?.includes("fm-calm") === true, t.ready?.types?.join(","));
    check("reduced motion: no band, no ring water, no drop", t.ready?.tide === "none" && !t.ready.ring && !t.ready.anims.some((a) => /fm-(band|reveal|lw|drop)/.test(a)));
    check("reduced motion: dissolve takes at most 250 ms", t.ms != null && t.ms <= 250 && t.ready.anims.some((a) => a.includes("fade-in")), `${t.ms} ms`);
    await s.ctx.close();
  }

  // 6. Band position from paused stills: the screen below the header is uncovered by 800 ms, and
  // the band is wholly below the screen by 1000 ms (its top wet line sits 1 px inside its box), with
  // the bottom rows matching the settled page; the phone run goes to a page without the bottom bar
  // (home at the top) at full pixel density, so nothing can hide under the bar. The licence line
  // under the header never goes under the water (T6): unchanged at 50 and 120 ms.
  for (const [name, opts, from, link] of [["desktop", desktop, "/", "header nav a[href='/pricing']"], ["phone", phone, "/reviews", "header a.brand"]]) {
    const r = await stills(opts, { from, link, times: [50, 120, 800, 1000], regions: ["bottom", "licence"] });
    check(`${name}: licence line stays above the water (50 and 120 ms)`, r.at[50].changed.licence === 0 && r.at[120].changed.licence === 0, `${r.at[50].changed.licence} and ${r.at[120].changed.licence} px differ from the settled line`);
    check(`${name}: screen below the header uncovered by 800 ms`, r.at[800].opaqueY >= r.H, `new page fully opaque down to ${Math.round(r.at[800].opaqueY)} of ${r.H} px`);
    check(`${name}: band fully off the screen by 1000 ms`, r.at[1000].bandY + 1 >= r.H && r.at[1000].changed.bottom === 0, `band top ${r.at[1000].bandY} of ${r.H} px, ${r.at[1000].changed.bottom} bottom-row px differ from the settled page`);
  }

  // 7. From a scrolled page the header must sit exactly where it sat, in every pass, and under
  // reduced motion the sticky area must show one header only: pixel for pixel the settled header
  // at 60 and 100 ms (two headers cross-fading would differ).
  for (const [name, opts, args] of [
    ["desktop full pass", desktop, { from: "/", scroll: 1400, link: "header nav a[href='/pricing']", times: [0, 1040] }],
    ["phone short pass", phone1x, { from: "/pricing", scroll: 600, link: "footer a[href='/faq']", times: [0, 400], full: false }],
    ["phone reduced motion", { ...phone1x, reducedMotion: "reduce" }, { from: "/pricing", scroll: 600, link: "footer a[href='/faq']", times: [0, 60, 100], full: false, regions: ["header"] }],
    ["desktop reduced motion", { ...desktop, reducedMotion: "reduce" }, { from: "/pricing", scroll: 1500, link: "header nav a[href='/about']", times: [0, 60, 100], full: false, regions: ["header"] }],
  ]) {
    const r = await stills(opts, args);
    const ys = args.times.map((t) => r.at[t].headY);
    check(`scrolled start, ${name}: header never moves`, Math.abs(r.newHead - r.oldHead) <= 1 && ys.every((y) => Math.abs(y - r.oldHead) <= 1), `old top ${r.oldHead}, new top ${Math.round(r.newHead)}, group at ${ys.join(", ")} (${(r.types || []).join(",")})`);
    if (args.regions?.includes("header")) check(`scrolled start, ${name}: one header only`, args.times.slice(1).every((t) => r.at[t].changed.header === 0), args.times.slice(1).map((t) => `${r.at[t].changed.header} px at ${t} ms`).join(", "));
  }

  // 8. Booking: the scripted move to /book/confirmed still works.
  {
    const s = await context(phone);
    const { page } = s;
    await page.goto(`${base}/book`, { waitUntil: "load" });
    await page.check("input[name=job][value=water-heaters]", { force: true });
    await page.check("input[name=window] >> nth=1", { force: true });
    await page.fill("#street", "1200 Colonial Ave");
    await page.fill("#zip", "23517");
    await page.fill("#phone", "757 555 0142");
    const since = Date.now();
    await Promise.all([page.waitForURL("**/book/confirmed**"), page.click("[data-submit]")]);
    await page.waitForLoadState("load");
    check("booking submit reaches /book/confirmed", new URL(page.url()).pathname.startsWith("/book/confirmed"));
    check("confirmation shows the booking", ((await page.textContent("[data-address]")) ?? "").includes("1200 Colonial Ave"));
    // Chrome treats this location.href (inside the submit's user activation) as a transition-worthy
    // navigation, so the confirmation may arrive with the pass; either way it must finish cleanly.
    const rev = await s.waitFor((r) => r.ev === "reveal" && r.path.startsWith("/book/confirmed") && r.at >= since, 2000);
    const end = rev?.vt ? await s.waitFor((r) => (r.ev === "finished" || r.ev === "skipped") && r.path.startsWith("/book/confirmed") && r.at >= since, 3000) : null;
    check("hand-off to the confirmation ends cleanly", rev && (!rev.vt || end?.ev === "finished"), rev?.vt ? `arrives with a transition, finished in ${Math.round(end?.t ?? -1)} ms` : "plain load");
    await s.ctx.close();
  }
} finally {
  try { if (browser) await browser.close(); } catch (e) { console.log(`browser close failed: ${e.message}`); }
  finally { server?.stop(); }
}
const failed = results.filter((r) => !r).length;
console.log(failed ? `${failed} of ${results.length} transition checks failed` : `all ${results.length} transition checks passed`);
process.exitCode = failed ? 1 : 0;
