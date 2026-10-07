// Load reveal checks (src/scripts/reveal.js, global.css "Load reveal") in headed Chrome, phone and
// desktop: tier order as it shows on screen, the first screen at rest by the planned end, no layout
// shift, presented frames at 4x CPU on phone, no script, reduced motion (the same reveal plays),
// taps on Call during the reveal, the replay button, the X-ray find, the sticky bar and the admin
// page left out. Run after `astro build`.
// CHECK_BASE=http://localhost:<port> runs the checks against another served build.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { launchPlacedChrome } from "./lib/launch-chrome.mjs";
import { startPreview } from "./lib/preview.mjs";

let server, browser, base;
const results = [];
const check = (name, ok, detail = "") => { results.push(!!ok); console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`); };
const desktop = { name: "desktop", viewport: { width: 1440, height: 900 } };
const phone = { name: "phone", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const PAGES = ["/", "/pricing", "/about", "/service-area", "/emergency", "/book", "/reviews"];
const FRAME = 17; // one frame of tolerance on the order of tiers

// Per frame from the reveal's start: when each logged element first shows (opacity above 0.05
// through its ancestors; for the split headline, its first glyph), the last frame a reveal
// animation was still running in the viewport, and the layout shift total.
const probe = () => {
  window.__cls = 0;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  window.__seen = new Map();
  window.__lastRun = 0;
  const shown = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
  const tick = () => {
    const r = window.fmReveal;
    if (r && r.t0) {
      const t = performance.now() - r.t0;
      for (const l of r.log) {
        if (window.__seen.has(l.el)) continue;
        const parts = l.el.querySelector(".rv-c") ? [...l.el.querySelectorAll(".rv-c")] : [l.el];
        if (parts.some((p) => shown(p) > 0.05)) window.__seen.set(l.el, t);
      }
      const main = document.getElementById("main");
      const running = document.getAnimations().some((a) => a.id === "fm-reveal" && a.playState === "running" && a.effect?.target && main.contains(a.effect.target) && (() => { const b = a.effect.target.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; })());
      if (running) window.__lastRun = t;
      if (t > 4000) return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    (window.__clicks ||= []).push({ href: a?.getAttribute("href") || null, t: window.fmReveal ? performance.now() - window.fmReveal.t0 : -1, id: a?.dataset.checkId || null });
    if (a?.href.startsWith("tel:") || a?.getAttribute("href") === "/book") e.preventDefault();
  }, true);
};

// What the first screen looks like for opacity, translate, filter and clip-path, element by element.
// The X-ray hero is left out: its find moves and shows its note on its own after load.
const restState = (page) => page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("#main *")) {
    if (el.closest("[data-xray]")) continue;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height || b.bottom < 0 || b.top > innerHeight) continue;
    const cs = getComputedStyle(el);
    out.push(`${cs.opacity}|${cs.translate}|${cs.filter}|${cs.clipPath}`);
  }
  return out;
});

async function reveal(opts, p, extra = {}) {
  const ctx = await browser.newContext({ ...opts, ...extra });
  await ctx.addInitScript(probe);
  const page = await ctx.newPage();
  try {
    await page.goto(base + p, { waitUntil: "load" });
    await page.waitForFunction(() => window.fmReveal?.t0 > 0, null, { timeout: 5000 });
    const plan = await page.evaluate(() => {
      const log = window.fmReveal.log.filter((l) => l.tier <= 5);
      return { log: log.map((l) => ({ tier: l.tier, at: l.at, end: l.end, what: l.el.tagName.toLowerCase() + (l.el.className ? "." + String(l.el.className).split(" ")[0] : "") })), split: window.fmReveal.split, end: Math.max(0, ...log.map((l) => l.end)) };
    });
    // the planned end, then a little for the last frame to land
    await page.waitForFunction((end) => performance.now() - window.fmReveal.t0 > end + 60, plan.end, { timeout: 8000 });
    const atEnd = await restState(page);
    await page.waitForTimeout(1500);
    const later = await restState(page);
    const m = await page.evaluate(() => ({
      seen: window.fmReveal.log.filter((l) => l.tier <= 5).map((l) => ({ tier: l.tier, at: l.at, t: window.__seen.has(l.el) ? Math.round(window.__seen.get(l.el)) : null })),
      lastRun: Math.round(window.__lastRun), cls: window.__cls,
    }));
    const changed = atEnd.length !== later.length ? -1 : atEnd.filter((s, i) => s !== later[i]).length;
    return { plan, m, changed, page, ctx };
  } catch (err) { await ctx.close(); throw err; }
}

function orderOf(rows, key) {
  const first = {};
  for (const r of rows) if (r[key] != null) first[r.tier] = Math.min(first[r.tier] ?? Infinity, r[key]);
  const tiers = Object.keys(first).map(Number).sort((a, b) => a - b);
  const bad = [];
  for (let i = 1; i < tiers.length; i++) if (first[tiers[i]] < first[tiers[i - 1]] - (key === "t" ? FRAME : 0)) bad.push(`tier ${tiers[i]} at ${first[tiers[i]]} before tier ${tiers[i - 1]} at ${first[tiers[i - 1]]}`);
  return { first, tiers, bad };
}

// Presented frames from the trace filmstrip at 4x CPU: no gap over 34 ms between 100 ms and the
// end of the first-screen reveal.
async function frames(opts, p) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const file = path.join(os.tmpdir(), `check-reveal-trace-${process.pid}.json`);
  try {
    await page.goto("about:blank");
    await browser.startTracing(page, { path: file, screenshots: true, categories: ["blink.user_timing", "disabled-by-default-devtools.screenshot"] });
    await page.goto(base + p, { waitUntil: "load" });
    await page.waitForFunction(() => window.fmReveal?.t0 > 0, null, { timeout: 8000 });
    const end = await page.evaluate(() => Math.max(0, ...window.fmReveal.log.filter((l) => l.tier <= 5).map((l) => l.end)));
    await page.waitForTimeout(end + 400);
    await browser.stopTracing();
    const ev = JSON.parse(fs.readFileSync(file, "utf8")).traceEvents;
    const st = ev.filter((e) => e.name === "fm-reveal-start").map((e) => e.ts).pop();
    const shots = ev.filter((e) => e.name === "Screenshot").map((e) => Math.round((e.ts - st) / 1000)).sort((a, b) => a - b);
    const win = shots.filter((t) => t >= 0 && t <= end);
    const gaps = [];
    for (let i = 1; i < win.length; i++) if (win[i - 1] >= 100 && win[i] - win[i - 1] > 34) gaps.push(`${win[i - 1]}->${win[i]}ms`);
    const worst = Math.max(0, ...win.slice(1).map((t, i) => (win[i] >= 100 ? t - win[i] : 0)));
    return { n: win.length, gaps, worst, end };
  } finally { fs.rmSync(file, { force: true }); await ctx.close(); }
}

try {
  if (process.env.CHECK_BASE) base = process.env.CHECK_BASE;
  else { server = await startPreview(4321); base = server.base; }
  browser = await launchPlacedChrome({ place: "offscreen", purpose: "check-reveal" });

  // 1. Tier order, rest by the planned end, layout shift, on every page at both sizes
  for (const opts of [phone, desktop]) {
    for (const p of PAGES) {
      const r = await reveal(opts, p);
      const plan = orderOf(r.plan.log, "at");
      const shown = orderOf(r.m.seen, "t");
      const missing = r.m.seen.filter((s) => s.t == null).length;
      const summary = plan.tiers.map((t) => `t${t} ${plan.first[t]}/${shown.first[t] ?? "-"}`).join(" ");
      check(`${opts.name} ${p}: tiers start in order, planned and on screen`, plan.bad.length === 0 && shown.bad.length === 0 && missing === 0 && plan.tiers[0] === 1, `${summary} ms (planned/shown)${[...plan.bad, ...shown.bad].length ? "; " + [...plan.bad, ...shown.bad].join("; ") : ""}${missing ? `; ${missing} never shown` : ""}; headline ${r.plan.split}`);
      check(`${opts.name} ${p}: first screen at rest by the planned end`, r.changed === 0 && r.m.lastRun <= r.plan.end + 34, `planned end ${r.plan.end} ms, last reveal frame ${r.m.lastRun} ms, ${r.changed} elements changed after it`);
      check(`${opts.name} ${p}: no layout shift`, r.m.cls <= 0.001, `CLS ${r.m.cls.toFixed(4)}`);
      await r.ctx.close();
    }
  }

  // 2. Presented frames at 4x CPU on phone
  for (const p of ["/", "/pricing", "/about", "/service-area"]) {
    const f = await frames(phone, p);
    check(`phone 4x CPU ${p}: no presented gap over 34 ms after 100 ms`, f.n > 10 && f.gaps.length === 0, `${f.n} frames to ${f.end} ms, worst gap ${f.worst} ms${f.gaps.length ? "; " + f.gaps.join(", ") : ""}`);
  }

  // 3. No script: everything shows at once. Elements the design keeps faint (the stacked repair
  //    photos, a dimmed line) are faint with scripting too, once the reveal is over; only an element
  //    faint without scripting and not with it counts.
  const faded = (page) => page.evaluate(() => [...document.querySelectorAll("#main h1, #main h2, #main h3, #main p, #main a, #main img, #main li")].filter((e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o < 0.99 && e.getBoundingClientRect().width; }).map((e) => e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0]));
  for (const opts of [phone, desktop]) {
    const ctx = await browser.newContext({ ...opts, javaScriptEnabled: false });
    const page = await ctx.newPage();
    const js = await browser.newContext(opts);
    const jsPage = await js.newPage();
    for (const p of ["/", "/about", "/pricing"]) {
      await page.goto(base + p, { waitUntil: "load" });
      const s = await page.evaluate(() => ({ rv: document.documentElement.classList.contains("fm-rv"), main: getComputedStyle(document.getElementById("main")).opacity }));
      const off = await faded(page);
      await jsPage.goto(base + p, { waitUntil: "load" });
      await jsPage.waitForFunction(() => window.fmReveal?.t0 > 0 && performance.now() - window.fmReveal.t0 > 1600);
      const on = await faded(jsPage);
      const extra = off.filter((x) => !on.includes(x));
      check(`${opts.name} no script ${p}: everything visible at once`, !s.rv && s.main === "1" && extra.length === 0, `main opacity ${s.main}; faint by design either way: ${off.length}; faint only without scripting: ${extra.join(", ") || "none"}`);
    }
    await ctx.close();
    await js.close();
  }

  // 4. Reduced motion: the same reveal plays and ends with everything visible
  for (const opts of [phone, desktop]) {
    for (const p of ["/", "/about"]) {
      const r = await reveal(opts, p, { reducedMotion: "reduce" });
      const plan = orderOf(r.plan.log, "at");
      const shown = orderOf(r.m.seen, "t");
      check(`${opts.name} reduced motion ${p}: the same reveal plays, in order, and ends at rest`, r.plan.log.length > 2 && r.plan.split === "glyphs" && plan.bad.length === 0 && shown.bad.length === 0 && r.changed === 0, `${r.plan.log.length} parts, headline ${r.plan.split}, end ${r.plan.end} ms, ${r.changed} changed after`);
      await r.ctx.close();
    }
  }

  // 5. Taps on Call during the reveal reach it (phone): the hero's Call while it is still arriving,
  //    the header's Call in the first frames
  for (const p of ["/", "/emergency", "/residential", "/commercial"]) {
    const ctx = await browser.newContext(phone);
    await ctx.addInitScript(probe);
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: "commit" });
    await page.waitForFunction(() => window.fmReveal?.t0 > 0, null, { timeout: 8000 });
    const target = await page.evaluate(() => {
      const a = document.querySelector("[data-hero-actions] a[href^='tel:']");
      if (!a) return null;
      a.dataset.checkId = "hero-call";
      const l = window.fmReveal.log.find((x) => x.el === a);
      return l ? { at: l.at, end: l.end } : null;
    });
    if (!target) { check(`phone ${p}: hero Call found in the reveal`, false); await ctx.close(); continue; }
    await page.waitForFunction((at) => performance.now() - window.fmReveal.t0 > at + 120, target.at);
    const box = await page.evaluate(() => { const b = document.querySelector("[data-check-id='hero-call']").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, running: document.querySelector("[data-check-id='hero-call']").getAnimations().some((a) => a.playState === "running"), t: Math.round(performance.now() - window.fmReveal.t0) }; });
    await page.touchscreen.tap(box.x, box.y);
    await page.waitForTimeout(150);
    const clicks = await page.evaluate(() => window.__clicks || []);
    const hit = clicks.find((c) => c.id === "hero-call");
    check(`phone ${p}: a tap on the hero Call while it arrives reaches it`, box.running && !!hit && hit.href.startsWith("tel:"), `tapped at ${box.t} ms (its reveal ${target.at} to ${target.end} ms), ${clicks.length} click(s)${hit ? ", reached " + hit.href : ""}`);
    await ctx.close();
  }
  {
    const ctx = await browser.newContext(phone);
    await ctx.addInitScript(probe);
    const page = await ctx.newPage();
    await page.goto(base + "/pricing", { waitUntil: "commit" });
    await page.waitForFunction(() => window.fmReveal?.t0 > 0, null, { timeout: 8000 });
    await page.tap(".site-header a.phone");
    const clicks = await page.evaluate(() => window.__clicks || []);
    check("phone /pricing: a tap on the header Call in the first frames reaches it", clicks.some((c) => c.href?.startsWith("tel:")), clicks.map((c) => `${c.href} at ${Math.round(c.t)} ms`).join(", "));
    await ctx.close();
  }

  // 6. Replay button (prototype review bar): plays again from the top and ends at rest
  {
    const ctx = await browser.newContext(desktop);
    await ctx.addInitScript(probe);
    const page = await ctx.newPage();
    await page.goto(base + "/pricing", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(400);
    const t0 = await page.evaluate(() => window.fmReveal.t0);
    const btn = await page.$("[data-replay]");
    if (btn) {
      await btn.click();
      await page.waitForFunction((t) => window.fmReveal.t0 > t, t0, { timeout: 3000 }).catch(() => {});
      const s = await page.evaluate(() => ({ again: window.fmReveal.t0, y: scrollY, n: window.fmReveal.log.length, end: Math.max(0, ...window.fmReveal.log.filter((l) => l.tier <= 5).map((l) => l.end)) }));
      await page.waitForTimeout(s.end + 200);
      const atEnd = await restState(page);
      await page.waitForTimeout(1000);
      const changed = (await restState(page)).filter((x, i, a) => x !== atEnd[i]).length;
      check("desktop /pricing: Replay page reveal plays again from the top and ends at rest", s.again > t0 && s.y === 0 && s.n > 2 && changed === 0, `scroll ${s.y}, ${s.n} parts, ${changed} changed after`);
    } else check("desktop /pricing: Replay page reveal button present", false);
    await ctx.close();
  }

  // 7. The X-ray find still plays once on its own (desktop home) and ends on the leak
  {
    const ctx = await browser.newContext(desktop);
    await ctx.addInitScript(probe);
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "load" });
    await page.waitForFunction(() => window.fmReveal?.t0 > 0);
    const found = await page.waitForFunction(() => sessionStorage.getItem("fm-xray-found") === "1" && performance.now() - window.fmReveal.t0, null, { timeout: 8000, polling: 16 }).then((h) => h.jsonValue()).catch(() => null);
    const photo = await page.evaluate(() => window.fmReveal.log.find((l) => l.el.querySelector?.("[data-xray]"))?.end ?? null);
    await page.waitForTimeout(2600);
    const atLeak = await page.evaluate(() => document.querySelector("[data-xray-note]")?.textContent?.trim().slice(0, 40));
    check("desktop /: the X-ray find still plays on its own and ends on the leak", found != null && /Found it/.test(atLeak || ""), `find started ${found == null ? "never" : Math.round(found) + " ms"} after the reveal began, photo fully in by ${photo} ms${found != null && photo != null && found < photo ? " (the find starts while the photo is still arriving)" : ""}; note: ${atLeak}`);
    await ctx.close();
  }

  // 8. Sticky bar on phone home: waits while the hero's own Call and Book are on screen
  {
    const ctx = await browser.newContext(phone);
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const waiting = await page.evaluate(() => document.querySelector("[data-sticky]").classList.contains("is-waiting"));
    await page.evaluate(() => scrollTo(0, document.querySelector("[data-hero-actions]").getBoundingClientRect().bottom + scrollY + 50));
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => document.querySelector("[data-sticky]").classList.contains("is-waiting"));
    check("phone /: sticky bar waits for the hero actions, then shows", waiting && !after, `at load ${waiting ? "waiting" : "shown"}, after scroll ${after ? "waiting" : "shown"}`);
    await ctx.close();
  }

  // 9. The admin page has no reveal
  {
    const ctx = await browser.newContext(phone);
    const page = await ctx.newPage();
    await page.goto(base + "/antonio-1q79h4to", { waitUntil: "load" });
    const s = await page.evaluate(() => ({ rv: document.documentElement.classList.contains("fm-rv"), api: !!window.fmReveal }));
    check("admin page: no load reveal", !s.rv && !s.api);
    await ctx.close();
  }
} finally {
  try { await browser?.close(); } catch {}
  finally { server?.stop(); }
}
const failed = results.filter((r) => !r).length;
console.log(failed ? `${failed} of ${results.length} reveal checks failed` : `all ${results.length} reveal checks passed`);
process.exitCode = failed ? 1 : 0;
