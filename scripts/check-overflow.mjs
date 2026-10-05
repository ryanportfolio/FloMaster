// Finds horizontal overflow at phone width (320 and 375) on every built page.
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";
import fs from "node:fs";

const pages = fs.readdirSync("dist", { recursive: true }).filter((f) => f.endsWith("index.html")).map((f) => "/" + f.replace(/\\/g, "/").replace(/index\.html$/, ""));
const server = await startPreview(4321);
const base = server.base;
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "overflow check" });
let bad = 0;
try {
  for (const width of [320, 375]) {
    const ctx = await browser.newContext({ viewport: { width, height: 700 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: "load" });
      const res = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        if (document.documentElement.scrollWidth <= vw) return null;
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed") out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} right=${Math.round(r.right)}`);
        }
        return { sw: document.documentElement.scrollWidth, els: out.slice(0, 6) };
      });
      if (res) { bad++; console.log(width, p, res.sw, res.els.join(" | ")); }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.stop();
}
console.log(bad ? `${bad} overflowing page views` : "no horizontal overflow");
