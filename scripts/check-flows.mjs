// Drives the booking, callback and tag-switch flows in headed Chrome and
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
  const boxes = async () => page.$$eval("main h2, main table, main .panel", (els) => els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}`; }).join("|"));
  const on = await boxes();
  await page.click("[data-tag-switch]");
  const off = await boxes();
  check("tag switch moves nothing on the page", on === off);
  check("switch updates aria-pressed", (await page.getAttribute("[data-tag-switch]", "aria-pressed")) === "false");

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

  // 7. Before/after slider responds to the keyboard.
  await page.goto(`${base}/`);
  await page.focus("[data-ba-range]");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  check("before/after slider moves with arrow keys", (await page.evaluate(() => document.querySelector("[data-ba]").style.getPropertyValue("--pos"))) === "48%");

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
