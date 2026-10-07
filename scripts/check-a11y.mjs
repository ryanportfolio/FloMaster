// Runs axe-core (local node_modules copy) on every built page, WCAG 2.x A/AA
// rules only, with tags off and on. Reports violations and "incomplete" items
// that need a manual check. Run after `astro build`.
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";
import fs from "node:fs";

const axeSource = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const pages = fs.readdirSync("dist", { recursive: true }).filter((f) => f.endsWith("index.html")).map((f) => "/" + f.replace(/\\/g, "/").replace(/index\.html$/, ""));
const server = await startPreview(4321);
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "axe" });
let violations = 0;
const incomplete = new Map();
try {
  for (const [vp, opts] of [["phone", { viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true }], ["desktop", { viewport: { width: 1440, height: 900 } }]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    for (const tags of ["off", "on"]) {
      for (const p of pages) {
        await page.goto(`${server.base}${p}?tags=${tags}`, { waitUntil: "load" });
        // Contrast is measured on the page at rest: end the load reveal (src/scripts/reveal.js), which
        // holds blocks below the fold at a trace of opacity until they scroll in.
        await page.evaluate(() => window.fmReveal?.finish());
        await page.addScriptTag({ content: axeSource });
        const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
        for (const v of r.violations) {
          violations++;
          console.log(`VIOLATION ${vp} tags=${tags} ${p} ${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}${v.nodes.length > 3 ? ` +${v.nodes.length - 3}` : ""}`);
        }
        for (const i of r.incomplete) incomplete.set(i.id, (incomplete.get(i.id) ?? 0) + i.nodes.length);
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
console.log(`${violations} violations across ${pages.length} pages x 2 viewports x tags off/on`);
console.log("Needs manual check (axe incomplete):", [...incomplete].map(([k, n]) => `${k}=${n}`).join(", ") || "none");
