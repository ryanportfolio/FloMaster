# Pitch: Quiet tide

One of three directions for the page transition. This one is the most restrained: the page never moves, one band of the business card's water passes down the screen once per tab, and the pipe ring in the header holds a little water for a moment.

Sources: `facts.md`, `inspiration.md`, `recon-brand.md`, `recon-platform.md`, `recon-site.md`, and the motion-design skill's decision rules. Timing figures marked "computed" come from evaluating the stated easing curves at a 375 x 740 phone and a 1440 x 900 desktop viewport (script in `.tmp/tide-curve2.mjs`, not committed). Nothing here has been built or watched in a browser yet.

## 1. The feeling

The visitor should feel that the new page arrived already settled, the way a wave leaves sand smooth, and should notice that the little ring in the logo caught the water for a moment, without ever feeling made to wait.

## 2. Visual direction

- One sheet of water, taken from the business card: a horizontal band of navy-900 `#12253f` carrying the card's own wave tile (`--waves`, lines `#213f66`), about 14% of the screen tall, slides down the page from under the header and off the bottom.
- The leading (lower) edge is the card's wave line itself, filled navy `#1b3556` and topped with a 2 px foam line in sky-300 `#a9d2ea`; the trailing (upper) edge is the same wave, half a period out of phase, with a 2 px slate `#5b7fae` wet line. Lighter at the front and deeper behind gives the band a sense of depth with four cues and no more.
- Above the band is the new page; below it, the old page. Nothing on either page moves, scales or fades. The band simply passes over and leaves the new page behind it.
- The header and the phone's bottom bar stay put above the water the whole time, so the Call button is never covered.
- Inside the header's pipe ring, a pool of navy-700 `#24456d` water with a sky `#6aaed6` surface rises to about a third of the ring, tips once as the band leaves, and drains away. The ring then shows the real logo again.
- After the first navigation in a tab, the band is retired: later pages arrive with a 200 ms dissolve and a shallow 2 px swell in the ring. The ring remembers the tide; the page does not repeat it.
- Over the navy page heroes the band is navy on navy, so on most inner pages only the foam line and the deeper tone show. It is most visible over the pale paper sections.
- Colors are only the facts.md palette. No orange, no text, no white flash.

Why the band travels down rather than across: down uncovers the top of the page first, where the headline and the eye are (the top 240 px are uncovered by about 100 ms, computed); the distance is about the same on a phone (852 px of travel) and a desktop (1034 px), so it feels the same speed everywhere, whereas a sideways sweep would travel 430 px on a phone and 1640 px on a desktop and peak at about 145 px per frame on desktop (computed), which reads as a flicker; and the band's edges are the card's wave lines the right way up, not turned on end.

## 3. Beat sheet

Time 0 is the moment the new page is ready and the browser starts the view transition (`ready`), not the click. Everything before that is normal browser loading with the old page still live.

Shared values: band core height `--tide-h: 14lvh` (104 px on the phone, 126 px on the desktop), edge wave amplitude `--tide-a: 8px`, tide easing `--ease-tide: cubic-bezier(0.33, 0.4, 0.3, 1)` (a soft ease-out). Ring coordinates are logo SVG units; the header logo is 28 px tall, so 1 unit is about 0.28 px.

### Full pass: first navigation in a tab (520 ms of transition, ring settles by 640 ms)

| Time (ms) | What moves | Easing | Duration |
|---|---|---|---|
| 0 | Old page shown whole and still. Header and bottom bar shown as the new page's live header and bar, above everything. Band waits above the screen, hidden. | none | |
| 0 to 520 | Band moves down from `translateY(-(h + a))` to `translateY(100lvh)`. | `--ease-tide` | 520 |
| 0 to 520 | New page uncovered from the top: its clip edge rides at the band's center line, so the straight cut is always hidden under the opaque band. | `--ease-tide` (same curve, so the two stay aligned) | 520 |
| 0 to 520 | Foam and wet lines drift sideways by one wave period (96 px), so the surface reads as moving water. | linear | 520 |
| about 100 | Top 240 px of the new page uncovered (computed: 107 ms phone, 95 ms desktop). | | |
| about 230 | 80% of the screen uncovered (computed: 227 ms on both). | | |
| about 340 | Whole screen uncovered; band now half below the bottom edge, and on phones it slides out under the bottom bar (computed: 338 ms phone, 340 ms desktop). Peak band speed 58 px per frame on the phone, 70 on the desktop, about half the band's own height, so it reads as one continuous sheet. | | |
| 60 to 300 | Ring water rises from below the ring to a surface at y 80, about a third of the ring. | ease-out cubic `cubic-bezier(0.33, 1, 0.68, 1)` | 240 |
| 0 to 640 | Ring surface drifts sideways by one surface wave (26 units). | linear | 640 |
| 200 to 460 | One damped slosh: water tilts -4 degrees, swings to +1.5, settles at 0, pivoting on the ring center. | ease-in-out `cubic-bezier(0.65, 0, 0.35, 1)` | 260 |
| 460 to 640 | Ring water drains back below the ring (exit at 75% of the rise). | ease-in cubic `cubic-bezier(0.32, 0, 0.67, 0)` | 180 |
| 520 | Transition finished. Page takes clicks and taps again. Band element hidden. | | |
| 640 | Ring is the plain logo again. This last 120 ms plays on a page that is already interactive. | | |

