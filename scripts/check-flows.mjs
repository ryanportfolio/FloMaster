// Drives the booking, callback, tag-switch and zoom-story flows in headed Chrome and
// reports pass/fail for each check. Run after `astro build`.
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";

const server = await startPreview(4321);
const base = server.base;
const browser = await launchPlacedChrome({ place: "offscreen", purpose: "flow checks" });
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`); };

try {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();

  // 1. Booking: empty submit shows errors and focuses the first problem.
  await page.goto(`${base}/book`);
  await page.click("[data-submit]");
  const summary = await page.textContent("[data-summary]");
  check("empty submit shows an error summary", /5 things need fixing/.test(summary ?? ""), summary?.trim());
  const focusedName = await page.evaluate(() => (document.activeElement)?.getAttribute("name"));
  check("focus moves to the first problem (job)", focusedName === "job", `focused name=${focusedName}`);
  const invalid = await page.$$eval("[aria-invalid=true]", (els) => els.map((e) => e.id));
  check("text fields marked aria-invalid", ["street", "zip", "phone"].every((id) => invalid.includes(id)), invalid.join(","));

  // 2. Errors clear as fields are fixed; price panel shows for the chosen job.
  await page.check("input[name=job][value=water-heaters]", { force: true });
  check("price panel shows the chosen job", (await page.textContent("[data-price-job]"))?.includes("Water heater") ?? false);
  check("job error cleared after choosing", ((await page.textContent("#err-job")) ?? "") === "");
  await page.check("input[name=window] >> nth=1", { force: true });
  await page.fill("#street", "1200 Colonial Ave");
  await page.fill("#zip", "23517");
  check("ZIP check confirms the city", (await page.textContent("[data-zip-status]"))?.includes("Norfolk") ?? false);
  await page.fill("#zip", "90210");
  check("out-of-area ZIP is flagged", (await page.textContent("[data-zip-status]"))?.includes("outside my area") ?? false);
  await page.fill("#zip", "23517");
  await page.fill("#phone", "757 555 0142");

  // 3. Phone carries into the callback form (WCAG 3.3.7).
  check("phone number carried into callback form live, no reload", (await page.inputValue("#cb-book-phone")) === "757 555 0142");
  await page.fill("#cb-book-phone", "757 555 0199");
  check("callback edits flow back to the booking form", (await page.inputValue("#phone")) === "757 555 0199");
  await page.fill("#phone", "757 555 0142");
  const when = (await page.textContent("#callback [data-when]")) ?? "";
  check("callback timing message names a real opening or the callback fact", /call you back within|call you back (today|tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) at \d+ (a|p)\.m\., when I start/.test(when), when.trim());
  await page.reload();
  check("phone number restored after reload", (await page.inputValue("#phone")) === "757 555 0142");
  check("callback form prefilled with the same number", (await page.inputValue("#cb-book-phone")) === "757 555 0142");

  // 4. Submit goes to confirmation with details, none in the URL.
  await page.check("input[name=job][value=water-heaters]", { force: true });
  await page.check("input[name=window] >> nth=1", { force: true });
  await page.fill("#street", "1200 Colonial Ave");
  await page.fill("#zip", "23517");
  await Promise.all([page.waitForURL("**/book/confirmed**"), page.click("[data-submit]")]);
  const url = page.url();
  check("confirmation URL carries no personal data", !/757|Colonial|23517/.test(decodeURIComponent(url)), url);
  const addr = await page.textContent("[data-address]");
  check("confirmation shows the entered address", addr?.includes("1200 Colonial Ave") && addr.includes("Norfolk") || false, addr?.trim());
  check("sample-booking note hidden for a real booking", await page.isHidden("[data-sample]"));
  const ics = await page.evaluate(async () => (await fetch(document.querySelector("[data-ics]").href)).text());
  check("calendar file has a start and end time", /DTSTART:\d{8}T\d{6}Z/.test(ics) && /DTEND:\d{8}T\d{6}Z/.test(ics), (ics.match(/DTSTART:\S+/) ?? [""])[0]);

  // 5. Tags: off by default, ?tags=on turns them on before paint, switch toggles.
  await page.goto(`${base}/pricing`);
  check("tags off by default", !(await page.evaluate(() => document.documentElement.classList.contains("tags-on"))));
  await page.goto(`${base}/pricing?tags=on`);
  check("?tags=on shows tags", await page.evaluate(() => document.documentElement.classList.contains("tags-on")));
  const tagCount = await page.$$eval(".fact-tag", (els) => els.filter((e) => getComputedStyle(e).display !== "none").length);
  check("visible tags on pricing", tagCount > 5, `${tagCount} tags`);
  for (const p of ["/residential", "/"]) {
    await page.goto(`${base}${p}?tags=on`);
    const outlined = await page.$$eval(".fact[data-open]", (els) => els.filter((e) => /\$\d/.test(e.textContent)).length);
    check(`sample prices outlined on ${p}`, outlined >= 5, `${outlined} prices`);
  }
  await page.goto(`${base}/book?tags=on&job=drains`);
  check("booking price summary outlined", (await page.$$eval("[data-price-rows] .fact[data-open]", (els) => els.length)) === 3);
  await page.goto(`${base}/pricing?tags=on`);
  const nested = await page.$$eval("a .fact-tag, button .fact-tag", (els) => els.length);
  check("no tag labels nested in links or buttons", nested === 0, `${nested}`);
  // Labels sit in the text flow (so they never cover a word), which means turning tags on makes room
  // for them. Turning them off must leave the page exactly as a page that never had them on.
  const boxes = async () => page.$$eval("main h2, main table, main .panel", (els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}`; }).join("|"));
  // Any visible "Confirm" label drawn over text outside itself (closed menus and hidden text skipped).
  const covering = () => page.evaluate(() => {
    const out = [];
    const tags = [...document.querySelectorAll(".fact-tag")].filter((t) => getComputedStyle(t).display !== "none" && t.getClientRects().length);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const texts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!n.textContent.trim() || !el || el.closest(".fact-tag, .photo-tag, .visually-hidden, [hidden], template, script, style")) continue;
      if (el.closest("details:not([open])") && !el.closest("summary")) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const rect of r.getClientRects()) if (rect.width > 1 && rect.height > 1) texts.push({ rect, el, t: n.textContent.trim().slice(0, 30) });
    }
    for (const t of tags) {
      const a = t.getBoundingClientRect();
      for (const x of texts) {
        const b = x.rect, w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w <= 2 || h <= 2 || t.contains(x.el)) continue;
        const hit = document.elementFromPoint(Math.max(a.left, b.left) + w / 2, Math.max(a.top, b.top) + h / 2);
        if (hit && t.contains(hit)) out.push(`${t.firstChild.textContent} covers "${x.t}"`);
      }
    }
    return out;
  });
  const coveredPricing = await covering();
  check("no confirm label covers text with tags on (pricing)", coveredPricing.length === 0, coveredPricing.slice(0, 3).join(" | "));
  await page.click("[data-tag-switch]");
  const off = await boxes();
  await page.goto(`${base}/pricing?tags=off`);
  const neverOn = await boxes();
  check("tag switch off leaves the page as it is with tags never on", off === neverOn);
  await page.goto(`${base}/pricing?tags=on`);
  await page.click("[data-tag-switch]");
  check("switch updates aria-pressed", (await page.getAttribute("[data-tag-switch]", "aria-pressed")) === "false");
  for (const p of ["/book?job=drains", "/residential/drains", "/"]) {
    await page.goto(`${base}${p}${p.includes("?") ? "&" : "?"}tags=on`);
    const c = await covering();
    check(`no confirm label covers text with tags on (${p})`, c.length === 0, c.slice(0, 3).join(" | "));
  }

  // 5b. Misleading placeholders (the contractor licence number) appear only with tags on.
  for (const p of ["/about", "/commercial", "/"]) {
    await page.goto(`${base}${p}?tags=off`);
    const offVisible = await page.evaluate(() => document.body.innerText.includes("2705-"));
    await page.goto(`${base}${p}?tags=on`);
    const onVisible = await page.evaluate(() => document.body.innerText.includes("2705-"));
    check(`placeholder contractor licence hidden with tags off, shown with tags on (${p})`, !offVisible && onVisible);
  }
  await page.goto(`${base}/reviews?tags=off`);
  check("reviews page makes no 'I don't pick and choose' claim", !(await page.evaluate(() => document.body.innerText.includes("pick and choose"))));
  check("no relative 'days ago' dates anywhere on home", !(await page.goto(`${base}/`).then(() => page.evaluate(() => /days? ago|weeks? ago/.test(document.body.innerText)))));

  // 6. Sticky bar waits on the home page, shows on inner pages.
  await page.goto(`${base}/`);
  check("sticky bar hidden while hero buttons visible", await page.evaluate(() => document.querySelector("[data-sticky]").classList.contains("is-waiting")));
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(400);
  check("sticky bar appears after scrolling", await page.evaluate(() => !document.querySelector("[data-sticky]").classList.contains("is-waiting")));
  await page.goto(`${base}/faq`);
  check("sticky bar shows from load on FAQ", await page.evaluate(() => !document.querySelector("[data-sticky]").classList.contains("is-waiting")));

  // 7. Zoom story (home): a wheel notch into it starts it and holds the page; a second notch 3 s in
  // ends it (end state) and the page scrolls on; coming back up shows the end state; after leaving
  // upward it plays again; End ends it. Phone: a swipe in starts it, a second swipe 3 s in ends it.
  {
    const st = (p) => p.evaluate(() => ({ mode: window.__zs.mode(), T: Math.round(window.__zs.T()), total: window.__zs.total(), y: Math.round(scrollY), pin: window.__zs.pinY(), why: window.__zs.endWhy()?.why }));
    // just above the point where the story starts (the section's top within 12% of the screen of its pinned place)
    // the story loads at the first scroll (or once it is two screens away)
    const above = async (p) => { await p.evaluate(() => dispatchEvent(new Event("scroll"))); await p.waitForFunction(() => window.__zs); await p.evaluate(() => scrollTo(0, window.__zs.pinY() - Math.round(innerHeight * 0.12) - 40)); };
    const dctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const d = await dctx.newPage();
    await d.goto(`${base}/`);
    await above(d);
    await d.waitForTimeout(600);
    await d.mouse.move(640, 430);
    await d.mouse.wheel(0, 100);
    await d.waitForTimeout(1500);
    let s = await st(d);
    check("zoom story: a wheel notch into it starts it and holds the page", s.mode === "playing" && Math.abs(s.y - s.pin) <= 2 && s.T > 800, `mode=${s.mode} T=${s.T} y-pin=${s.y - s.pin}`);
    await d.waitForTimeout(1500);
    await d.mouse.wheel(0, 100);
    await d.waitForTimeout(1000);
    s = await st(d);
    check("zoom story: a second notch ends it and the page scrolls on", s.mode === "ended" && s.why === "wheel" && s.T === s.total && s.y > s.pin + 20, `mode=${s.mode} why=${s.why} T=${s.T} y-pin=${s.y - s.pin}`);
    await d.mouse.wheel(0, -100);
    await d.waitForTimeout(1200);
    s = await st(d);
    check("zoom story: scrolling back up into it shows the end state", s.mode === "ended" && s.T === s.total && Math.abs(s.y - s.pin) < 200, `mode=${s.mode} T=${s.T} y-pin=${s.y - s.pin}`);
    await d.evaluate(() => scrollTo(0, 0));
    await d.waitForTimeout(500);
    await above(d);
    await d.waitForTimeout(600);
    await d.mouse.wheel(0, 100);
    await d.waitForTimeout(1200);
    const again = (await st(d)).mode;
    await d.keyboard.press("End");
    await d.waitForTimeout(1200);
    s = await st(d);
    const max = await d.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    check("zoom story: plays again after leaving upward; End ends it at the page bottom", again === "playing" && s.mode === "ended" && Math.abs(s.y - max) < 3, `again=${again} mode=${s.mode} y=${s.y} max=${max}`);
    await dctx.close();

    // Touch: phone width, real touch input through the DevTools protocol.
    const tctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const t = await tctx.newPage();
    const cdp = await tctx.newCDPSession(t);
    await t.goto(`${base}/`);
    await above(t);
    await t.waitForTimeout(600);
    const swipe = async (dist) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 230, y: 380 + dist / 2 }] });
      for (let i = 1; i <= 8; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 230, y: 380 + dist / 2 - (i * dist) / 8 }] }); await t.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    await swipe(200);
    await t.waitForTimeout(3000);
    s = await st(t);
    check("zoom story: a swipe into it starts it and holds the page (phone)", s.mode === "playing" && Math.abs(s.y - s.pin) <= 2, `mode=${s.mode} T=${s.T} y-pin=${s.y - s.pin}`);
    await swipe(300);
    await t.waitForTimeout(1200);
    const s2 = await st(t);
    check("zoom story: a second swipe ends it and the page scrolls with it (phone)", s2.mode === "ended" && s2.why === "swipe" && s2.T === s2.total && s2.y > s.y + 50, `mode=${s2.mode} why=${s2.why} y ${s.y} -> ${s2.y}`);
    await tctx.close();
  }

  await ctx.close();

  // 8. Out-of-hours callback message uses the real next opening (Virginia time).
  for (const [iso, want] of [["2026-10-09T19:30:00-04:00", "tomorrow at 8 a.m."], ["2026-10-10T14:00:00-04:00", "Monday at 7 a.m."], ["2026-10-12T05:00:00-04:00", "today at 7 a.m."]]) {
    const c2 = await browser.newContext({ viewport: { width: 375, height: 740 } });
    const p2 = await c2.newPage();
    await p2.clock.setFixedTime(new Date(iso));
    await p2.goto(`${base}/emergency`);
    const msg = (await p2.textContent("[data-when]")) ?? "";
    check(`out-of-hours message at ${iso}`, msg.includes(want), msg.trim());
    await c2.close();
  }
} finally {
  await browser.close();
  server.stop();
}
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `${failed.length} of ${results.length} checks failed` : `all ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
