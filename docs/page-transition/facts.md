# Page transition: facts

Every claim a direction or build may rely on, with its source. Detail and line numbers are in the three recon files; research on craft is in `inspiration.md`.

## The request

- The owner's words, 2026-10-05: "lets have an /wow-animation page transition so when you go from 1 page to another there's some type of water effect with the logo."
- Earlier the owner asked for premium and effortless motion, and accepted line art and 2D or 3D effects when they are optimized for speed.
- `docs/overhaul-plan.md` line 70 had dropped "a page-wide water-drop animation". The request above replaces that decision.

## Brand material (recon-brand.md)

- Logo: inline SVG (`src/assets/logo.svg`, viewBox `0 15.8 673 99`), rendered as real DOM in the header and footer. Elements in order: wordmark path, slate arc, sky arc, top collar, bottom collar, tap pipe, handle, drop. No ids or classes yet.
- Pipe ring: center (163.3, 65), radius 43.4, stroke 8.68. Slate arc `#5b7fae` from -80° to 85°, sky arc `#6aaed6` from 95° to 260°, each a single arc command (draw-on with `stroke-dasharray` works). Clear inner radius about 39. A water fill would sit behind the tap.
- Colors: navy-950 `#0c1b30`, navy-900 `#12253f`, navy `#1b3556`, navy-700 `#24456d`, sky `#6aaed6`, sky-300 `#a9d2ea`, sky-100 `#e4f1f9`, slate `#5b7fae`, slate-ink `#3d5f8c`, paper `#f6f8fb`. Signal orange `#c2410c` is reserved for the emergency path.
- Wave pattern (the business card's texture): 96x48 tile, two lines at y 12 and y 36, stroke `#213f66`, width 5, round caps (`--waves`, `global.css:59`).
- Fonts: Roboto Slab Variable (display), system UI (body).
- Motion today: no motion tokens; a blanket reduced-motion rule sets `animation: none !important` and would also cancel a transition.

## The site (recon-site.md)

- 20 pages, all full document loads with plain links; no client router. Header is `z-index` 40, the phone bottom bar is `position: fixed` at `z-index` 50. The header is becoming sticky in a parallel change.
- Booking moves to `/book/confirmed` by script (`location.href`) 500 ms after a valid submit.
- Links that must not trigger the transition: `tel:` (everywhere), the external DPOR link, the calendar download, hash links.
- LCP: home hero image or h1; inner pages the navy hero h1. Lighthouse loads pages cold, so it never sees a page-to-page transition.
- Load-time scripts to respect: the repair story's first-view peek, the sticky bar's observer, sessionStorage reads on the booking and confirmation pages.

## The platform (recon-platform.md)

- Cross-document view transitions (`@view-transition { navigation: auto; }`): Chrome and Edge 126+, Safari and iOS Safari 18.2+, about 86% of usage. Firefox: none; it navigates normally.
- Chrome skips a transition that takes longer than 4 s. Input is blocked while it plays, so it must stay short.
- Tested in Chrome 152: an SVG wave `mask-image` with animated `mask-position` on `::view-transition-new(root)` works; animated `clip-path: path()` works but does not scale; an element with a shared `view-transition-name` stays on top of the reveal.
- Reduced motion: wrapping the opt-in in `@media (prefers-reduced-motion: no-preference)` removes it; recommended fallback is a 150 to 200 ms cross-fade or a plain cut.
- WebKit open bugs: the new page can flash before the transition (cross-document, macOS and iOS); fixed bars can flash on iOS.
- Field data from one vendor: about +70 ms LCP on slow mobile with a cross-document transition; prerendering the next page (Speculation Rules) removes that cost.

## Craft guidance (inspiration.md)

- Navigation motion: 100 to 500 ms (NN/g); repeated navigation animations tire people. Proposal: full pass once per tab (500 to 600 ms), 250 to 300 ms after that.
- Water reads as water with a few cues: color that deepens with depth, a foam line, a moving surface; a wave edge whose amplitude follows `sin(progress * PI)`, flat at rest, with a second layer slightly behind for depth.
- The header pipe ring can lead and hold its place across pages; the transition must never add waiting time.