### Short pass: every later navigation in the tab (200 ms of transition, ring settles by 320 ms)

| Time (ms) | What moves | Easing | Duration |
|---|---|---|---|
| 0 to 200 | Page cross-fade, old to new, with the browser's own blend. Header and bar stay still above it. No band. | browser default `ease` | 200 |
| 0 to 180 | Ring water swells to a surface at y 96, a 2 px sliver along the bottom of the ring. | ease-out cubic | 180 |
| 0 to 320 | Ring surface drift, one surface wave. | linear | 320 |
| 180 to 320 | Swell drains away. | ease-in cubic | 140 |
| 200 | Transition finished, page interactive. Ring finishes on the live page. | | |

Why no band on repeats: at 300 ms a half-height band would move 94 to 114 px per frame (computed), more than its own height, so it would strobe instead of glide. A sweep needs about 450 ms or more to stay continuous, and 450 ms on every click is the "second viewing is tiresome" problem NN/g describes. The ring's swell carries the water on every page instead, and it costs no waiting because it runs inside the header, not over the content.

### Back and forward

Same as the short pass without the ring: a 200 ms cross-fade with the header still. Chrome and Edge detect this through `navigation.activation.navigationType === "traverse"`. Safari 18.2 to 26.1 has no `navigation.activation`, so there a back press gets the short pass, which is harmless. A swipe-back gesture on iOS or Android can replace the transition with the browser's own animation; that is expected.

## 4. Reduced motion

For visitors whose device asks for reduced motion, every navigation is the same:

- The page dissolves from old to new in 180 ms (the browser's own cross-fade, which WebKit's guidance says causes no motion-sensitivity problems).
- The header and the bottom bar hold perfectly still above the dissolve, so the logo is the one thing that does not change between pages. That steadiness is the reduced design: continuity by staying put rather than by moving.
- No band, no sweep, no ring water, no drift.
- First visit and repeat visits are identical.

How it is enforced: the `pagereveal` script checks `matchMedia("(prefers-reduced-motion: reduce)")` and never sets the full or short mode, so the band element never appears and the ring keyframes never apply. The pseudo-element durations are set explicitly inside `@media (prefers-reduced-motion: reduce)`. The site's blanket rule `* { animation: none !important }` also stops the ring animation, but the plan does not depend on it for the transition itself: `*` matches elements, not the `::view-transition-*` pseudo-elements, so the transition's reduced behaviour is written out on its own (facts.md assumes the blanket rule would cancel the transition; this should be checked when built).

## 5. Build plan

### Mechanism

Cross-document view transitions: `@view-transition { navigation: auto; }` in `global.css`, which every page inlines. Chrome and Edge 126+ and Safari 18.2+ run it; Firefox navigates normally and sees nothing new, which is the intended fallback.

### Layers and what carries each

