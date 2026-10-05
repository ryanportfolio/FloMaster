// Screenshots pages at phone and desktop sizes in headed Chrome (offscreen).
// Usage: node scripts/shoot.mjs [--base http://localhost:4321] [--out D:/screenshots/FloMaster/run] [--tags on] path [path ...]
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import fs from "node:fs";

const argv = process.argv.slice(2);
const opt = (name, dflt) => { const i = argv.indexOf(name); if (i < 0) return dflt; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const base = opt("--base", "http://localhost:4321");
const out = opt("--out", "D:/screenshots/FloMaster/latest");
const tags = opt("--tags", "off");
const full = opt("--full", "yes") === "yes";
const paths = argv.length ? argv : ["/"];
fs.mkdirSync(out, { recursive: true });

const viewports = {
  phone: { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

import { startPreview } from "./lib/preview.mjs";
const server = await startPreview(Number(new URL(base).port || 4321));
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "flomasters screenshots" });
try {
  for (const [vp, ctxOpts] of Object.entries(viewports)) {
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    for (const p of paths) {
      const url = `${base}${p}${p.includes("?") ? "&" : "?"}tags=${tags}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const name = (p === "/" ? "home" : p.replace(/^\//, "").replace(/[\/?=&#]/g, "_")) + `-${vp}${tags === "on" ? "-tags" : ""}`;
      await page.screenshot({ path: `${out}/${name}-first.png` });
      if (full) {
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
      }
      console.log("shot", name);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
