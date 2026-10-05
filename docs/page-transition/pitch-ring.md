# Pitch: through the pipe ring

Angle: the logo's pipe ring is the camera. The next page opens out of the ring like the view down a clean pipe, with water riding the edge of the opening. The header logo never moves.

## 1. The feeling

When it ends, the visitor should feel they passed cleanly through the FloMasters ring into the next page, and understand that the logo stayed exactly where it was while only the page changed.

## 2. Visual direction

- The header logo holds perfectly still on every page. It is the fixed point; everything else moves relative to it.
- The new page opens as a circle centred on the ring's centre, starting at the ring's inner clear radius (39 logo units, about 11 px at the 1.75rem header size), so it begins hidden behind the ring's own stroke and seems to come out of it.
- A thin band of water rides the edge of the opening: a sky `#6aaed6` line where light catches the surface of the new page, a body that deepens from slate `#5b7fae` to navy `#1b3556`, and a sky-100 `#e4f1f9` foam line on the leading edge. Its width follows `sin(progress * PI)`: flat at rest, widest mid-pass, thin again at the end.
- First pass only: the logo's own drop falls from the spout into the ring, the ring's hollow briefly fills with sky water, and the ripple leaves the ring. At the end the drop re-forms at the spout, so the mark finishes in its true form.
- First pass only: the new page settles from 103% to 100% around the ring's centre, a small forward push as if the camera had moved through the pipe.
- The old page never moves. Nothing slides sideways and nothing spins.
- Colours: the logo blues and the navies only. No orange in any transition layer; the sticky bar's Call button is held above the water as part of the page, unchanged.

## 3. Beat sheets

`t = 0` is the transition's `ready` moment: the new page is already rendered and captured. Before that, the old page stays live and nothing animates, so the effect adds no waiting time before the new page exists.

Geometry at the 1.75rem (28 px) header logo: 0.283 px per logo unit, ring centre 46 px from the logo's left and 14 px from its top, inner clear radius 11 px, outer radius 13.5 px, stroke 2.5 px, drop fall 14 units (4 px). The script measures the real values on each page. The end radius `r1` is the distance from the ring centre to the farthest viewport corner plus the band width: about 870 px on a 390x844 phone, about 1,510 px on a 1440x900 desktop.

### Full pass: first navigation in a tab (type `fm-full`, 560 ms)

| Time (ms) | What moves | Easing | Duration |
|---|---|---|---|
| 0 | Logo held in place (named group, no animation). Old page full frame and still. New page clipped to a circle of radius 11 px at the ring centre, hidden behind the ring stroke. | none | held |
| 0 to 140 | Drop falls 14 logo units from the spout toward the ring floor; opacity 1 to 0 over its last 50 ms. | ease-in `cubic-bezier(0.55, 0, 1, 0.45)` | 140 |
| 0 to 110 | Ring hollow fills: a sky disc at 40% opacity, radius 11 px, painted under the logo and seen through the ring's open centre. | ease-out `cubic-bezier(0.33, 1, 0.68, 1)` | 110 |
| 110 to 530 | Opening grows from 11 px to `r1`, revealing the new page out of the ring. | `cubic-bezier(0.3, 0.1, 0.2, 1)`: a short push, then a long settle | 420 |
| 110 to 530 | Water band width: 0 to 16 px (phone) or 24 px (desktop) at the midpoint, back to 3 px at the end. Two keyframe halves approximate the sine envelope. | ease-in-out per half | 420 |
| 110 to 560 | New page scale 1.03 to 1, origin at the ring centre, so the circle stays centred on the ring. | ease-out quint `cubic-bezier(0.22, 1, 0.36, 1)` | 450 |
| 150 to 330 | Ring hollow drains: sky disc opacity 1 to 0, as if the water flowed out with the ripple. | ease-in `cubic-bezier(0.4, 0, 1, 1)` | 180 |
| 420 to 560 | Drop re-forms at the spout: translateY -3 units to 0, scale 0.9 to 1, opacity 0 to 1. Logo is back to its true mark. | ease-out cubic | 140 |
| 560 | Transition finished; temporary names removed; the page takes input. | | |

Near the header the new page is readable by about 200 ms; the far corner of a phone screen opens last, at about 530 ms.

### Short pass: every later navigation in the tab (type `fm-quick`, 280 ms)

| Time (ms) | What moves | Easing | Duration |
|---|---|---|---|
| 0 | Logo held. No drop, no ring fill, no scale. | none | held |
| 0 to 280 | Opening grows from 11 px to `r1`. | ease-out `cubic-bezier(0.25, 0.6, 0.3, 1)` | 280 |
| 0 to 280 | Water band fixed at 3 px: sky line plus foam line, no body, no swell. | follows the opening | 280 |
| 280 | Finished. | | |