| Layer | Carried by | How it moves |
|---|---|---|
| Old page | `::view-transition-old(root)` | `animation: none`; stays whole under everything until covered. |
| New page | `::view-transition-new(root)`, with `mix-blend-mode: normal` and `::view-transition-image-pair(root) { isolation: auto }` so nothing adds up to a bright flash | `clip-path: polygon(0 0, 100% 0, 100% Y, 0 Y)` keyframes, Y from `calc(var(--tide-h) / -2)` to `calc(100% + var(--tide-h) / 2 + var(--tide-a))`. Percentages, so it fits every screen (the recon found fixed `path()` clips crop on narrow screens). No `round` and no exact 100% offset, the two forms tied to the Chrome 150 and 151 clip-path regressions. |
| Water band | A new `<div class="tide" aria-hidden="true">` in `Base.astro`, `display: none` at rest. In `pagereveal`, when the full pass is chosen, `html[data-tide="full"]` shows it with `view-transition-name: tide`, so it becomes its own group in the new page only. | `::view-transition-group(tide)` gets `transform: translateY()` keyframes: compositor-only. `::view-transition-new(tide)` gets `animation: none`. |
| Band artwork | Three child divs inside `.tide`: the core (`background: var(--navy-900) var(--waves); background-size: 96px 48px`), the leading strip and the trailing strip (each a 96 x 16 SVG data-URI tile, `repeat-x`, holding the wave fill plus its 2 px line). Effects live on the children, not on the captured element, because whether a captured element's own mask or opacity is baked into its snapshot was not confirmed. | The two strips are `100vw + 96px` wide and translate sideways by 96 px, linear, as a live animation inside the new snapshot. |
| Header | `.site-header { view-transition-name: site-header; }` in `Header.astro` | Group `animation: none` and `z-index` above the band; old image hidden (`opacity: 0`), new image shown at once. The nav underline for the current page swaps instantly. |
| Bottom bar | `.sticky-bar { view-transition-name: sticky-bar; }` in `StickyBar.astro` | Same as the header: still, above the band. Its existing slide-away on pages with hero buttons keeps working, because the new image is live. |
| Ring water | A hidden `<g class="lw">` added to the logo SVG just before the tap pipe (element 6), so the tap, handle and drop stay in front of it. It is clipped to the ring's inner circle with CSS, `clip-path: circle(39.06px at 163.3px 65px) view-box`, so no `id` is needed (the logo is inlined twice per page; an `id` would be duplicated). Inside: `.lw-tilt` (rotation, pivot 163.3, 65 with `transform-box: view-box`), then `.lw-level` (rise and drain), then the water body (`#24456d`) and a wavy surface stroke (`#6aaed6`), the surface wave 26 units long and 2.5 units high. At rest `.lw-level` sits at `translateY(30)`, fully below the clip, so the logo looks exactly as it does now. | CSS keyframes on transforms only, applied by `html[data-ring="full"] .site-header .lw-level` and `[data-ring="short"]`. They play on the real DOM of the new page, which the header group shows live. The footer logo carries the same hidden group and never animates. |

### The script

One classic inline script in `<head>` of `Base.astro`, about 0.7 KB, next to the existing review-tag script (`pagereveal` must be registered before the first render, which a parser-blocking inline script guarantees):

1. On `pagereveal`, if `event.viewTransition` is null, do nothing.
2. Choose the mode: reduced motion or a traverse means "calm"; otherwise "full" if `sessionStorage["fm-tide"]` is unset (then set it), else "short". Any storage error falls back to "short".
3. Set `data-tide` and `data-ring` on `<html>`. Remove `data-tide` when `viewTransition.finished` settles; remove `data-ring` on the ring's `animationend`, with a 700 ms timer as a backstop; remove both on `pagehide` so a page restored from the back/forward cache comes back clean.

`sessionStorage` rather than `localStorage`: the full pass plays once per tab. A link opened in a new tab is a fresh load with no transition, so the full pass only reappears if the visitor then clicks around in that new tab.

### First visit, repeat, and the landing page

- Landing on the site (from search, a text, a bookmark) plays nothing. There is no previous page, and the overhaul plan forbids anything in the first screen fading or sliding in.
- First internal click in a tab: full pass.
- Every later click: short pass.
- Back and forward: cross-fade only.
- `/book` to `/book/confirmed` is a scripted `location.href`, which `navigation: auto` excludes, so the booking hand-off stays a plain load. `tel:`, the DPOR link, the calendar download and hash links never start a cross-document transition.

### How it avoids adding waiting time

