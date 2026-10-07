// Drives the booking, callback, tag-switch and repair-story flows in headed Chrome and
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

  // 7. Repair story: press anywhere, drag, arrow keys, touch scroll and drag, peek.
  {
    const stageSel = "[data-story] [data-story-stage]";
    const read = (p) => p.evaluate(() => {
      const root = document.querySelector("[data-story]");
      const line = root.querySelector(".rs-divider").getBoundingClientRect();
      return { v: parseFloat(root.style.getPropertyValue("--v")), value: Number(root.querySelector("[data-story-range]").value), stage: root.dataset.stage, lineX: line.left + line.width / 2, peeked: "peeked" in root.dataset, scrollY };
    });
    const near = (a, b, tol) => Math.abs(a - b) <= tol;

    // Mouse: desktop width.
    const dctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const d = await dctx.newPage();
    await d.goto(`${base}/`);
    await d.locator(stageSel).scrollIntoViewIfNeeded();
    await d.waitForTimeout(2200); // let the first-view peek finish
    let box = await d.locator(stageSel).boundingBox();
    const at = (f) => box.x + box.width * f;
    const midY = box.y + box.height / 2;
    await d.mouse.click(at(0.25), midY);
    let r = await read(d);
    check("repair story: pressing anywhere moves the split there", near(r.v, 25, 0.6) && near(r.lineX, at(0.25), 1.5) && r.value === 25, `v=${r.v} line=${r.lineX.toFixed(1)} pointer=${at(0.25).toFixed(1)}`);
    await d.mouse.move(at(0.3), midY);
    await d.mouse.down();
    let follows = true;
    for (const f of [0.38, 0.51, 0.66, 0.88]) {
      await d.mouse.move(at(f), midY + 20, { steps: 4 });
      r = await read(d);
      if (!near(r.lineX, at(f), 1.5)) follows = false;
    }
    await d.mouse.up();
    r = await read(d);
    check("repair story: dragging follows the pointer", follows && near(r.v, 88, 0.6) && r.stage === "3", `v=${r.v} stage=${r.stage}`);
    await d.focus("[data-story-range]");
    const before = (await read(d)).value;
    await d.keyboard.press("ArrowLeft");
    await d.keyboard.press("ArrowLeft");
    r = await read(d);
    check("repair story: arrow keys move the split", r.value === before - 2 && near(r.v, before - 2, 0.01), `${before} -> ${r.value}, --v ${r.v}`);
    await d.click("[data-story] [data-go='0']");
    await d.waitForTimeout(800);
    check("repair story: step buttons move the split", (await read(d)).v === 0);
    await dctx.close();

    // Touch: phone width, real touch input through the DevTools protocol.
    const tctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
    const t = await tctx.newPage();
    const cdp = await tctx.newCDPSession(t);
    await t.goto(`${base}/`);
    await t.locator(stageSel).scrollIntoViewIfNeeded();
    await t.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center" }), stageSel);
    await t.waitForTimeout(2200);
    box = await t.locator(stageSel).boundingBox();
    const touch = async (pts) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pts[0]] });
      for (const p of pts.slice(1)) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] }); await t.waitForTimeout(16); }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await t.waitForTimeout(400);
    };
    const tx = (f) => box.x + box.width * f;
    const ty = box.y + box.height / 2;
    const s0 = await read(t);
    await touch(Array.from({ length: 12 }, (_, i) => ({ x: tx(0.3) + i * 0.3, y: ty - i * 18 })));
    let s1 = await read(t);
    check("repair story: a vertical touch swipe scrolls the page, split stays", s1.scrollY > s0.scrollY + 60 && s1.v === s0.v, `scrollY ${s0.scrollY} -> ${s1.scrollY}, v ${s0.v} -> ${s1.v}`);
    // The swipe can carry the stage up under the sticky top area (taller in prototype builds, with
    // the review bar), so bring it back to the middle before dragging on it.
    await t.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center" }), stageSel);
    await t.waitForTimeout(300);
    box = await t.locator(stageSel).boundingBox();
    await touch(Array.from({ length: 12 }, (_, i) => ({ x: tx(0.3) + (tx(0.75) - tx(0.3)) * (i / 11), y: box.y + box.height / 2 + i * 0.5 })));
    s1 = await read(t);
    check("repair story: a horizontal touch drag moves the split to the finger", near(s1.v, 75, 0.8), `v=${s1.v}`);
    await touch([{ x: tx(0.2), y: box.y + box.height / 2 }]);
    s1 = await read(t);
    check("repair story: a tap moves the split there", near(s1.v, 20, 0.8), `v=${s1.v}`);
    await tctx.close();

    // Peek: once on first view, never under reduced motion.
    for (const motion of ["no-preference", "reduce"]) {
      const mctx = await browser.newContext({ viewport: { width: 375, height: 740 }, reducedMotion: motion });
      const m = await mctx.newPage();
      await m.goto(`${base}/`);
      const start = (await read(m)).v;
      await m.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center" }), stageSel);
      const seen = new Set();
      for (let i = 0; i < 25; i++) { seen.add((await read(m)).v); await m.waitForTimeout(80); }
      await m.waitForTimeout(800);
      const end = await read(m);
      if (motion === "reduce") check("repair story: reduced motion shows no peek", seen.size === 1 && !end.peeked && end.v === start, `${seen.size} positions seen`);
      else check("repair story: first view peeks once and settles", seen.size > 3 && end.peeked && end.v === start, `${seen.size} positions seen, settled at ${end.v}`);
      await mctx.close();
    }

    // Reduced motion switched on after load: before the peek starts, and mid-peek.
    for (const when of ["before", "during"]) {
      const mctx = await browser.newContext({ viewport: { width: 375, height: 740 }, reducedMotion: "no-preference" });
      const m = await mctx.newPage();
      await m.goto(`${base}/`);
      const start = (await read(m)).v;
      if (when === "before") await m.emulateMedia({ reducedMotion: "reduce" });
      await m.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: "center" }), stageSel);
      if (when === "during") {
        let moving = false;
        for (let i = 0; i < 100 && !moving; i++) { moving = (await read(m)).v !== start; if (!moving) await m.waitForTimeout(20); }
        await m.emulateMedia({ reducedMotion: "reduce" });
        await m.waitForTimeout(50);
        const seen = new Set();
        for (let i = 0; i < 15; i++) { seen.add((await read(m)).v); await m.waitForTimeout(60); }
        check("repair story: reduced motion switched on mid-peek stops it at rest", moving && seen.size === 1 && seen.has(start), `moving=${moving}, positions after switch: ${[...seen].join(", ")}`);
      } else {
        const seen = new Set();
        for (let i = 0; i < 25; i++) { seen.add((await read(m)).v); await m.waitForTimeout(80); }
        check("repair story: reduced motion switched on after load blocks the peek", seen.size === 1 && seen.has(start), `${seen.size} positions seen`);
      }
      await mctx.close();
    }
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