### Other navigations (type `fm-fade`, 180 ms)

Back and forward, a ring that is off screen on arrival (hash links such as `/book#callback`), and Save-Data: the new page fades in over the old for 180 ms with the logo held. No opening, no water.

## 4. Reduced motion (type `fm-calm`, 200 ms)

Designed as its own version, not a switched-off one. The shape of the idea stays (the ring is the constant, water touches the ring) with nothing that moves across the screen.

| Time (ms) | What changes | Easing | Duration |
|---|---|---|---|
| 0 to 200 | Old page dissolves into the new: opacity only, the browser's default cross-fade pair. | `ease` | 200 |
| 0 to 200 | Ring hollow glints with water: sky disc 0 to 35% to 0 opacity, inside the ring only (under 1% of the screen). | ease-in-out | 200 |
| whole pass | Logo held. The drop never moves. No opening, no band, no scale. | | |

The script picks `fm-calm` when `prefers-reduced-motion: reduce` matches. If the script fails, the CSS fallback under that media query is the plain default cross-fade. The global rule `* { animation: none !important }` in `global.css` does not touch `::view-transition-*` pseudo-elements (`*` matches elements only), so this version survives it; the drop's DOM animation does not run here anyway.

## 5. Build plan

### Layers, bottom to top

1. `::view-transition-old(root)`: the old page, `animation: none`, never moves.
2. `::view-transition-new(root)`: the new page, `mix-blend-mode: normal`, `clip-path: circle(var(--vt-r) at var(--vt-x) var(--vt-y))`, plus `transform: scale()` with `transform-origin: var(--vt-x) var(--vt-y)` on the full pass. Image pair gets `isolation: auto`.
3. `::view-transition-group(vt-water)`: a full-viewport group from an empty fixed element. The group's own `background` paints two gradients: the water band (`radial-gradient` at the ring centre with stops at `--vt-r` and `--vt-r + --vt-w`) and the ring-hollow disc (radius `--vt-rin`, alpha `--vt-fill`). Its old and new images show nothing.
4. `::view-transition-group(fm-logo)`: the header logo, held. Only the new image shows (`::view-transition-old(fm-logo) { display: none }`); the new image is live, so the drop's DOM animation plays inside it.
5. `::view-transition-group(fm-bar)`: the mobile sticky bar, held above the water so the Call button is never swept.

Groups stack in paint order: `.vt-water` gets `z-index: 39`, below the header's 40 and the bar's 50. Confirm the order in the first test.

### One clock for the edge and the water

`--vt-r`, `--vt-w` (`<length>`) and `--vt-fill` (`<number>`) are registered with `@property` and animated by identical keyframes on `::view-transition-group(root)` and `::view-transition-group(vt-water)`. Both start at `ready` on the same document timeline, so the band cannot drift from the edge. `::view-transition-new(root)` inherits `--vt-r` through the image pair. The cost: a custom-property clip and a gradient repaint each frame run on the main thread (see the main risk).

### The logo's part

- Name: `.site-header .brand-logo { view-transition-name: fm-logo }`. The footer logo stays unnamed (names must be unique).
- Drop: `scripts/build-logo.mjs` adds `class="fm-drop"` to the drop path, then `npm run logo` regenerates `src/assets/logo.svg` and `public/favicon.svg`; the drawing is unchanged. Keyframes run on `html:active-view-transition-type(fm-full) .fm-drop`, with `transform-box: fill-box`.
- Water in the ring: painted by the `vt-water` group underneath, seen through the ring's open centre, so the SVG gets no new shapes and the logo at rest is exactly the logo.
- If the old page was scrolled so its header is off screen (the header is not sticky yet), a `pageswap` handler drops the old logo's name for that navigation, so the logo cannot slide in from above. Once the parallel sticky-header change lands, this case disappears.

### The head script (inline, classic, in `<head>`, about 1 KB)

Registers `pagereveal`. If `e.viewTransition` is null (Firefox, reload, reduced motion opt-out), it returns. Otherwise:

1. Picks the type: `fm-calm` if reduced motion; `fm-fade` if traverse (`navigation.activation?.navigationType`, falling back to the Navigation Timing `type` on Safari, which lacks `activation` before 26.2), Save-Data, or the ring rect is outside the viewport; `fm-full` if `sessionStorage["fm-vt-seen"]` is unset (then sets it); else `fm-quick`. Wrapped in try/catch; any failure means `fm-fade`.
2. Reads the header ring's rect once (a layout the browser does for first paint anyway) and sets `--vt-x`, `--vt-y`, `--vt-rin`, `--vt-r1` and the band width on `<html>`.
3. Sets `view-transition-name: vt-water` on `.vt-water` for this transition only, so the old page captures no full-screen blank image, and clears it in `e.viewTransition.finished` (which also settles on skip).

