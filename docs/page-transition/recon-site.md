# Recon: how pages are built and navigated (page transition slice)

Facts only. Every line ends with its source (path:line, relative to the repo root). Checked on branch `claude/wonderful-kalam-6b22a5` at commit 3344c2a. "dist" facts come from `dist/index.html` built 2026-10-05T21:30Z in this worktree (may lag the source).

## 1. Navigation model today

- Plain multi-page site. Every internal link is a normal `<a href>`; every page is a full document load. Source: `src/components/Header.astro:17,23,32,36-38`, `src/components/Footer.astro:26,31-36`.
- No ClientRouter, no `transition:*` directives, no `@view-transition` CSS, no `pageswap` / `pagereveal` / `astro:page-load` / `astro:after-swap` listeners anywhere in `src/`, `public/`, `scripts/`, `astro.config.mjs`. Grep for these terms returns only CSS `transition:` property hits (e.g. `src/components/StickyBar.astro:28,31`, `src/styles/global.css:139,233`). Source: grep over repo, nothing else matched.
- `dist/index.html` contains no `astro-view-transitions-enabled` meta and no prefetch script. Source: `dist/index.html` (head holds one icon link, one font preload, one inline script; see section 3).
- The Astro runtime in `node_modules` ships `ClientRouter.astro` (it adds `<meta name="astro-view-transitions-enabled">` and `<meta name="astro-view-transitions-fallback">`) and `astro/dist/transitions/router.js`, so it can be adopted. Not used now. Source: `node_modules/astro/components/ClientRouter.astro:25-26`, `node_modules/astro/dist/transitions/router.js`.
- Cross-document view transitions (CSS `@view-transition { navigation: auto }`) are not enabled. `src/styles/global.css` has no `view-transition` rule (grep clean). Source: `src/styles/global.css` (239 lines).
- Reduced-motion rule already in global CSS: `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }`. Source: `src/styles/global.css:232-234`.
- Design brief rule: every effect needs a reduced-motion state; mobile Core Web Vitals must stay good. Source: `docs/design-brief.md:380` (decision 12), `docs/design-brief.md:333`.
- `html` has `scroll-padding-bottom` and `scroll-padding-top` (affects hash-link landing). Source: `src/styles/global.css:71`.

## 2. Astro version and config

- Astro `^7.3.5` in package.json; installed 7.3.5. Other deps: `@fontsource-variable/roboto-slab`, `sharp`; dev: `@fontsource/cinzel`, `axe-core`, `lighthouse`, `opentype.js`, `playwright-core`. Source: `package.json:12-20`; `node_modules/astro/package.json` (version 7.3.5).
- Scripts: `dev`, `build` (`astro build`), `build:public` (`node scripts/build-public.mjs`), `preview`, `logo`. Source: `package.json:6-11`.
- Config is the whole file: `site: "https://flomasters.example"`, `trailingSlash: "ignore"`, `build.inlineStylesheets: "always"` (comment: inlining CSS removes the only render-blocking request). Source: `astro.config.mjs:3-9`.
- No `output` key, so Astro default `static`. No `prefetch` key (no prefetch in the built page). No `experimental`, no integrations, no adapter. Source: `astro.config.mjs:3-9`; default from `node_modules/astro/dist/core/config/schemas/base.js:46`.
- `build.format` not set, so default `directory` (`dist/about/index.html`, etc.). Source: `astro.config.mjs`; `node_modules/astro/dist/core/config/schemas/base.js:58`; `dist/` folder listing (`about/`, `book/`, ...).
- Public build: `PUBLIC_BUILD=1` via `scripts/build-public.mjs`; it drops the review bar, tag script and `noindex`, and deletes `dist/review`. Source: `scripts/build-public.mjs:20-22`; `src/data/facts.ts:94`.
- Hosting not chosen; any review deploy must be private and `noindex`. Source: `CLAUDE.md` (Environment and deploy target); `.claude/reference/deployment.md`.

## 3. The shared layout: `src/layouts/Base.astro`

