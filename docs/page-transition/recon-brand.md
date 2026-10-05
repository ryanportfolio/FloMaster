# Brand asset recon for the page transition

Facts only. Each line ends with its source as `file:line`. Paths are relative to the worktree root. Checked on branch `claude/wonderful-kalam-6b22a5` at commit 3344c2a.

## 1. Logo

### Files

- The logo SVG is `src/assets/logo.svg`, 4 lines: line 1 opening `<svg>`, line 2 the wordmark path, line 3 all mark elements on one line, line 4 `</svg>`. (src/assets/logo.svg:1-4)
- The file is generated. `npm run logo` runs `scripts/build-logo.mjs`, which writes both `src/assets/logo.svg` and `public/favicon.svg`. (scripts/build-logo.mjs:103-105, package.json:10)
- `public/` holds one file only: `public/favicon.svg` (964 bytes). It is the ring mark alone on a rounded navy square. No other logo file, PNG, or OG image exists in `public/`. (public/favicon.svg:1, `find public -type f` output)
- `Logo.astro` imports the SVG as a raw string and injects it inline with `set:html`, so the SVG is real DOM (not an `<img>`), CSS custom properties reach it, and its parts can be styled or animated from page CSS. (src/components/Logo.astro:3, src/components/Logo.astro:7)
- `Logo.astro` takes props `class` and `dark`. `.logo` is `display: inline-block; line-height: 0`; the inner svg is `height: 100%; width: auto`. Size comes from the caller's class. (src/components/Logo.astro:4-5, src/components/Logo.astro:9-10)
- `dark` variant sets `--logo-text: var(--navy-900)` and `--logo-dark: var(--slate)` for light backgrounds. (src/components/Logo.astro:11)
- Logo is used in two places: Header (`brand-logo`, height 1.75rem, 1.39rem under 360px) and Footer (`f-logo`, height 1.93rem). (src/components/Header.astro:18, src/components/Header.astro:56, src/components/Header.astro:79, src/components/Footer.astro:10, src/components/Footer.astro:48)
- Header sits on `--navy-950` with white text; the footer is `.navy` (waves). (src/components/Header.astro:15, src/components/Header.astro:53, src/components/Footer.astro:6)

### Wordmark

- Root element: `<svg xmlns=... viewBox="0 15.8 673 99" role="img" aria-label="FloMasters">`. ViewBox origin x 0, y 15.8, width 673, height 99 (aspect about 6.8:1). (src/assets/logo.svg:1)
- The letters are one single `<path>` with `fill="var(--logo-text, #ffffff)"`. No id or class on it. (src/assets/logo.svg:2)
- That one path holds 10 sub-paths (each begins with an absolute `M`), so it cannot be animated per letter without splitting it. Sub-path start points, in order: `M44.10 56.40` (F), `M110.60 82.40` (L), `M259.90 85.60` (M), `M341.30 28.40` (A outline), `M340.10 44.30` (A inner counter), `M403.90 28.60` (S), `M490.50 28.10` (T), `M546.90 82.40` (E), `M564.90 92.70` (R), `M647.70 28.60` (S). (src/assets/logo.svg:2)
- Approximate x extents of the letters, read from the path coordinates: F 5.4 to 49.6, L 61.3 to 111.6, M 213.4 to 305.9, A 304.9 to 379.5, S 383.4 to 423.5, T 430.6 to 490.5, E 497.6 to 547.9, R 557.2 to 623.9, S 627.2 to 667.3. Baseline y = 100, cap top about y 28.4. (derived from src/assets/logo.svg:2)
- Letters are outlines of Cinzel Medium 500, so the site does not load Cinzel at runtime. Cinzel is a dev dependency used only by the build script. The word is built letter by letter: "FL", then the ring, then "MASTERS". (scripts/build-logo.mjs:1-9, scripts/build-logo.mjs:32-43, scripts/build-logo.mjs:82-85, package.json:19)
- Default text color is white; on the header it inherits `#ffffff` from the fallback. (src/assets/logo.svg:2, src/components/Header.astro:53)

### The pipe ring (the "O")