No `blocking="render"`, no `rel=expect`. If the logo is not parsed yet when `pagereveal` fires, the script picks `fm-fade`.

### Files touched

- `src/styles/page-transition.css` (new): `@view-transition { navigation: auto }`, `@property` rules, pseudo-element rules per type, keyframes, reduced-motion fallback. Imported in `Base.astro`, inlined like `global.css`.
- `src/layouts/Base.astro`: the inline head script, the CSS import, and `<div class="vt-water" aria-hidden="true"></div>` (fixed, `inset: 0`, `pointer-events: none`, paints nothing at rest) before `<Header />`.
- `src/components/Header.astro`: `view-transition-name: fm-logo` on the brand logo.
- `src/components/StickyBar.astro`: `view-transition-name: fm-bar`.
- `scripts/build-logo.mjs`, regenerated `src/assets/logo.svg` and `public/favicon.svg`: the `fm-drop` class.
- Optional companion, measured before it stays: a `<script type="speculationrules">` with `eagerness: "moderate"` prerender for same-origin pages, excluding `/book` and `/emergency` (their load scripts restore `sessionStorage["fm-phone"]`, which a prerender would read too early).

### Waiting time and slow networks

- Cross-document view transitions start only once the new page is ready to render. Until then the old page stays visible and clickable, exactly as without the effect. Nothing plays during the wait, so nothing pretends to load.
- On a slow network the visitor waits the same time as today. If the new page takes over 4 s, Chrome skips the transition and the page simply appears.
- The cost that remains: input is blocked while the animation runs (560 ms once per tab, 280 ms after), and one vendor measured about +70 ms LCP on slow phones from the opt-in itself. Prerendering is the documented remedy. Lighthouse loads pages cold and never sees this, so it has to be measured with a click-through trace.

### Main risk

The edge and the water are driven by animated custom properties, which repaint on the main thread every frame. The new page's module scripts run during the same 560 ms. On a mid-range phone the opening could stutter. Gate: a DevTools trace at 4x CPU throttle on a click-through. If frames drop, switch the opening to keyframed `circle()` values (eligible for Chrome's compositor clip-path path) and keep the band only on desktop.

## 6. What could make this fail

- **It may read as a generic circle wipe.** Chrome's own demo is a circle reveal. The ring at 28 px is small: the drop falls 4 px and the ring hollow is 22 px across. The "through the ring" read depends on the opening being exactly concentric with the ring and starting under its stroke. If the owner sees "a circle from the corner", the idea has failed and needs a bigger ring moment, which would break the "logo holds still" rule.
- **Safari may flash the new page before the opening starts** (WebKit bug 310627, open). With a circle reveal, that looks like the page loaded twice. Plan: Safari gets `fm-fade` until a real iPhone shows the bug fixed.
- **iOS fixed bars may flash** during the transition (bugs 320238, 325199, same-document repros). Naming the sticky bar may help or may not; test on a phone.
- **Main-thread jank**, as above. Untested: `@property` animation on view-transition pseudo-elements in Safari, and whether a `var()`-driven `clip-path` avoids the Chrome 150 and 151 high-DPI clip-path regressions or hits them.
- **Over navy surfaces the band mostly disappears.** On inner pages the phone's first screen is mostly the navy hero, so only the two thin lines show there. The band reads best over paper sections and the home photo.
- **Group order and live-image animation are assumptions.** That the `vt-water` group stacks under the logo by paint order, and that the drop's DOM animation plays inside the live new logo image, follow from the spec and the recon tests but were not tested here.
- **Taps during the 560 ms first pass are lost.** The overlay must capture the root for the opening to work, so the click-through fix (`pointer-events: none` on `::view-transition`) does not apply.
- **The booking confirmation gets no transition.** `/book` reaches `/book/confirmed` through a scripted `location.href`, which `navigation: auto` excludes. Harmless, but inconsistent.
- **The wave tile is left out on purpose.** At band widths of 16 to 24 px, the 96x48 `--waves` tile shows less than one wave line and turns into noise. The opening passes over the real tile on heroes and the footer instead. If the owner wants the card's texture in the motion, this direction carries it poorly.
- **The flash budget holds but should be measured.** Each pixel sees one dark pass per navigation; the band covers about 6% of a phone screen and 3% of a desktop screen at any moment, under the 20% area guide, with no red. Two navigations in under a second would still be 2 passes, under 3.
