// Page transition checks (global.css "Page transition", Base.astro head script) in headed Chrome:
// full pass on the first link in a tab, short pass after, dissolve on back, taps right after,
// reduced motion, links that must not transition, the booking hand-off and the prerender rules.
// Run after `astro build`.
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";

const server = await startPreview(4321);
const base = server.base;
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "transition checks" });
const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`); };
const desktop = { viewport: { width: 1440, height: 900 } };
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };

// Every page reports its pageswap, pagereveal, ready and finished to Node, so the record
// survives the navigation that ends the page.
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
      }, () => {});
      vt.finished.then(() => report({ ev: "finished", t: performance.now() - t0 }), () => report({ ev: "skipped" }));
    });
  });
  const page = await ctx.newPage();
  const waitFor = async (pred, ms = 5000) => { const end = Date.now() + ms; while (Date.now() < end) { const hit = log.find(pred); if (hit) return hit; await page.waitForTimeout(25); } return null; };
  return { ctx, page, log, waitFor };
}
// The ready and finished records for the transition into `path` that started after `since`.
async function transitionInto(s, path, since) {
  const ready = await s.waitFor((r) => r.ev === "ready" && r.path === path && r.at >= since);
  const finished = await s.waitFor((r) => (r.ev === "finished" || r.ev === "skipped") && r.path === path && r.at >= since);
  return { ready, finished, ms: finished?.t != null ? Math.round(finished.t - ready.t) : null };
}

try {
  // 1-3. Desktop: full pass, then short pass (prerendered when the rules allow), then back.
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
    check("full pass finishes within about 1.3 s", t.ms != null && t.ms >= 900 && t.ms <= 1300, `${t.ms} ms`);
    await page.waitForTimeout(500);
    check("ring water put away after the pass", await page.evaluate(() => !document.documentElement.dataset.ring && getComputedStyle(document.querySelector(".fm-tide")).display === "none"));

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
    check("short pass is a dissolve of about 400 ms", t.ms != null && t.ms <= 600, `${t.ms} ms`);
    check("short pass swells the ring", t.ready?.ring === "short");

    since = Date.now();
    await page.goBack();
    t = await transitionInto(s, "/pricing", since);
    check("back runs the dissolve only", t.ready?.types?.includes("fm-back") === true && t.ready.tide === "none" && !t.ready.ring, t.ready?.types?.join(","));
    check("back dissolve is about 400 ms", t.ms != null && t.ms <= 600, `${t.ms} ms`);

    // The external DPOR link and tel: never start a view transition.
    await page.goto(`${base}/about`, { waitUntil: "load" });
    await s.ctx.route("https://www.dpor.virginia.gov/**", (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>DPOR stand-in</title><p>stand-in</p>" }));
    since = Date.now();
    await page.click("main a[href*='dpor.virginia.gov']");
    await page.waitForURL(/dpor\.virginia\.gov/);
    await page.waitForTimeout(500);
    check("DPOR link starts no transition", !s.log.some((r) => r.at >= since && (r.vt === true || r.ev === "ready")), page.url());
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
    check("bottom bar hidden on the old page is uncovered with the new page", t.ready?.anims.some((a) => a.includes("fm-bar-in")) === true);
    await page.tap("header .menu summary");
    await page.waitForTimeout(100);
    check("tap right after the transition works (menu opens)", await page.evaluate(() => document.querySelector("header .menu").open));
    await page.tap("header .menu summary");
    check("nothing left over the page after the pass", await page.evaluate(() => {
      const b = document.querySelector("[data-sticky] .btn--primary").getBoundingClientRect();
      return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest("[data-sticky]") !== null;
    }));
    await s.ctx.close();
  }

  // 5. Reduced motion: a dissolve of at most about 250 ms, no band, drop or slosh.
  {
    const s = await context({ ...desktop, reducedMotion: "reduce" });
    const { page } = s;
    await page.goto(`${base}/`, { waitUntil: "load" });
    const since = Date.now();
    await page.click("header nav a[href='/pricing']");
    const t = await transitionInto(s, "/pricing", since);
    check("reduced motion: transition is the calm dissolve", t.ready?.types?.includes("fm-calm") === true, t.ready?.types?.join(","));
    check("reduced motion: no band, no ring water, no drop", t.ready?.tide === "none" && !t.ready.ring && !t.ready.anims.some((a) => /fm-(band|reveal|lw|drop)/.test(a)));
    check("reduced motion: dissolve takes at most about 250 ms", t.ms != null && t.ms <= 260 && t.ready.anims.some((a) => a.includes("fade-in")), `${t.ms} ms`);
    await s.ctx.close();
  }

  // 6. Booking: the scripted move to /book/confirmed still works (no transition, data carried).
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
  await browser.close();
  server.stop();
}
const failed = results.filter((r) => !r).length;
console.log(failed ? `${failed} of ${results.length} transition checks failed` : `all ${results.length} transition checks passed`);
process.exitCode = failed ? 1 : 0;
