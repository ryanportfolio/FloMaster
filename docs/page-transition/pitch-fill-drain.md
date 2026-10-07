# Pitch: fill and drain

Direction by the fill-and-drain motion director, 2026-10-05. Built only from `facts.md`, the three recon files and `inspiration.md`. Nothing here has been built or tested yet; the open tests are listed in sections 5 and 6.

## 1. The feeling

When it ends, the visitor should feel that the site moved the way the business card looks, one calm tide in the card's navy rising and falling, and understand that the page in front of them is new and ready to use.

## 2. Visual direction

- A tide of the card's navy rises from the bottom edge of the screen. Its surface is the exact curve from the `--waves` tile, one period per 96 px, so the water's edge is the card's wave line, and the body carries the 96 x 48 wave-line texture itself.
- Three cues make it water, nothing more: color that deepens with depth (navy-700 `#24456d` at the surface to navy-950 `#0c1b30` at the foot), a 2 px foam line in sky-300 `#a9d2ea` riding the surface, and a slate-ink `#3d5f8c` back swell half a wave out of phase, showing as a thin band behind the crests.
- The surface is flat when it enters and when it leaves, and only waves mid-move: its height follows `sin(progress * PI)`.
- The tide stops below 20% of the viewport height. The page above changes by a plain cross-fade while the water is up, then the water drains and leaves the new page behind.
- The header's pipe ring is the level gauge. As the tide rises the ring fills to the brim with slate-ink water under a sky-300 surface line, behind the tap; as the tide drains the ring empties, and it settles last.
- The logo never moves, scales or changes color. The tap, drop, collars and wordmark stay exactly as drawn. Only the water inside the ring changes.
- No orange, no text, no new shapes. Every color is a brand token and every curve comes from the card tile or the ring's own geometry.

Why the tide stops at 20%: a full-screen navy fill over a paper page is one flash pair over most of the frame, which breaks the motion-design limit of keeping flashed area under about 20% of the frame. Navy over the navy heroes changes nothing, but navy over paper does, and the site has both. Capping the water keeps every navigation inside the limit on any page. This changes the brief's "ring fills as it passes" into "ring fills as the tide rises": the ring follows the tide in time, not in space.

## 3. Beat sheets