Every page wraps its content in `<Base title description>`. Source: `src/layouts/Base.astro:11-12`; all pages (grep `<Base ` in `src/pages`).

Head (in order):
- `<meta charset="utf-8">`. Source: `Base.astro:18`.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Source: `Base.astro:19`.
- `<title>` is `fullTitle` (home: "{name} | Master plumber in Hampton Roads"; others "{title} | {shortName}"). Source: `Base.astro:13,20`.
- `<meta name="description">`. Source: `Base.astro:21`.
- `<meta name="robots" content="noindex, nofollow">` only when not a public build. Source: `Base.astro:22`.
- `<meta name="theme-color" content="#0c1b30">`. Source: `Base.astro:23`.
- `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`. Source: `Base.astro:24`.
- `<link rel="preload" href={slabUrl} as="font" type="font/woff2" crossorigin>`: the Roboto Slab variable latin woff2 (only preload on the site). Source: `Base.astro:3,25`; built: `dist/index.html` (`/_astro/roboto-slab-latin-wght-normal.NGSZfXMW.woff2`).
- Inline review-tag script (`<script is:inline>`, prototype builds only): reads `?tags=on|off`, else `localStorage["fm-tags"] === "on"`; writes `localStorage["fm-tags"]` when the param is present; adds class `tags-on` to `<html>` before first paint. Wrapped in try/catch. Source: `Base.astro:26-37`; confirmed as the only head script in `dist/index.html` (script 1, 417 bytes, in `<head>`).
- `<slot name="head" />` for per-page head content; grep shows no page fills it. Source: `Base.astro:38`; grep `slot="head"` in `src` returns nothing.
- CSS: `global.css` imported in frontmatter, inlined into one `<style>` in the built page. Source: `Base.astro:4`; `astro.config.mjs:7`; `dist/index.html` (1 `<style>` tag).
- No stylesheet `<link>` in the built head. Source: `dist/index.html` link list (icon, font preload only).

Body structure (in order):
1. `<a class="skip" href="#main">Skip to content</a>`. Source: `Base.astro:41`; style `src/styles/global.css:103-104`.
2. `<TagSwitch />` (prototype only; slim bar above the header, in normal flow). Source: `Base.astro:42`; `src/components/TagSwitch.astro:6-15`.
3. `<Header />` (`<header class="site-header on-navy">`, `position: relative; z-index: 40`). Source: `Base.astro:43`; `src/components/Header.astro:15,53`.
4. `<main id="main"><slot /></main>`. Source: `Base.astro:44-46`.
5. `<Footer />` (`<footer class="site-footer navy on-navy">`). Source: `Base.astro:47`; `src/components/Footer.astro:7`.
6. `<StickyBar />` (`<div class="sticky-bar" data-sticky>`, `position: fixed`, `z-index: 50`, hidden at >= 900px). Source: `Base.astro:48`; `src/components/StickyBar.astro:8,23-32`.
7. Inline-position script `<script>document.querySelectorAll("[data-needs-js]").forEach((b) => b.removeAttribute("disabled"));</script>`. Source: `Base.astro:49`.

Scripts in the layout and its components (Astro bundles each non-inline `<script>` as `<script type="module">`, emitted inline in the page body):
- Layout inline head script (above). Source: `Base.astro:27`.
- TagSwitch script. Source: `src/components/TagSwitch.astro:17-40`.
- StickyBar script. Source: `src/components/StickyBar.astro:13-20`.
- Layout `data-needs-js` script. Source: `Base.astro:49`.
- Header and Footer have no script. Source: `src/components/Header.astro`, `src/components/Footer.astro` (grep `<script` finds none).
- Built home page has 7 script tags: 1 inline head script, then 6 `type="module"` in body: tag switch (743 bytes), repair story (3538), valve (285), zip check (634), sticky bar (290), data-needs-js (118). Source: `dist/index.html` script scan.
- z-index and fixed layers today: header 40, sticky bar 50, skip link 100. Source: `src/components/Header.astro:53`, `src/components/StickyBar.astro:24`, `src/styles/global.css:103`.