- The transition starts only when the new page is ready to paint. While it loads, the old page stays on screen and clickable, and the browser shows its own progress. Nothing plays on click, and there is no exit animation to sit through.
- No `blocking="render"` and no `<link rel="expect">`. The only head addition is the small inline script.
- Speculation Rules prerender in `Base.astro`: `<script type="speculationrules">` with `"eagerness": "moderate"` for same-origin links, excluding `/` (the repair story's first-view peek could run while the page is still hidden), `/book*` and `/emergency` (they read `sessionStorage` at load). In Chrome and Edge a hovered or pressed link is usually ready before the click, which removes the roughly 70 ms mobile LCP cost one vendor measured. Safari support for this was not checked.
- The top of the page, where the headline is, is uncovered within about 100 ms. Clicks are held for 520 ms once per tab and 200 ms after that, both inside NN/g's 100 to 500 ms band except the single first pass, which sits 20 ms over it.
- The ring's tail plays after the page is interactive.

### Slow network

The old page stays up and works while the request is in flight; nothing of ours animates during the wait. When the new page arrives, the tide plays at its normal speed. It is never stretched to cover loading. If the new page takes longer than Chrome's 4 s limit, the transition is skipped and the page appears with a plain cut; the script sees a null `viewTransition` and leaves the ring alone.

### Files touched

- `scripts/build-logo.mjs`: emit the hidden `.lw` group before the tap in the logo output (not the favicon); then `npm run logo` regenerates `src/assets/logo.svg`.
- `src/layouts/Base.astro`: the inline `pagereveal` script, the speculation rules, the `.tide` element.
- `src/styles/global.css`: motion tokens (`--ease-tide`, `--tide-h`, `--tide-a`), `@view-transition`, the pseudo-element rules, `.tide` styles, the tide and ring keyframes, and the reduced-motion block.
- `src/components/Header.astro`: `view-transition-name: site-header`.
- `src/components/StickyBar.astro`: `view-transition-name: sticky-bar`.
- New `scripts/check-transition.mjs`: clicks real links in headed offscreen Chrome (`launchPlacedChrome()`), logs `ready` and `finished` times, captures stills at 0, 100, 200, 340 and 520 ms to `D:\screenshots\FloMaster\page-transition\tide\`, repeats with reduced motion, and reads LCP on the clicked navigation with a `PerformanceObserver`, because Lighthouse loads pages cold and never sees a transition.

### Main risk

The band and the reveal are two separate animations that must stay in step. The band's `transform` runs on the compositor; the root's `clip-path` may run on the main thread (compositing it is confirmed for basic shapes in Chromium, not for a view-transition pseudo-element, and Safari never composites it). On a slow phone busy starting the new page's scripts, the clip can fall behind the band. The clip edge sits at the band's center, so up to about 50 px of drift stays hidden, but one dropped frame at peak speed is about 58 px. If a 4x CPU-throttled trace shows the straight edge peeking out, switch the reveal to the fully painted version: wave masks on both old and new root images, with the navy wave tile as the image pair's background showing in the gap between them. That version cannot drift, because one paint draws both edges, but it loses the foam line and costs a full-screen repaint per frame.

## 6. What could make this fail

- **Too quiet for the request.** The owner asked for "some type of water effect with the logo". The ring is 25 px across, and its full fill is about 7 px of water. He may see the band, miss the ring, and feel the logo part is absent. And because the band plays once per tab, he may click around while reviewing and never see it again. The prototype needs a review switch (for example `?tide=always`) so he can judge the full pass more than once.
- **Safari may show the new page early.** WebKit bug 310627 (open, reproduced on iOS 26.3.1) flashes the new page before the transition starts. For a top-down reveal that means: new page, old page, then the tide uncovers the new page again. That is worse than no transition. If a real iPhone shows it, Safari gets a plain cut plus the ring moment (the ring keyframes still apply from `pagereveal` after `skipTransition()`) until WebKit fixes it. Many local visitors and the owner himself may be on iPhones, and this cannot be tested on this Windows machine.
- **iOS fixed-bar flashes.** WebKit bugs 325199 and 320238 show white or solid bars around fixed headers and bottom navigation during view transitions (filed against same-document transitions; not confirmed for cross-document). The named bottom bar is exactly that pattern.
- **Clicks are swallowed.** While the band is on screen the whole page ignores taps, because the root is captured. 520 ms on the first click is long enough for someone to tap a link on the new page and get nothing. The repeat pass cuts this to 200 ms, but it cannot be zero with a reveal of the page.
- **Group order and the header.** The design needs the header and bar groups painted above the band. `z-index` on `::view-transition-group()` is the plan, but this was not tested; if it fails, the band has to exist on the old page too (added in `pageswap`) so that paint order puts it below the header. The design also assumes the sticky header from the parallel change. If the header ends up non-sticky, a click from the footer captures an off-screen old header, and the plan then drops the header's name for that navigation so the band passes over everything.
- **Windows Chrome clip-path regressions.** A Chrome 150 bug mispositions view-transition clip-path animations on high-DPI Windows, the user's own setup. Chrome 152 ran `inset()` clips correctly in the recon test, but `polygon()` was not tried.
- **Prerender side effects.** Prerendered pages run their scripts while hidden. Excluding `/`, `/book*` and `/emergency` covers the known load-time scripts, but any future page that reads storage or starts a timer at load would need the same care. Whether `sessionStorage` reads in `pagereveal` after a prerender activation see the tab's real storage was not checked; the script falls back to the short pass if not.
- **LCP effect is unmeasured.** Whether a clip-hidden headline counts as painted when it renders or when it is uncovered is not documented anywhere the recon found. The 100 ms figure above is the animation's timing, not a measured LCP. Field data or the new check script on a throttled profile has to settle it.
- **Nobody has watched it.** Every duration and curve here is computed on paper. Peak speeds of 58 to 70 px per frame were judged from numbers, not by eye; the band may still feel fast on a large desktop monitor and need 560 ms or a softer curve.