- The ring replaces the letter O. It is drawn by `mark(cx, cy, r)` in the build script, and sits between "FL" and "MASTERS" with a gap of `SIZE * 0.06` (6 units) on each side. (scripts/build-logo.mjs:45-79, scripts/build-logo.mjs:81-85)
- Ring geometry in the built file: center (163.3, 65), radius 43.4, stroke width 8.68 (r * 0.2). Derived from the collar rotation pivots `rotate(0 163.3 21.6)` and `rotate(180 163.3 108.4)` (top = 65 - 43.4 = 21.6, bottom = 65 + 43.4 = 108.4). Ring spans x about 119.9 to 206.7 (outer edge about 115.6 to 211.0 with stroke). Inner clear radius about 39.06. (src/assets/logo.svg:3, scripts/build-logo.mjs:83-84, scripts/build-logo.mjs:47)
- ViewBox top is 15.8 and bottom is 114.8: the ring (plus half stroke) stands taller than the capitals, so the box is sized from the ring. (scripts/build-logo.mjs:86-92, src/assets/logo.svg:1)
- Ring is two stroked arcs, `fill="none"`, `stroke-linecap="butt"`, stroke-width 8.68, in the two logo blues:
  - Dark arc (right half): `<path d="M170.84 22.26A43.4 43.4 0 0 1 167.08 108.23" ... stroke="var(--logo-dark, #5b7fae)" ...>`. Angles -80 to 85 degrees, clockwise, 165 degrees of sweep. (src/assets/logo.svg:3, scripts/build-logo.mjs:74)
  - Light arc (left half): `<path d="M159.52 108.23A43.4 43.4 0 0 1 155.76 22.26" ... stroke="var(--logo-light, #6aaed6)" ...>`. Angles 95 to 260 degrees, clockwise, 165 degrees of sweep. (src/assets/logo.svg:3, scripts/build-logo.mjs:75)
- Gaps in the ring: 10 degrees at the bottom (85 to 95) and 20 degrees at the top (260 to 280, i.e. -100 to -80). Each gap holds a collar. (scripts/build-logo.mjs:74-76)
- Both arcs start at the top and end at the bottom, drawn clockwise in SVG coordinates. Each arc is a single `A` command, so `stroke-dasharray` / `stroke-dashoffset` draw-on works on each arc independently (arc length is 43.4 * 165 * PI/180, about 125 units). (src/assets/logo.svg:3, derived)
- Collars (fittings), two `<rect>`s in `--logo-light`, 13.02 wide and 4.77 tall (`sw*1.5` by `sw*0.55`), corner radius 1.59, rotated to sit across the ring at the two gaps:
  - Top: `<rect x="156.79" y="19.21" width="13.02" height="4.77" rx="1.59" fill="var(--logo-light, #6aaed6)" transform="rotate(0 163.3 21.6)"/>`
  - Bottom: `<rect x="156.79" y="106.01" width="13.02" height="4.77" rx="1.59" fill="var(--logo-light, #6aaed6)" transform="rotate(180 163.3 108.4)"/>` (src/assets/logo.svg:3, scripts/build-logo.mjs:57-61, scripts/build-logo.mjs:76)
- Tap, inside the ring, all `--logo-light`:
  - Pipe: `M163.3 25.94 V57.19 Q163.3 65.87 154.62 65.87 H148.54 V71.94`, stroke-width 6.51, `stroke-linejoin="round"`, fill none. It drops from the top collar down the center, elbows left, then points down as a spout. (src/assets/logo.svg:3, scripts/build-logo.mjs:63-66)
  - Handle: `M156.36 51.98 H170.24 M163.3 51.98 V57.19`, stroke-width 4.56, `stroke-linecap="round"`. A horizontal bar with a short stem into the pipe. (src/assets/logo.svg:3, scripts/build-logo.mjs:67-68)
- Drop under the spout: filled `<path d="M148.544 70.21 C149.85 74.55 154.62 79.32 154.62 82.79 A6.08 6.08 0 0 1 142.47 82.79 C142.47 79.32 147.24 74.55 148.544 70.21Z" fill="var(--logo-light, #6aaed6)"/>`. Tip at (148.54, 70.21), bottom of the round part about y 88.9. (src/assets/logo.svg:3, scripts/build-logo.mjs:70-72)
- Element order inside the SVG (no ids or classes anywhere; target by `path:nth-of-type` / `rect` / attribute selectors, or edit `build-logo.mjs` to add ids): 1 wordmark path, 2 dark arc, 3 light arc, 4 top collar, 5 bottom collar, 6 tap pipe, 7 handle, 8 drop. (src/assets/logo.svg:2-3)
- Space inside the ring that is free of the tap and drop: the right half of the interior (x about 164 to 202), and the bottom (y about 90 to 104). The tap pipe runs down x=163.3 from y 25.9 to 57.2; the handle spans x 156.4 to 170.2 at y 52; the spout and drop sit at x about 142 to 155, y 65.9 to 89. (derived from src/assets/logo.svg:3)