Logo markup (relevant to a logo effect):
- `Logo.astro` inlines `src/assets/logo.svg` with `set:html`; used in Header (`.brand-logo`, 1.75rem high) and Footer (`.f-logo`, 1.93rem high). Source: `src/components/Logo.astro:3,7`; `Header.astro:18,56`; `Footer.astro:10,48`.
- `logo.svg`: 9011 bytes, `viewBox="0 15.8 673 99"`, `role="img" aria-label="FloMasters"`, 2 `<path>` elements, no `id` attributes. Wrapper `.logo { display:inline-block; line-height:0 }`; colours via `--logo-text` / `--logo-dark` on `.logo--dark`. Source: `src/assets/logo.svg:1`; `src/components/Logo.astro:9-11`.
- Regenerated by `npm run logo` (`scripts/build-logo.mjs`), which also writes `public/favicon.svg`. Source: `package.json:10`; `.claude/reference/commands.md`.
- `public/` holds only `favicon.svg`. Source: `public/` listing.

## 4. The 20 pages

15 page files plus 5 generated service pages. Source: `src/pages/` listing; `src/pages/residential/[slug].astro:12-14`; slugs at `src/data/services.ts:28,47,66,85,104`.

| # | URL | File | Hero | First-screen Call/Book (`data-hero-actions`) |
|---|---|---|---|---|
| 1 | `/` | `src/pages/index.astro` | own `.hero` with photo | yes, `index.astro:47` |
| 2 | `/about` | `src/pages/about.astro` | PageHero (`about.astro:14`) | no |
| 3 | `/appointment` | `src/pages/appointment.astro` | PageHero (`:18`) | no |
| 4 | `/book` | `src/pages/book/index.astro` | own `.book-head` | no |
| 5 | `/book/confirmed` | `src/pages/book/confirmed.astro` | none (portrait photo) | no |
| 6 | `/commercial` | `src/pages/commercial.astro` | PageHero actions (`:12`) | yes |
| 7 | `/emergency` | `src/pages/emergency.astro` | PageHero emergency actions (`:12`) | yes |
| 8 | `/faq` | `src/pages/faq.astro` | PageHero (`:9`) | no |
| 9 | `/pricing` | `src/pages/pricing.astro` | PageHero (`:12`) | no |
| 10 | `/privacy` | `src/pages/privacy.astro` | PageHero (`:8`) | no |
| 11 | `/residential` | `src/pages/residential/index.astro` | PageHero actions (`:11`) | yes |
| 12-16 | `/residential/drains`, `/water-heaters`, `/leaks-and-pipes`, `/fixtures`, `/sewer-lines` | `src/pages/residential/[slug].astro` | PageHero actions (`:19`) | yes |
| 17 | `/review` | `src/pages/review.astro` | own `<h1>` in a plain section (`review.astro:12`); its print button uses an inline `onclick="window.print()"` (`:14`) | no |
| 18 | `/reviews` | `src/pages/reviews.astro` | PageHero (`:11`) | no |
| 19 | `/service-area` | `src/pages/service-area.astro` | PageHero (`:12`) | no |
| 20 | `/404` | `src/pages/404.astro` | PageHero actions (`:6`) | yes |

- `/review` is prototype-only: linked from the review bar; deleted from `dist` by the public build. Source: `src/components/TagSwitch.astro:13`; `scripts/build-public.mjs:22`.
- `PageHero` is a navy `<section class="page-hero navy on-navy">` with an `<h1>`; `actions` adds `<div class="ph-actions" data-hero-actions>`. Source: `src/components/PageHero.astro:9-23`.
- Sticky bar behaviour: on pages with `[data-hero-actions]` the bar gets `is-waiting` (hidden) until the hero buttons scroll away; on all other pages it shows from load. Source: `src/components/StickyBar.astro:2-4,13-20`; `scripts/check-flows.mjs:100-107`.

## 5. Internal links and non-plain navigations