Time 0 is the first frame of the transition on the new page (the view transition's `ready`). Nothing plays before the new page has arrived.

Easing names used below:

- Spring rise: a spring with `visualDuration` equal to the stated duration and bounce 0.15, exported once to a CSS `linear()` curve, so the water arrives on the beat and makes one small damped swing after it.
- Ease-out: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Ease-in: `cubic-bezier(0.32, 0, 0.67, 0)`.
- Ease-in-out: `cubic-bezier(0.65, 0, 0.35, 1)`.

### Full pass: the first in-site navigation in a tab, 560 ms

The page the visitor lands on from a search result or a typed address has no transition: there is no previous page. The full pass plays on the first link they follow inside the site, once per tab.

| Start (ms) | End (ms) | Layer | What moves | Easing | Duration |
|---|---|---|---|---|---|
| 0 | 240 | Tide level | Rises from below the bottom edge to its peak level (`min(16svh, 20svh - 24px)`) | Spring rise | 240 ms |
| 0 | 520 | Tide surface height | Crest amplitude goes 2 px, to 18 px at 260 ms, back to 2 px (the card tile's own peak-to-trough is 18 px) | Ease-in-out each way | 520 ms |
| 0 | 520 | Tide surface drift | Front crest slides 48 px left (half a period); back swell slides 24 px right | Ease-in-out | 520 ms |
| 40 | 280 | Ring water | Level rises from below the ring floor to just under the top collar | Spring rise | 240 ms |
| 40 | 560 | Ring surface | Surface wave (card curve, 52-unit period, 3 units high) drifts 26 units | Ease-in-out | 520 ms |
| 140 | 380 | Page | Old page fades out while the new page fades in, opacities always summing to one, so no dip in brightness | Ease-in-out | 240 ms |
| 240 | 320 | Tide level | One damped swing settles at the peak (from the spring) | Spring tail | 80 ms |
| 320 | 500 | Tide level | Drains back below the bottom edge, revealing the new page's foot and its call bar | Ease-in | 180 ms |
| 360 | 540 | Back swell | Drains 40 ms behind the front, a thin slate-ink band receding last | Ease-in | 180 ms |
| 540 | 540 | Overlay | Transition ends; the page takes clicks again | n/a | n/a |
| 340 | 560 | Ring water | Drains below the ring floor; finishes on the live header after the overlay is gone, so it never blocks input | Ease-in | 220 ms |

Holds: the tide is at its peak from 240 to 320 ms, which is when the cross-fade passes its midpoint (260 ms). The rise (240 ms) to drain (180 ms) ratio follows the motion-design rule of exits at about 75% of the entrance.

### Repeat pass: every later in-site navigation, 280 ms

No logo moment, no cross-fade, and the page is clickable from the first frame (see section 5).

| Start (ms) | End (ms) | Layer | What moves | Easing | Duration |
|---|---|---|---|---|---|
| 0 | 0 | Page | New page shown in full, exactly as a normal navigation shows it today | Cut | 0 ms |
| 0 | 110 | Tide level | Rises to 8svh | Ease-out | 110 ms |
| 0 | 260 | Tide surface height | Amplitude 2 px, to 10 px at 110 ms, back to 2 px | Ease-in-out each way | 260 ms |
| 0 | 260 | Tide surface drift | Front crest slides 24 px left | Ease-in-out | 260 ms |
| 110 | 260 | Tide level | Drains below the bottom edge | Ease-in | 150 ms |
| 130 | 280 | Back swell | Drains 20 ms behind the front | Ease-in | 150 ms |

### Navigations that get no water

- Back and forward: no transition at all (skipped in script). This also keeps out of the way of the browser's own swipe-back animation.
- `tel:` links, hash links, the external DPOR link and the calendar download are not same-origin document navigations, so no transition starts.
- The booking form's move to `/book/confirmed` uses `location.href`, which `navigation: auto` excludes, so it is a plain navigation.

## 4. Reduced motion

Designed version, "still water", for `prefers-reduced-motion: reduce`:

- No tide, no wave, no ring fill, nothing that slides or wipes. Full-screen wipes are a known vestibular trigger, and even a 20% band moves.
- The page cross-fades in 180 ms (ease-in-out), the same on every navigation.
- The header logo is held perfectly still on its own layer above the fade, so the one constant on every page stays visibly constant while the content behind it dissolves. It shows in its true finished state: an empty ring, as drawn.
- Back and forward: plain navigation, as above.
- On Safari, if the new-page flash bug (WebKit 310627) reproduces, reduced-motion visitors get a plain cut instead of the dissolve, because a flash of the new page, then the old one, then the fade is the kind of flicker they asked to avoid.
- `@view-transition { navigation: auto; }` stays outside the media query so this designed dissolve can run. If the owner prefers a plain cut for these visitors, wrapping it in `@media (prefers-reduced-motion: no-preference)` gives that, and also removes the measured LCP cost for them.

## 5. Build plan

### Layers

| Layer | Carried by | How it is drawn | How it moves |
|---|---|---|---|
| Old page | `::view-transition-old(root)` (full pass only) | Browser snapshot | Default cross-fade, retimed to 140 to 380 ms |
| New page | `::view-transition-new(root)` (full pass only) | Live new page | Same cross-fade, `plus-lighter` kept so the sum never dips |
| Tide | A fixed element in `Base.astro`, `<div class="tide" aria-hidden="true">`, with `view-transition-name: tide` | Three children: `.tide-back`, `.tide-body`, `.tide-foam` | Level: `transform: translateY()` on `::view-transition-new(tide)`. Surface: `mask-size` and `mask-position` on the live children |
| Ring water | A `<g class="ring-water">` inside the header logo SVG, inserted before the tap so the tap stays on top | Slate-ink body and sky-300 surface line, clipped to the ring's clear interior (circle r 38.6 at 163.3, 65) | `transform: translate()` on the group (level and drift) |
| Logo | The header's `.brand-logo`, `view-transition-name: brand` (full pass and reduced motion) | Live element | Group `animation: none`; `::view-transition-old(brand)` hidden, so the logo neither fades nor jumps |

Details:

- **Tide shown only during a transition.** At rest `.tide` is `visibility: hidden; pointer-events: none; contain: strict`, sits at the bottom of the viewport, and costs nothing to paint. `html:active-view-transition-type(tide-full, tide-short) .tide { visibility: visible }` shows it only while a transition with one of those types runs. Its new snapshot is live, so the children's mask animations play through it, and the old snapshot is hidden (`::view-transition-old(tide) { display: none }`). Types clear on their own when the transition ends, so it hides again with no clean-up.
- **The wave edge.** `.tide-body` and `.tide-back` use a two-layer mask: the crest tile, an inline SVG of the card curve filled below (`M0 12 C12 0, 36 0, 48 12 S84 24, 96 12 V24 H0 Z`, viewBox `0 0 96 24`, `preserveAspectRatio='none'`), repeated along x at `96px var(--amp)`, plus a solid `linear-gradient` below it. `--amp` is a registered `@property` length, animated for the `sin(progress * PI)` envelope. `.tide-foam` is a sky-300 fill masked by the same curve drawn as a 2 px stroke with `vector-effect="non-scaling-stroke"`. `.tide-body`'s background is `var(--waves) 0 0 / 96px 48px` over `linear-gradient(#24456d, #0c1b30)`, which is the card face with depth. No `clip-path` anywhere, which avoids the Chrome 150 and 151 clip-path animation regressions.
- **Level on the compositor.** Only the level uses `transform`, on the pseudo-element. The surface changes (`--amp`, `mask-position`) repaint, but only on a strip at most 20% of the screen tall.
- **Picking the pass.** A classic inline script in `<head>` (about 600 bytes, no network request) listens for two events:
  - `pagereveal` on the new page:
    - No `event.viewTransition`: return.
    - Reduced motion: add type `calm`.
    - A traverse navigation (read from `sessionStorage`, written by `pageswap`, because Safari 18.2 to 26.1 lacks `navigation.activation`): `skipTransition()`.
    - Otherwise: add `tide-full` if the tab has no `fm-tide` flag, else `tide-short`. On `tide-full`, add class `ring-fill` to the header logo.
    - Set `fm-tide` only in `viewTransition.ready.then()`, so a first pass that the browser skips (slow page, 4 s limit) does not use up the full pass.
  - `pageswap` on the old page:
    - Store `event.activation.navigationType`.
    - If the next pass will be short, set `view-transition-name: none` on the root and the brand logo before the old snapshot is taken.
    - Undo that on `pageshow`, so a page restored from the back/forward cache is clean.
- **Repeat pass never blocks input.** In `tide-short`, the root and the logo carry `view-transition-name: none` on both pages, and `::view-transition { pointer-events: none }` is set, so the new page is live and clickable from frame 0 while the tide group plays above it. This is the pattern from Bramus Van Damme's interactivity post. The full pass needs the root captured for its cross-fade, so it blocks input for its 540 ms, once per tab.
- **Ring fill outlives the overlay.** `ring-fill` drives a normal CSS animation on the live header logo and removes itself on `animationend`. It shows through the `brand` group while the overlay is up and carries on in place after the overlay is removed at 540 ms. The ring never extends the time input is blocked.
- **Logo markup.** `scripts/build-logo.mjs` emits the ring-water group with its `<clipPath>`, and excludes it from the favicon. `Logo.astro` gets a `water` prop. Only the header passes it, so the footer logo omits the group and the page never has two elements with the same clip id. The water group sits inside `role="img"`, so it adds nothing to the accessibility tree.
- **Reduced motion CSS.** Under `@media (prefers-reduced-motion: reduce)`, `::view-transition-group(root)` gets `animation-duration: 180ms`, and the brand rules stay as above. The blanket `* { animation: none !important }` rule in `global.css` does not match view-transition pseudo-elements (`*` matches elements only). It does stop the tide and ring child animations, which never show in this mode anyway. Verify the 180 ms dissolve survives; `facts.md` warns the blanket rule may cancel a transition.
- **No added waiting.**
  - Nothing is render-blocking: no `blocking="render"`, no `rel=expect`.
  - The head script is inline.
  - The new page's first paint rules are unchanged.
  - The water never plays as a loading screen: it starts only once the new page is ready.

### Slow networks

The old page stays on screen and fully usable until the new page's response arrives and the browser commits. The browser shows its normal loading indicator, and no water appears while the visitor waits. If the new page takes longer than Chrome's 4 s limit, the transition is skipped and the page simply appears. The full pass stays available for the next navigation, because the flag is set only on `ready`. Speculation Rules prerendering would remove the measured LCP cost, but it is not in the first build. Add it only if field data shows the cost. If it is added, exclude `/book` and `/book/confirmed` (they read `sessionStorage` on load), and hold the repair story's first-view peek until `prerenderingchange`.

### Files touched

- `src/layouts/Base.astro`: the inline head script; the `.tide` element after `<StickyBar />`; import of the transition stylesheet.
- `src/styles/transition.css` (new, inlined by Astro like `global.css`): `@view-transition`, the pseudo-element rules, the keyframes, the `@property` for `--amp`, and the reduced-motion block. It has to be on every page, because the pseudo-element tree exists only in the destination document.
- `scripts/build-logo.mjs`, then `npm run logo` to regenerate `src/assets/logo.svg`. `public/favicon.svg` is regenerated unchanged.
- `src/components/Logo.astro`: the `water` prop.
- `src/components/Header.astro`: `<Logo class="brand-logo" water />` and the `view-transition-name: brand` rule.

### Main risk

WebKit bug 310627, open since 2026-03-24: on macOS and iOS Safari the new page can show for a frame before a cross-document transition starts. In the full pass that means new page, then old page, then the cross-fade: a visible flicker on the one navigation meant to impress. Test it first on a real iPhone and a Mac. If it reproduces, WebKit gets the full pass without the root capture. The tide rises over the new page as in the repeat pass, but at full height with the ring fill, so the early frame is the page that should be showing anyway. Detecting WebKit needs a user-agent check in the head script, which is fragile. Accept that only after the test.

A second risk to clear first: the tide uses a hidden named element, made visible by `:active-view-transition-type()`, with live mask animations inside it. Recon confirmed a static fixed named element stays above a reveal (Chrome 152). It did not test a hidden element shown by a type, or animations playing through a live snapshot. Spike it before anything else. The fallback is to inject the tide element in `pagereveal` (documented, untested) and remove it on `finished`.

## 6. What could make this fail

- **The ring is small.** The header logo is 1.75 rem tall, so the ring's clear interior is about 22 px across on a phone. The fill reads as a light line rising and falling inside a small circle, and some visitors will not notice it. The tide carries the "water" read; the ring is the detail people find on the second look. Making the ring bigger means changing the header, which this pitch does not do.
- **The capped tide may look like decoration, not the cause of the change.** The page swap is a cross-fade above the water, not the water covering the old page. If the owner wants the water to fill the whole screen, that version fails the flash-area limit on every light page, so I would not ship it.
- **iOS Safari and fixed bottom elements.** WebKit bugs 320238 (toolbar area turns solid when fixed content and transition pseudo-elements meet) and 325199 (white bar behind a floating bottom nav) were filed against same-document transitions. The tide is a fixed element at the very bottom edge, next to the iOS toolbar and over the call bar. Either bug could show as a flash right where the water is. Unconfirmed for cross-document transitions; test on a real iPhone on iOS 26.
- **Input is blocked for 540 ms on the full pass.** A tap in that window is lost. This happens once per tab, but a visitor who taps quickly on their first click will feel it.
- **LCP.** One vendor measured about +70 ms LCP on slow mobile from cross-document transitions. In the full pass the new page also fades in, and whether LCP then counts from the end of that fade is unconfirmed. Lighthouse loads pages cold and will never show either cost. Measuring needs a Lighthouse user flow with a navigation step or real-user data, before and after.
- **Repaint cost on slow phones.** `mask-size` and `mask-position` animations repaint on the main thread. On a slow phone the crest may stutter while the level, which runs on the compositor, stays smooth. If a throttled DevTools trace shows dropped frames, freeze the crest shape and keep only the level and drift.
- **The repeat tide covers the call bar for about a quarter of a second while it stays clickable.** A tap there still reaches the Call or Book button under the water. Visitors only tap that spot to use the bar, but it is a hidden target for 280 ms.
- **The full pass replays in every new tab** because the flag lives in `sessionStorage`. If that feels repetitive, switch to `localStorage` to play it once per browser.
- **Coverage.** Firefox has no water; it navigates normally. Samsung Internet is unknown (caniuse and MDN disagree). Swipe-back gestures replace any transition with the browser's own.
- **Untested end to end.** Nothing in this pitch has run. Only the parts from recon have been seen working, in Chrome 152 on Windows: a mask reveal on the root and a fixed named element staying on top. Every timing above needs to be judged by watching it play in headed Chrome on the GPU and on a real phone, then tuned by eye.
