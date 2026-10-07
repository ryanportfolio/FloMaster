// Lab speed checks on the production build (never the dev server).
// 1) Lighthouse mobile navigation, 3 runs per page, median LCP/CLS/TBT.
// 2) INP stand-in: real taps through booking, ZIP check and tag switch with the
//    CPU slowed 4x; reports the slowest interaction (event timing entries).
// Lab numbers only: field INP/LCP at the 75th percentile exist only after launch.
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";
import lighthouse from "lighthouse";

const PORT = 9333;
const server = await startPreview(4321);
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "perf", args: [`--remote-debugging-port=${PORT}`] });
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
try {
  for (const p of ["/", "/book", "/residential/water-heaters", "/pricing"]) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const r = await lighthouse(`${server.base}${p}`, { port: PORT, output: "json", logLevel: "error", onlyCategories: ["performance"], formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } });
      const a = r.lhr.audits;
      runs.push({ score: r.lhr.categories.performance.score * 100, lcp: a["largest-contentful-paint"].numericValue, cls: a["cumulative-layout-shift"].numericValue, tbt: a["total-blocking-time"].numericValue, bytes: a["total-byte-weight"].numericValue, lcpEl: a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? "" });
    }
    console.log(`${p.padEnd(28)} score ${median(runs.map((r) => r.score))}  LCP ${(median(runs.map((r) => r.lcp)) / 1000).toFixed(2)}s  CLS ${median(runs.map((r) => r.cls)).toFixed(3)}  TBT ${Math.round(median(runs.map((r) => r.tbt)))}ms  weight ${Math.round(median(runs.map((r) => r.bytes)) / 1024)}KB`);
    console.log(`  LCP element: ${runs[0].lcpEl.slice(0, 110)}`);
  }

  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__inp = [];
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (e.interactionId) window.__inp.push({ name: e.name, d: e.duration, t: e.target?.tagName }); }).observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await page.goto(`${server.base}/book`, { waitUntil: "load" });
  await page.tap("label.opt:has(input[value=drains])");
  await page.tap("label.opt:has(input[value=water-heaters])");
  await page.tap("[data-day-panel]:not([hidden]) label.win >> nth=1");
  await page.tap("#street"); await page.keyboard.type("1200 Colonial Ave");
  await page.tap("#zip"); await page.keyboard.type("23517");
  await page.tap("#phone"); await page.keyboard.type("7575550142");
  await page.tap("[data-tag-switch]");
  await page.tap("[data-tag-switch]");
  await page.waitForTimeout(500);
  const book = await page.evaluate(() => window.__inp);
  await page.goto(`${server.base}/`, { waitUntil: "load" });
  await page.tap("#zip-home"); await page.keyboard.type("23320");
  await page.tap("form[data-zipcheck] button");
  await page.focus("[data-story-range]"); await page.keyboard.press("ArrowLeft");
  await page.locator("[data-story] [data-story-stage]").scrollIntoViewIfNeeded();
  await page.tap("[data-story] [data-story-stage]");
  await page.tap("[data-story] [data-go='100']");
  await page.waitForTimeout(500);
  const home = await page.evaluate(() => window.__inp);
  const all = [...book, ...home];
  const worst = all.sort((a, b) => b.d - a.d)[0];
  console.log(`INP stand-in (4x CPU slowdown, ${all.length} slow-ish events >16ms): worst ${worst ? `${Math.round(worst.d)}ms on ${worst.name} ${worst.t}` : "none over 16ms"}`);
  await ctx.close();
} finally {
  await browser.close();
  server.stop();
}