Header (every page):
- Brand logo link `/` (`aria-label="FloMasters Plumbing and Drains, home"`). Source: `src/components/Header.astro:17`.
- Desktop nav (shown >= 1100px): `/residential`, `/commercial`, `/pricing`, `/reviews`, `/service-area`, `/about`; `aria-current="page"` set at build by `path.startsWith(href)`. Source: `Header.astro:6-13,23,86-87`.
- Phone link `tel:` (`facts.phoneHref`). Source: `Header.astro:27`.
- "Book a time" button `/book` (shown >= 720px). Source: `Header.astro:32,85`.
- Mobile menu: a `<details class="menu">` with the six nav links plus `/emergency` and `/faq`; hidden >= 1100px. Source: `Header.astro:33-40,89`.

Footer (every page):
- `tel:` link. Source: `Footer.astro:16`.
- `/service-area` ("Check your ZIP"). Source: `Footer.astro:26`.
- `/emergency`, `/book`, `/book#callback`, `/pricing`, `/faq`, `/privacy`. Source: `Footer.astro:31-36`.

Sticky bar (mobile, every page): `tel:` and `/book`. Source: `StickyBar.astro:9-10`.
Review bar (prototype, every page): `/review`. Source: `TagSwitch.astro:13`.
Skip link: `#main` (hash). Source: `Base.astro:41`.

Page-level links:
- Home: `tel:` (48, 124, 161, 204), `/book` (52, 203), `/commercial` (57), `/reviews` (76, 190), `/pricing` (86), `/residential/{slug}` x5 (110), `/about` (145), `/book#callback` (205). Source: `src/pages/index.astro` at those lines.
- Home `RepairStory`: `/book` and `/residential/leaks-and-pipes`. Source: `src/components/RepairStory.astro:95-96`.
- Home `ProofBar` (used only on the home page, `index.astro:64`): external DPOR link, `/pricing`, `/reviews`. Source: `src/components/ProofBar.astro:27,40,48`.
- `RatingLine`: `/reviews`. Source: `src/components/RatingLine.astro:9`.
- `PageHero`: crumb link (`/residential` on service pages), `tel:`, `/book`, or for emergency `/book#callback`. Source: `src/components/PageHero.astro:11,17-19`.
- `CallToAction` (bottom of `/about` 44, `/faq` 48, `/pricing` 71, `/residential` 30, service pages 49, `/reviews` 23, `/service-area` 39): `/book`, `tel:`, `/book#callback`. Source: `src/components/CallToAction.astro:15-17`.
- `/residential`: `/residential/{slug}` x2 per service. Source: `src/pages/residential/index.astro:18,24`.
- `/residential/{slug}`: `/pricing`, `/book?job={slug}` (query string), `/emergency`. Source: `src/pages/residential/[slug].astro:42-44`.
- `/pricing`: `/residential/{slug}`. Source: `src/pages/pricing.astro:42`.
- `/faq`: `/pricing`, `/emergency`, `/pricing#guarantee`. Source: `src/pages/faq.astro:15,37,42`.
- `/emergency`: `tel:`, `/book#callback` (via PageHero). Source: `src/pages/emergency.astro:13,35`.
- `/privacy`: `tel:`. Source: `src/pages/privacy.astro:19`.
- `/about`: external `https://www.dpor.virginia.gov/LicenseLookup` (`rel="noopener"`, no `target`). Source: `src/pages/about.astro:35`.
- `/commercial`: `tel:`. Source: `src/pages/commercial.astro:60`.
- `/book/confirmed`: `tel:` (18), `/book` (45), `/appointment` (46), and "Add to calendar" `<a href="#" data-ics download="flomasters-visit.ics">`. Source: `src/pages/book/confirmed.astro:18,44-46`.
- `/book`: `/pricing` (136), `tel:` (140). Source: `src/pages/book/index.astro:136,140`.
- `/404`: `/`, `/emergency`, `/pricing`, `/residential`. Source: `src/pages/404.astro:10-13`.
- Service-area ZIP result (injected HTML from `<template>`): `/book`, `tel:`. Source: `src/components/ZipCheck.astro:16-18`.
- Only inbound link to `/appointment` is `confirmed.astro:46`; only inbound link to `/review` is `TagSwitch.astro:13`; only inbound link to `/privacy` is `Footer.astro:36`. Source: grep of `src/` for those hrefs.

