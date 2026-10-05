// Tabs through pages at phone size and checks every focused element has a
// visible focus style and is not hidden under the sticky bar or off screen
// (WCAG 2.4.7, 2.4.11). Also measures interactive target sizes (2.5.8).
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";

const pages = ["/", "/book", "/pricing", "/emergency", "/residential/drains", "/appointment", "/commercial", "/faq"];
const server = await startPreview(4321);
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "keyboard check" });
let problems = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 700 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(server.base + p, { waitUntil: "load" });
    const seen = new Set();
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(30);
      const r = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const bar = document.querySelector("[data-sticky]");
        const barTop = bar && !bar.classList.contains("is-waiting") && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect().top : innerHeight;
        const inBar = bar?.contains(el);
        const id = [...document.querySelectorAll("*")].indexOf(el) + " " + el.outerHTML.slice(0, 70);
        return {
          id,
          outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
          hidden: !inBar && (rect.bottom > barTop + 1 || rect.top < 0) && rect.height > 0,
          small: (rect.width < 24 || rect.height < 24) && !["A"].includes(el.tagName) ? `${Math.round(rect.width)}x${Math.round(rect.height)}` : "",
        };
      });
      if (!r) continue;
      if (seen.has(r.id)) break;
      seen.add(r.id);
      if (!r.outline) { problems++; console.log(`NO FOCUS STYLE ${p}: ${r.id}`); }
      if (r.hidden) { problems++; console.log(`OBSCURED ${p}: ${r.id}`); }
      if (r.small) { problems++; console.log(`SMALL TARGET ${r.small} ${p}: ${r.id}`); }
    }
    console.log(`${p}: ${seen.size} focus stops`);
  }
  // Call buttons must be at least 44x44.
  for (const p of ["/", "/emergency", "/faq"]) {
    await page.goto(server.base + p);
    await page.evaluate(() => scrollTo(0, 1500));
    await page.waitForTimeout(300);
    const sizes = await page.$$eval("a[href^='tel:']", (els) => els.filter((e) => e.offsetParent || getComputedStyle(e).position === "fixed").map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), e.className]; }));
    const smallCall = sizes.filter(([w, h, c]) => (w < 44 || h < 44) && /btn|phone/.test(c));
    if (smallCall.length) { problems++; console.log(`CALL BUTTON UNDER 44px ${p}:`, JSON.stringify(smallCall)); }
    else console.log(`${p}: ${sizes.filter(([, , c]) => /btn|phone/.test(c)).length} call buttons, all >= 44x44`);
  }
  await ctx.close();
} finally {
  await browser.close();
  server.stop();
}
console.log(problems ? `${problems} problems` : "keyboard and target checks passed");