### What could be animated on its own

All items below are possible because the SVG is inline and the parts are separate elements. None of this exists yet; this is only what the structure allows.

- Ring fill with water: the interior is a circle of radius about 39.06 at (163.3, 65). A `<clipPath>` or a `<circle r=39>` with a rising wave path could be added inside the SVG, behind the tap and in front of nothing else. Tap, handle and drop are drawn after the arcs, so a water layer must be inserted before element 6 to stay behind the tap. (src/assets/logo.svg:3, derived)
- Draw-on of arcs: each arc is one path with butt caps and a single `A` command, so `stroke-dasharray`/`stroke-dashoffset` works (see above). (src/assets/logo.svg:3)
- Drop: its own filled path; could fall from the spout (translate Y) or scale in. (src/assets/logo.svg:3)
- Collars: two `<rect>`s with explicit `rotate()` pivots at the ring edge; could slide or fade. Setting a CSS `transform` would replace the attribute rotation, so use `transform-box`/`transform-origin` carefully or wrap them. (src/assets/logo.svg:3)
- Wordmark letters: not independent today (one path). Splitting needs a build-script change at `word()`, which already emits letter by letter before joining into `d`. (scripts/build-logo.mjs:34-43, scripts/build-logo.mjs:95)
- Color hooks: three CSS variables, all with hard-coded fallbacks, so a page can recolor parts without editing the SVG: `--logo-text` (letters, fallback #ffffff), `--logo-dark` (right arc, fallback #5b7fae), `--logo-light` (left arc, collars, tap, handle, drop, fallback #6aaed6). (src/assets/logo.svg:2-3, scripts/build-logo.mjs:60, scripts/build-logo.mjs:74-75)
- The SVG has `role="img"` and `aria-label="FloMasters"`. A transition copy of the logo must be `aria-hidden` to avoid double announcement. (src/assets/logo.svg:1)

### Favicon (ring mark alone)

- `viewBox="0 0 64 64"`, a `<rect width="64" height="64" rx="12" fill="#1b3556"/>` then the same mark with center (32, 32), radius 26 (`mr = 26`), colors hard-coded (#5b7fae dark arc, #6aaed6 light arc, collars, tap, drop). (public/favicon.svg:1, scripts/build-logo.mjs:99-100, scripts/build-logo.mjs:105)
- Ring arcs in the favicon: dark `M36.51 6.39A26 26 0 0 1 34.27 57.9`, stroke-width 5.2; light `M29.73 57.9A26 26 0 0 1 27.49 6.39`. (public/favicon.svg:1)
- This is the one standalone ring-only asset; a transition could reuse its markup, scaled up, without the navy square. (public/favicon.svg:1)

## 2. Color tokens (`:root`)

All in `src/styles/global.css`. The header comment: "FloMasters design tokens, taken from the business card." (src/styles/global.css:1)

| Token | Hex | Role (from the file's own comment unless noted) | Source |
|---|---|---|---|
| `--navy-950` | #0c1b30 | Darkest navy. Site header background, `theme-color` meta, `.fact-q` tooltip bg, button text on sky | global.css:3; Header.astro:53; Base.astro:23; global.css:166; global.css:144 |
| `--navy-900` | #12253f | Headings color; `Logo dark` text color; hover of `.btn--navy` | global.css:4; global.css:84; Logo.astro:11; global.css:147 |
| `--navy` | #1b3556 | "card background"; base of `.navy` bands; favicon square; links | global.css:5; global.css:107-112; public/favicon.svg:1 |
| `--navy-700` | #24456d | "card wave lines" (token comment). Note: the actual wave tile uses #213f66, not this token | global.css:6; global.css:59 |
| `--sky` | #6aaed6 | "logo ring, drop"; the light logo blue; accent, primary button bg, eyebrow bar | global.css:7; global.css:130; global.css:144 |
| `--sky-300` | #a9d2ea | Muted text on navy (`.navy .muted`, `.lead`, eyebrow), nav sub-label | global.css:8; global.css:115; global.css:131 |
| `--sky-100` | #e4f1f9 | Pale sky tint surface (`--surface-tint`), checked-choice bg | global.css:9; global.css:42; global.css:229 |
| `--slate` | #5b7fae | "logo ring, darker arc"; the dark logo blue | global.css:10 |
| `--slate-ink` | #3d5f8c | "slate deepened for small text on light surfaces (6.5:1 on white)"; eyebrow text | global.css:11; global.css:128 |
| `--paper` | #f6f8fb | Page background (`body`), `--surface-paper` | global.css:12; global.css:78; global.css:39 |
| `--white` | #ffffff | White; text on navy; raised surface | global.css:13; global.css:40 |
| `--ink` | #13233a | Body text color | global.css:14; global.css:77 |
| `--ink-soft` | #44546a | Secondary text (`.lead`, `.muted`) | global.css:15; global.css:99-100 |
| `--line` | #d6dee8 | Hairlines, band borders | global.css:16; global.css:121 |
| `--signal` | #c2410c | "emergency path only" (signal orange) | global.css:17 |
| `--signal-dark` | #9a3412 | Hover of `.btn--signal` | global.css:18; global.css:143 |
| `--ok` | #166534 | Success green | global.css:19 |

- Other literal colors in global.css: wave line `#213f66` (inside `--waves`); form border `#74869e`; error `#b42318`; placeholder-tag yellow `#ffd24d` / `#e0a100` / `#3d2a00`; sample label `#fff4cc` / `#f0d27a` / `#6b4e00`. (global.css:59, :213, :216-217, :156-161, :185)
- Logo fallbacks in the SVG: text #ffffff, dark #5b7fae (equals `--slate`), light #6aaed6 (equals `--sky`). (src/assets/logo.svg:2-3)
- Shadow tokens, scaled from the card's shadow (level 3 is the card): `--shadow-1`, `--shadow-2`, `--shadow-3 = 0 4px 10px rgb(6 14 26 / 0.3), 0 24px 48px -12px rgb(6 14 26 / 0.55)`; `--ring: 0 0 0 1px rgb(27 53 86 / 0.07)`. (global.css:48-52)
- Surfaces: `--surface-paper` = paper, `--surface-raised` = white, `--surface-navy` = navy, `--surface-tint` = sky-100. (global.css:38-42)
- Radii and layout: `--radius: 10px`, `--radius-lg: 18px`, `--wrap: 1180px`, `--bar-h: 4.75rem`. (global.css:54-57)
- Orange rule: `.btn--signal` is the only orange component class in global.css; the design brief limits orange to the emergency path. (global.css:142-143; docs/design-brief.md:290; docs/design-brief.md:381)

## 3. Wave pattern

- Token `--waves` is a CSS `url("data:image/svg+xml,...")` on `:root`. (src/styles/global.css:59)
- Exact markup (decoded from the data URI):

```svg
<svg xmlns='http://www.w3.org/2000/svg' width='96' height='48' viewBox='0 0 96 48'>
  <g fill='none' stroke='#213f66' stroke-width='5' stroke-linecap='round'>
    <path d='M-4 12 C 12 -2, 36 -2, 48 12 S 84 26, 100 12'/>
    <path d='M-4 36 C 12 22, 36 22, 48 36 S 84 50, 100 36'/>
  </g>
</svg>
```

  (src/styles/global.css:59)
- Tile: 96 x 48 (viewBox 0 0 96 48). Two wave lines per tile at y 12 and y 36 (baseline), one smooth cubic then a smooth `S` continuation; each line runs from x -4 to x 100 so the tile seams are hidden by the round caps. Line color #213f66, width 5, round caps, no fill. (src/styles/global.css:59)
- The line color #213f66 sits just above the navy #1b3556 background, so the pattern is a low-contrast texture. The brief calls it "a quiet background motif". (src/styles/global.css:5, :59; docs/design-brief.md:290)
- Where it is used, with the displayed tile size:
  - `.navy` class (all navy bands, header-style pages, footer, page heroes): `background-color: var(--navy); background-image: var(--waves); background-size: 96px 48px`. (src/styles/global.css:107-112)
  - Business card back: `background: var(--navy) var(--waves); background-size: 72px 36px`. (src/components/CardBack.astro:29)
  - Booking summary panel: 72px 36px. (src/pages/book/index.astro:284)
  - Home "Meet" portrait offset slab: 72px 36px. (src/pages/index.astro:318, comment at :314)
  - Booking confirmed "who card": 60px 30px. (src/pages/book/confirmed.astro:119)
  - Pricing guarantee seal (round): 60px 30px. (src/pages/pricing.astro:92)
- Page header and footer carry `.navy`, so they show waves. `.site-header` has its own `--navy-950` background and does not use `.navy` background-image (the element has class `on-navy` only). (src/components/Footer.astro:6, src/components/PageHero.astro:8, src/components/Header.astro:15, src/components/Header.astro:53)
- No `mask`, `clip-path` wave, or inline SVG wave edge exists in `src` yet. The only `clip-path` uses are in RepairStory. The overhaul plan lists "Page headers with a wave-shaped bottom edge" for a later round. (grep of `src`; src/components/RepairStory.astro:293, :369-370; docs/overhaul-plan.md:57)
- Overhaul plan says the wave pattern "stays as a brand element on navy surfaces; text over it keeps AA contrast". (docs/overhaul-plan.md:37)

## 4. Business card component (`CardBack.astro`)

- Header comment: "The back of Antonio's business card, as a page element: name, trade, license and phone, on the card's navy wave pattern with its valve mark." Props: `class`. (src/components/CardBack.astro:2-6)
- Box: `width: min(100%, 22rem)`, `aspect-ratio: 1.75`, padding 1.4rem 1.5rem, `border-radius: 16px`, white text, `background: var(--navy) var(--waves)` at 72px 36px, shadow `0 1px 0 rgb(255 255 255 / 0.08) inset, var(--shadow-3)`, flex column centered, `font-family: var(--font-slab)`. (src/components/CardBack.astro:26-34)
- Text: owner name 1.45rem bold; "Master Plumber" and "License # {facts.license.value}" lines at 1.05rem; phone link 1.3rem bold, white, hover underline in `--sky`, formatted like `757-277-6194`. (src/components/CardBack.astro:19-22, :36-39)
- Valve icon: inline `<svg class="bcard-valve" viewBox="0 0 64 64" aria-hidden="true">`, positioned absolute at right 1.1rem / bottom 1.1rem, 3.4rem square, `color: rgb(255 255 255 / 0.92)`. (src/components/CardBack.astro:9, :40)
- Valve shapes, all in `<g fill="currentColor">` (white): two side flanges `rect x=2 y=30 w=10 h=22 rx=2` and `rect x=52 y=30 w=10 h=22 rx=2`; body `path d="M12 35h8c1-6 6-10 12-10s11 4 12 10h8v12h-8c-1 6-6 10-12 10s-11-4-12-10h-8z"`; stem `rect x=28 y=12 w=8 h=14`; handle bar `rect x=16 y=6 w=32 h=7 rx=3.5`. (src/components/CardBack.astro:10-16)
- Water drop in the valve body: `<path d="M32 36c2 3 4 5.4 4 7.6a4 4 0 0 1-8 0c0-2.2 2-4.6 4-7.6z" fill="var(--navy)"/>` (navy cut-out on the white body). (src/components/CardBack.astro:17)
- The valve icon on the card is a different drawing from the logo's tap. The logo has a tap and drop inside a ring; the card has a gate valve with a drop. (src/components/CardBack.astro:9-18 vs src/assets/logo.svg:3)
- Note: the card has no logo on its back in this component; the logo is only in header and footer. (src/components/CardBack.astro:8-23)

## 5. Fonts

- Display token: `--font-slab: "Roboto Slab Variable", "Roboto Slab Fallback", Georgia, serif;` used by `h1-h4` (weight 700), the card, and the footer quote. (src/styles/global.css:21; global.css:84; src/components/CardBack.astro:33; src/components/Footer.astro:49)
- Body token: `--font-body: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;` (system stack, no web font). (src/styles/global.css:22; global.css:74)
- Loading: package `@fontsource-variable/roboto-slab` ^5.3.0. `Base.astro` imports `@fontsource-variable/roboto-slab/wght.css` (all subsets, each `@font-face` has `font-display: swap`, `font-weight: 100 900`, with `unicode-range`) and imports the latin woff2 as a URL. (package.json:14; src/layouts/Base.astro:2-3; node_modules/@fontsource-variable/roboto-slab/wght.css:5)
- Preload: `<link rel="preload" href={slabUrl} as="font" type="font/woff2" crossorigin />` for `roboto-slab-latin-wght-normal.woff2`, in `<head>`. (src/layouts/Base.astro:25)
- Fallback metric match: `@font-face { font-family: "Roboto Slab Fallback"; src: local("Georgia"); size-adjust: 104%; ascent-override: 96%; descent-override: 25%; }`. (src/styles/global.css:62-68)
- CSS is inlined into every page (`inlineStylesheets: "always"`). (astro.config.mjs:6-9)
- Logo letters do not use a font; they are outlines. (scripts/build-logo.mjs:1-3)
- Body size: `--step-0: 1.125rem`; fluid headings `--step-1` to `--step-4` via `clamp()`. (src/styles/global.css:24-29)

## 6. Motion tokens, easings, reduced motion

- No motion tokens exist in `global.css` (no duration or easing custom properties). The only transition in global.css is `.btn`: `transition: background-color 0.15s, border-color 0.15s, color 0.15s`. (src/styles/global.css:1-60, :139)
- The overhaul plan puts "motion tokens (durations, easings) and one `prefersReducedMotion()` helper" in Round 4, not yet built. (docs/overhaul-plan.md:64; docs/overhaul-plan.md:3)
- Reduced-motion rule, global and blanket:

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}
```

  (src/styles/global.css:232-234). Because of `animation: none !important`, any page-transition CSS keyframes or `::view-transition-*` animation set through the author stylesheet would also be killed under reduced motion, unless scoped differently. (derived from src/styles/global.css:233)
- Easings and durations in use elsewhere (component-scoped, not tokens):
  - `cubic-bezier(0.3, 0.6, 0.2, 1)` on `.vs-move`, with `--vs-turn: 1.4s` (wheel) and `0.6s` (lever); opacity transitions 0.25s. (src/components/ValveStates.astro:163-166)
  - `.sticky-bar`: `transform 0.2s ease`. (src/components/StickyBar.astro:28, :31)
  - RepairStory: `ease(t) = 0.5 - Math.cos(Math.PI * t) / 2` (cosine ease-in-out in JS); transitions 0.15s to 0.2s `ease`; reads `matchMedia("(prefers-reduced-motion: reduce)")`. (src/components/RepairStory.astro:106, :180, :301, :321, :341, :355, :359)
  - `.svc-link`: `transition: box-shadow 0.15s`. (src/pages/index.astro:288)
- No view transitions in use: no `ClientRouter`, no `astro:transitions`, no `view-transition` CSS in `src` or `astro.config.mjs`. Site is static multi-page with almost no JS. (grep of `src`; astro.config.mjs:1-10; docs/design-brief.md:329)
- The Header mobile menu is a `<details>` and does not animate. (src/components/Header.astro:33-40)
- Overhaul plan motion rules: "Every moving piece has a designed reduced-motion state. Nothing in the first screen fades or slides in, because the phone LCP element is the headline." and "Motion only where it shows something real: proof, price, progress or a step to follow. No sheen, scroll drift, count-up numbers, stamp effects, autoplay loops or scroll locking." (docs/overhaul-plan.md:20-21)
- Overhaul plan "Dropped for now" includes "a page-wide water-drop animation" and "scroll-linked effects". (docs/overhaul-plan.md:70)
- Overhaul plan Round 4 already plans the "logo ring fills with water when the ZIP is covered (secondary, beside the written answer, with a static equivalent)". (docs/overhaul-plan.md:65)

## 7. Design brief, section 9 "Visual direction and copy voice" (lines 285-313)

Quoted from `docs/design-brief.md`:

- "**Plain, sturdy, local, on the FloMasters brand.** A working tradesman's site, not a franchise template. The colours come from the business card: deep navy as the base, light sky blue as the accent, white text, and the card's wave pattern as a quiet background motif. One warm signal colour (an orange or red that passes contrast with the navy) is used only on the emergency path, so emergency is the only thing on the page in that colour. All text pairs meet WCAG AA contrast (4.5:1 for body text)." (docs/design-brief.md:290)
- "**Logo.** The business card's logo, recreated as an SVG so it stays sharp at any size, until the original file arrives. The serif capitals of the wordmark set the tone for headings." (docs/design-brief.md:293)
- "**Photos.** ... No stock photos. ..." (docs/design-brief.md:289)
- "**Type.** One readable sans-serif family, self-hosted, 18px body text on mobile, with numbers (prices, phone, licence) set large and in tabular figures so they line up in the fee table." (docs/design-brief.md:291). Note: the built site uses Roboto Slab for headings and a system sans for body, which differs from "one sans-serif family". (src/styles/global.css:21-22)
- "**Layout.** Short sections, generous spacing, one action per section. Icons only where they carry meaning (phone, calendar, map pin), always with a text label." (docs/design-brief.md:292)
- Motion (section 10, performance and accessibility): "Also: visible focus outlines, no information carried by colour alone (the emergency button says "emergency" in words), and motion only where it helps, switched off for visitors who ask their device to reduce motion." (docs/design-brief.md:333)
- Performance (section 10): "Pages are delivered as finished HTML with almost no JavaScript; scripts load only for the booking form, the ZIP check and the tag switch." and targets LCP <= 2.5s, INP <= 200ms, CLS <= 0.1. (docs/design-brief.md:329; docs/design-brief.md:319-321)
- Placeholder P02: "Logo and brand colours | From the business card (confirmed): serif wordmark with the O drawn as a pipe ring holding a tap and a water drop; deep navy, light sky blue, white; wave-pattern background. Recreated as SVG until the original logo file arrives | Header, footer, favicon". (docs/design-brief.md:234)

## 8. Design brief, section 12 "Decisions and remaining questions" (lines 360-388)

Quoted from `docs/design-brief.md`:

- Decided (2026-10-05): "The user's direction: build the best possible version of the site as a base to show the owner, then change it based on his feedback." (docs/design-brief.md:364)
- Item 1, business card: "**Brand and owner details:** the business card is the actual branding. It confirms the name (FloMasters Plumbing and Drains, established 2024), the owner (Antonio Spence, Master Plumber), his licence number (2710081569), his phone number ((757) 277-6194), the logo and the colours." (docs/design-brief.md:366)
- Item 2: "**Photos:** every photo slot gets an AI-generated image ... each generated image carries a "replace with a real photo" tag, is listed on `/review`, and must be replaced before any public launch". (docs/design-brief.md:367)
- Item 11: "**Visuals are the priority.** ... The first build was judged too flat; the next passes add structure, depth and one trade-tied interactive moment." (docs/design-brief.md:379)
- Item 12, motion: "**Art:** drawn line art (valve states, an X-ray of pipes in a wall, a house of problem spots) and AI-generated images are both acceptable, as are advanced 2D/3D effects where they make sense, as long as mobile Core Web Vitals stay good and every effect has a reduced-motion state." (docs/design-brief.md:380)
- Item 13, orange: "**Orange marks the emergency path only.** Planned-service pages use an outlined Call button; the mobile sticky bar's Call stays orange because it is the emergency route on every page." (docs/design-brief.md:381)
- Item 14: "**Misleading placeholders stay hidden.** ..." (docs/design-brief.md:382)
- Still open: hosting; Virginia fee-disclosure and advertising rules; who edits content after launch. (docs/design-brief.md:386-388)
- Business card mentions in the brief: the card is the source of colours and logo (items above), and `CardBack.astro` reproduces its back. The about page is planned to carry "a two-sided business card that flips with its own button". (docs/design-brief.md:366; src/components/CardBack.astro:2-3; docs/overhaul-plan.md:4)
- Section 9 states no rule on page transitions, and section 12 has no decision on them. (docs/design-brief.md:285-313, :360-388)

## 9. Constraints that touch a page transition

- Static Astro site, no client router, no view transitions yet, almost no JS by design. (astro.config.mjs:1-10; docs/design-brief.md:329)
- First screen must not fade or slide in because the phone LCP element is the headline. (docs/overhaul-plan.md:20)
- Mobile CWV targets LCP <= 2.5s, INP <= 200ms, CLS <= 0.1; every effect needs a reduced-motion state. (docs/design-brief.md:319-321; docs/design-brief.md:380)
- Global reduced-motion rule kills all `animation` and `transition` with `!important`. (src/styles/global.css:232-234)
- Orange (`--signal`) is reserved for the emergency path; a transition should not use it. (docs/design-brief.md:290; docs/design-brief.md:381)
- Header is navy-950 with the white logo; the mark is theme-aware through three CSS variables. (src/components/Header.astro:53; src/assets/logo.svg:2-3)
- Page `theme-color` is #0c1b30 (navy-950). (src/layouts/Base.astro:23)