Links that are not plain same-origin navigations:
- `tel:` everywhere: `Header.astro:27`, `Footer.astro:16`, `StickyBar.astro:9`, `PageHero.astro:17`, `CallToAction.astro:16`, `CardBack.astro:22`, plus the page lines above. A transition must not intercept these.
- `mailto:` and `sms:`: none in `src/` (grep for `href=` shows none). Source: grep `src/` `href=`.
- External: DPOR lookup at `about.astro:35` and `ProofBar.astro:27` (same tab, `rel="noopener"`).
- Download: `confirmed.astro:44` (`href="#"`, `download`, `href` replaced at runtime with a Blob URL by `confirmed.astro:106`).
- Hash links: `#main` (`Base.astro:41`), `/book#callback` (`Footer.astro:33`, `index.astro:205`, `CallToAction.astro:17`, `PageHero.astro:19`; target `<section id="callback">` at `book/index.astro:146`, also `emergency.astro:49`), `/pricing#guarantee` (`faq.astro:42`; target `pricing.astro:54`).
- Query-string links: `/book?job={slug}` (`residential/[slug].astro:43`); the Base head script also reads `?tags=` on any page (`Base.astro:30`); `/book` reads `?job=` (`book/index.astro:169`).
- Programmatic navigation (not a link): after a valid booking, `setTimeout(() => { location.href = "/book/confirmed"; }, 500)`. This is the only `location.href` assignment in the site. Source: `src/pages/book/index.astro:247`.
- No `window.open`, `location.assign`, `location.replace`, `history.pushState` in `src/`. `history.replaceState` is used once to strip `?tags=` when the review switch is clicked. Source: grep `src/`; `src/components/TagSwitch.astro:30-32`.
- Forms: five `<form method="post" action=...>` whose submit handlers all call `preventDefault()`, so no form submission navigates:
  - Booking `action="/book"` (`book/index.astro:47`), handler `:225-226`.
  - Callback `action="/book#callback"` (`CallbackForm.astro:9`), handler `:81-82`; used on `/book` (`book/index.astro:152`) and `/emergency` (`emergency.astro:55`).
  - ZIP check `action="/service-area"` (`ZipCheck.astro:9`), handler `:29-30`; used on `/` (`index.astro:177`) and `/service-area` (`service-area.astro:16`).
  - Commercial visit `action="/commercial"` (`commercial.astro:35`), handler `:87-88`.
  - Confirmed-page extra info `action="/book/confirmed"` (`confirmed.astro:49`), handler `:107-108`.
- The booking "going to /book/confirmed" is the `location.href` at `book/index.astro:247`, not a form post. Booking data passes through `sessionStorage["fm-booking"]` (`book/index.astro:246`), read at `confirmed.astro:71`, so the URL carries no personal data.
- Submit buttons start `disabled` and are enabled by the layout script: `book/index.astro:115`, `commercial.astro:58`, `CallbackForm.astro:21`, handler `Base.astro:49`.

## 6. Per-page scripts that run on load

All are Astro bundled module scripts (deferred, run once per full page load; no `astro:page-load` hooks). Source: `dist/index.html` script scan; grep `<script` in `src/`.

- Repair story (home only): `src/components/RepairStory.astro:100-270`.
  - Runs at load for each `[data-story]` (`:109`): measures stage, sets `--v` and `--fill`, adds a `ResizeObserver` (`:251`), pointer, range and button handlers (`:203-244`).
  - Motion: `matchMedia("(prefers-reduced-motion: reduce)")` read at `:106`; change listener `:171`.
  - First-view peek (`:255-268`): returns early under reduced motion (`:256`); otherwise an `IntersectionObserver` with `threshold: 0.6` (`:257,267`) fires once; then it awaits `decode()` of the first two frame images (`:261`), waits 250 ms (`:262`), skips if the visitor touched the control (`:263`), sets `root.dataset.peeked` (`:264`), and runs `glide([home + 6, home - 6, home], [340, 520, 380])` via `requestAnimationFrame` (`:266`). It starts only when the slider is scrolled into view, not at load.
  - Story images are `loading: "lazy"`, `decoding: "async"`. Source: `RepairStory.astro:30`.
- Valve panel (home and `/emergency`): `src/components/ValveStates.astro:79-88`. Click handler toggles `aria-pressed` and a text label. CSS transitions on transform and opacity at `:118,165,166`. No load-time work.
- Sticky bar (every page): `src/components/StickyBar.astro:13-20`. If the page has `[data-hero-actions]` and `IntersectionObserver` exists, adds `is-waiting` immediately and toggles it from an observer on that element. CSS `transition: transform 0.2s ease` (`:28,31`).
- Tag switch (prototype, every page): `src/components/TagSwitch.astro:17-40`. Syncs button state from `<html class="tags-on">` at load; click toggles the class, writes `localStorage["fm-tags"]`, strips `?tags=` with `history.replaceState`. Also adds document-level listeners: `keydown` Escape (adds `tips-hidden`), `focusin`, `pointerover` (`:36-39`).
- Booking form (`/book`): `src/pages/book/index.astro:157-249`.
  - At load: reads `?job=` and pre-checks a radio (`:169`); restores `sessionStorage["fm-phone"]` into `#phone` (`:172`); registers phone input listener that writes it back (`:173`); calls `showPrice()` (renders the price table).
  - Submit: validates, writes `sessionStorage["fm-booking"]` (`:246`), disables the button and sets "Booking...", then navigates after 500 ms (`:247`).
- Callback form (`/book`, `/emergency`): `src/components/CallbackForm.astro:28-93`. At load: fills the "when" message from Virginia time (`:66`), restores `sessionStorage["fm-phone"]` (`:72`); document-level `input` listener copies the phone across fields (`:56-60`); submit fakes a 600 ms send (`:87`).
- ZIP check (home, `/service-area`): `src/components/ZipCheck.astro:22-39`. Submit-only; no load-time work.
- Commercial form: `src/pages/commercial.astro:66-95`. Submit-only; fakes a 500 ms send.
- Appointment tabs: `src/pages/appointment.astro:49-72`. Click and arrow-key handlers only.
- Confirmation page: `src/pages/book/confirmed.astro:68-111`. At load reads `sessionStorage["fm-booking"]` (`:71`), fills text, hides the sample note (`:78`), builds a calendar Blob URL and assigns it to the download link (`:106`).
- Storage keys: `localStorage["fm-tags"]` (`Base.astro:31-32`, `TagSwitch.astro:29`), `sessionStorage["fm-phone"]` (`CallbackForm.astro:60,72,80`; `book/index.astro:172-173`), `sessionStorage["fm-booking"]` (`book/index.astro:246`; `confirmed.astro:71`). Nothing else uses web storage. Source: grep `sessionStorage|localStorage` in `src/`.
- No `@keyframes` or `animation:` in `src/`; all motion is CSS `transition` plus the repair-story JS tween. Source: grep `@keyframes|animation:` in `src/` (only the reduced-motion override matches).
- Because every page is a full document load, no script needs re-initialising today; a router that swaps `<body>` would skip `DOMContentLoaded`-style setup (all scripts above run once at parse and bind to elements that exist then). Source: pattern of the scripts above (no event delegation except `CallbackForm.astro:56`, `TagSwitch.astro:36-39`, which are `document`-level and would stack if the script re-ran).

## 7. What the check scripts assume about page load

All checks run on the production build via `astro preview` on port 4321 (never dev) in headed offscreen Chrome. Source: `scripts/lib/preview.mjs:1-4,19-23`; `.claude/reference/commands.md`; `CLAUDE.md` (CRITICAL: Verification).

- `scripts/check-flows.mjs`:
  - Navigation is `page.goto(url)` (default `waitUntil: "load"`) throughout: `:17,65,67,72,76,78,90,92,96,98,101,106,122,157,187,203,231`.
  - One real click-through navigation: `Promise.all([page.waitForURL("**/book/confirmed**"), page.click("[data-submit]")])` (`:55`). `waitForURL` default waits for the `load` event, default timeout 30 s. The page's own 500 ms delay precedes it (`book/index.astro:247`).
  - `page.reload()` at `:46`, then reads restored `#phone` and `#cb-book-phone` immediately (`:47-48`).
  - Reads `<html class="tags-on">` right after `goto` (`:66,68`), relying on the inline head script running before first paint.
  - Sticky bar: reads `is-waiting` immediately after `goto("/")` (`:101-102`), scrolls to 1400, waits 400 ms (`:103-104`), then `goto("/faq")` and reads (`:106-107`).
  - Repair story: after `goto("/")` waits a fixed 2200 ms for the first-view peek (`:124,160`); waits 800 ms after a step button (`:149`); 400 ms after touch (`:166`); samples `--v` every 80 ms for 25 samples (`:191,217`) to count peek positions; reduced-motion contexts via `reducedMotion` option (`:185,201`) and `emulateMedia` (`:205,210`).
  - Out-of-hours messages use `page.clock.setFixedTime` then `goto("/emergency")` (`:230-231`).
- `scripts/check-perf.mjs`:
  - Lighthouse mobile navigation, 3 runs, for `/`, `/book`, `/residential/water-heaters`, `/pricing`; each Lighthouse run loads the URL itself (cold document load), not via link clicks (`:15-18`). It records LCP, CLS, TBT, bytes and the LCP element snippet (`:20,23`).
  - INP stand-in: `page.goto(..., { waitUntil: "load" })` (`:34,45`), taps with 4x CPU throttle (`:29`), records `event` entries over 16 ms (`:32`), waits 500 ms (`:43,52`).
- `scripts/check-keyboard.mjs`: `goto` with `waitUntil: "load"` (`:15`) then tabs up to 120 times, 30 ms per stop (`:17-19`), for `/`, `/book`, `/pricing`, `/emergency`, `/residential/drains`, `/appointment`, `/commercial`, `/faq` (`:7`). Flags any focused element with no 2px outline, covered by the sticky bar, off screen, or under 24 px (`:29-33`). Second loop checks `tel:` link sizes after `scrollTo(0, 1500)` and a 300 ms wait (`:46-53`). Anything left in the DOM that takes focus or sits over the content would register here.
- `scripts/check-a11y.mjs`: `goto(..., { waitUntil: "load" })` for every `dist/**/index.html` page, phone and desktop, tags off and on, then injects axe and runs WCAG 2.x A/AA tags (`:9,20-22`). A leftover overlay element would be audited.
- `scripts/check-overflow.mjs`: `goto(base + p, { waitUntil: "load" })` at 320 and 375 px for every built page; flags anything with `rect.right > viewport width` that is not `position: fixed` (`:6,12-24`).
- `scripts/shoot.mjs`: `goto(url, { waitUntil: "networkidle" })` then `document.fonts.ready`, optional slow scroll for lazy images, 300 ms wait (`:29-35`). This is the only script that uses `networkidle`.
- No script clicks a header, footer or in-page link to move between pages; no script waits for `domcontentloaded` or a custom ready signal. Source: grep for `click(|tap(|waitForURL|waitForLoadState|domcontentloaded` in `scripts/`.
- Checks are run after `npm run build`; no CI yet. Source: `CLAUDE.md` (CRITICAL: Verification); `.claude/reference/commands.md`.

## 8. LCP elements and loading hints

Home (`/`):
- Hero photo `<Photo ... priority>` renders `<img loading="eager" fetchpriority="high" decoding="sync">` with a 4-width webp `srcset` (640 to 1536) and `sizes="(min-width: 900px) 70vw, 100vw"`. Source: `src/pages/index.astro:37`; `src/components/Photo.astro:21-31`; built tag in `dist/index.html` (`hero.BBvOhumM_*.webp`, `loading="eager" fetchpriority="high" decoding="sync"`).
- Layout: on phone the `h1` block comes first (`order: 1`), the photo second (`order: 2`, `aspect-ratio: 3/2`); at >= 900px the photo is absolutely positioned across the right 70% behind the copy. Source: `src/pages/index.astro:215,239-241,248-250`.
- Likely LCP element: the hero image (it is the largest above-the-fold paint on desktop; on a 375x740 phone viewport the h1 text and the photo are both in the first screen, not confirmed which wins). The lab script prints the actual element: `check-perf.mjs:20,23`. Not run here.
- No `<link rel="preload" as="image">`; the only preload is the font. Source: `Base.astro:25`; `dist/index.html` link list.
- Second eager image: owner portrait, 96x96, `loading="eager"` (no fetchpriority). Source: `src/pages/index.astro:43`.
- Repair-story images below the fold are lazy. Source: `src/components/RepairStory.astro:30`.

Inner pages:
- Pages with `PageHero` and no priority photo: `/about`, `/appointment`, `/faq`, `/pricing`, `/privacy`, `/reviews`, `/service-area`, `/404`, `/commercial`, `/residential`. Their first screen is the navy hero with an `<h1>` (text, Roboto Slab, preloaded font). `/about` photos and `/commercial` photo are lazy (no `priority`). Source: `src/components/PageHero.astro:9-23`; `about.astro:38,40`; `commercial.astro:17`; `residential/index.astro:16`.
- `/residential/{slug}`: the `lead-photo` has `priority` (eager, `fetchpriority="high"`) but sits in the section after the PageHero, so on phone it is below the hero. Source: `src/pages/residential/[slug].astro:19,24`.
- `/emergency`: `em-photo` has `priority` but sits in the `<aside>` after the steps. Source: `src/pages/emergency.astro:39`.
- `/book/confirmed`: portrait has `priority` (the `.who-photo`, 16rem, widths 320 and 480). Source: `src/pages/book/confirmed.astro:13`.
- `/book`: header portrait is a plain `<Image loading="eager" format="webp">` 120x120. Source: `src/pages/book/index.astro:37`.
- LCP on inner pages is not asserted from code; `check-perf.mjs` reports it for `/book`, `/residential/water-heaters` and `/pricing` (`:15,23`).
- `fetchpriority` and `preload` usage in total: `fetchpriority="high"` only via `Photo priority` (`Photo.astro:29`); `rel="preload"` only for the font (`Base.astro:25`). Source: grep `fetchpriority|preload` in `src/`.
- Targets: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 on mobile. Source: `CLAUDE.md` (Won't compromise on).

## 9. Details a transition would run into (observed, not a recommendation)

- Header is a normal-flow block with `z-index: 40`; the review bar sits above it in the flow (prototype only); the sticky bar is `position: fixed` at `z-index: 50`. Source: `Header.astro:53`, `TagSwitch.astro:43`, `StickyBar.astro:24`.
- Logo appears twice per page as inline SVG (header and footer) with no ids. Source: `Header.astro:18`, `Footer.astro:10`, `src/assets/logo.svg:1`.
- `<details class="menu">` (mobile menu) is not closed by any script; a full page load resets it. Source: `Header.astro:33`.
- A visitor's `?tags=` choice persists via localStorage and the head inline script, which depends on running on every page load. Source: `Base.astro:27-36`.
- `/book` auto-navigates 500 ms after valid submit; a page-leave effect would stack on that delay. Source: `book/index.astro:247`.
- The home repair-story peek and the sticky bar observer both start at parse of the new page; both are tied to scroll position, not to load. Source: `RepairStory.astro:257-267`, `StickyBar.astro:16-18`.
- The existing `prefers-reduced-motion` rule disables CSS `transition` and `animation` globally but does not touch JS animation (the story tween checks `reduced()` itself). Source: `global.css:232-234`; `RepairStory.astro:106-107,182` (tick checks `reduced()`).
