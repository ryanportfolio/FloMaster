# Page transition recon: platform facts (view transitions)

Research date: 2026-10-05. Scope: a static multi-page Astro site, every navigation a full page load, wanting a water-and-logo transition between pages while keeping mobile Core Web Vitals good, meeting WCAG 2.2 AA and respecting `prefers-reduced-motion`.

How to read this file: every claim names its source. "Confirmed" means a primary source (spec, MDN, browser vendor, browser source code) or my own test says so. "Unconfirmed" means I found only a secondary source, conflicting sources, or nothing. "Own test" means I ran it myself in Chrome 152 on Windows through the isolated Playwright browser on a local server (details in section 9); these results hold for that one browser only.

Source index (short names used below):

- MDN-Using: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
- MDN-AtRule: https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition
- Chrome-XDoc: https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
- Chrome-SameDoc: https://developer.chrome.com/docs/web-platform/view-transitions/same-document
- Chrome-Misconceptions: https://developer.chrome.com/blog/view-transitions-misconceptions
- Chrome-2025: https://developer.chrome.com/blog/view-transitions-in-2025
- Spec-L1: https://drafts.csswg.org/css-view-transitions-1/
- Spec-L2: https://drafts.csswg.org/css-view-transitions-2/
- caniuse cross-document data: https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/cross-document-view-transitions.json (last data update 2026-09-30; live page https://caniuse.com/cross-document-view-transitions)
- MDN browser-compat-data (BCD), `@view-transition`: https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/at-rules/view-transition.json
- WebKit-18.2: https://webkit.org/blog/16301/webkit-features-in-safari-18-2/
- WebKit-TwoLines: https://webkit.org/blog/16967/two-lines-of-cross-document-view-transitions-code-you-can-use-on-every-website-today/

---

## 1. Browser support for cross-document view transitions

`@view-transition { navigation: auto; }` is the opt-in. Both pages must include it.

| Browser | Support | Source |
|---|---|---|
| Chrome (desktop, Android) | 126 and later | Chrome-XDoc, caniuse data, BCD |
| Edge | 126 and later | caniuse data, WebKit-TwoLines |
| Opera | 112 and later | caniuse data |
| Safari macOS | 18.2 (December 2024) and later | WebKit-18.2, BCD, caniuse data |
| Safari iOS and iPadOS | 18.2 and later | caniuse data (`ios_saf` 18.2 yes), BCD (`safari_ios` mirrors Safari) |
| Firefox desktop and Android | Not supported. Same-document transitions only (Firefox 144). | BCD sets `version_added: false` and points to bug https://bugzil.la/1860854; caniuse marks Firefox 144 to 160 as partial, meaning Level 1 only |
| Samsung Internet | Conflicting. Unconfirmed. | see below |

Details and caveats:

- Safari 18.2 shipped cross-document transitions, `view-transition-class`, view transition types, `pageswap` and `pagereveal`, `blocking=render` on script and style, and `<link rel=expect>` (WebKit-18.2).
- Chrome on iOS uses WebKit, so the iOS version should decide support there. This is my inference; I found no source that states it. Unconfirmed.
- Samsung Internet: caniuse data (updated 2026-09-30) lists every Samsung Internet release from 4 to 30 as "no". BCD marks `samsunginternet_android` as "mirror" of Chrome. BCD's own release table says Samsung 28 uses Chromium 130 and Samsung 30 uses Chromium 143 (https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/samsunginternet_android.json), which is above 126. The two sources disagree and I could not settle it. Unconfirmed: test on a real Samsung device if that audience matters. Either way the page degrades to a normal navigation.
- Global reach: caniuse data shows 85.97 percent of usage with full support and 1.81 percent partial. WebKit's May 2025 post says about 85 percent (WebKit-TwoLines).
- Unsupported browsers ignore the at-rule and do a normal instant navigation. No error, no polyfill. Sources: Chrome-Misconceptions ("Browsers that don't support them will ignore the CSS opt-in when parsing stylesheets"), WebKit-TwoLines ("The fallback is to do nothing").
- Feature detection in JavaScript: `'onpagereveal' in window` (https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance/main/skills/modern-web-guidance/guides/ui-behaviors/cross-document-transitions.md).

Companion APIs, from BCD (https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/PageSwapEvent.json and the matching `PageRevealEvent.json`, `ViewTransition.json`, `NavigationActivation.json`, `css/properties/view-transition-class.json`, `css/selectors/active-view-transition-type.json`):

| Feature | Chrome | Safari | Firefox |
|---|---|---|---|
| `pageswap` event | 124 | 18.2 | none |
| `pagereveal` event | 123 | 18.2 | none |
| `event.viewTransition` on both events | 126 | 18.2 | none |
| `PageSwapEvent.activation` | 124 | 18.2 | none |
| `navigation.activation` (`NavigationActivation`) | 123 | 26.2 | 147 |
| `ViewTransition.types` | 125 | 18.2 | 147 |
| `:active-view-transition-type()` | 125 | 18.2 | 147 |
| `view-transition-class` | 125 | 18.2 | 144 |
| `<link rel="expect">` | 124 | 18.2 | none |
| `blocking="render"` on link | 105 | 18.2 | none |

Consequence: on Safari 18.2 to 26.1, `navigation.activation` does not exist in `pagereveal`, so a transition that picks its variant from the old URL needs another route (for example `sessionStorage` written in `pageswap`, which does have `activation`). On Safari 26.2 and later it exists.

The Chrome documentation page shows an older support table for render blocking (Safari "x"). BCD and WebKit-18.2 are newer and say Safari 18.2 supports `rel=expect`; I trust them.

---

## 2. How the snapshots work and how to pick a transition per navigation

Lifecycle (MDN-Using, Spec-L2 section 8):

1. A same-origin navigation starts. The old page captures static image snapshots of every element with a non-`none` `view-transition-name`. `:root` has the name `root` by default (Spec-L1 section 5 user-agent stylesheet), so the whole page is one snapshot unless you change it.
2. The new page loads while rendering is held back. The pseudo-element tree exists in the new document only (MDN-Using: "the pseudo-element tree is made available in the destination document only"). Pseudo-element CSS therefore needs to be in the destination page's CSS; in practice put it in the shared stylesheet so it works in both directions.
3. The new snapshot is live (an interactive-looking replaced element, not a screenshot), the old one is a static image (Chrome-Misconceptions, misconception 1).
4. Default animation: old fades 1 to 0, new fades 0 to 1, with `mix-blend-mode: plus-lighter`, inside an image pair with `isolation: isolate`; default duration 0.25 s (Spec-L1 section 5; Chrome-SameDoc user-agent style summary).

Pseudo-element tree (MDN-Using):

```
::view-transition
  ::view-transition-group(root)
    ::view-transition-image-pair(root)
      ::view-transition-old(root)
      ::view-transition-new(root)
```

- Every extra `view-transition-name` adds another group with its own old and new pair. All groups sit in one flat overlay above the page. Chrome 140 added opt-in nested groups (Chrome-2025).
- Names must be unique per page. Two rendered elements with the same name skip the transition (MDN-Using).
- `view-transition-class` lets many differently named elements share styles: `::view-transition-group(*.card)` (Chrome-2025).
- `view-transition-name: match-element` auto-names elements, but "can only be used in same-document view transitions" because elements in different documents have different identity (Chrome-2025). Safari's `view-transition-name: auto` is reported as inconsistent across documents for elements without an `id` (secondary source, unconfirmed: https://blog.sakupi01.com/dev/articles/view-transition-name-auto).
- Setting an `animation-*` property on `::view-transition-group(x)` is inherited by the image pair, old and new since Chrome 140 (Chrome-2025), so one rule keeps durations in sync.

Events (Chrome-XDoc, MDN-Using):

- `pageswap` fires on the old page before its last frame renders. Use it for last-minute changes (setting names, adding an overlay) before the old snapshot. `event.viewTransition` is non-null only if a transition will run. `event.activation` holds the destination entry.
- `pagereveal` fires on the new page after it is initialized and before the first rendering opportunity. Use it to set names or types before the new snapshot is taken. After the document is hidden, the old page's `ViewTransition` is skipped.
- Both events fire for every same-origin navigation, with or without a transition.
- The `pagereveal` listener "needs to execute before the first rendering opportunity", so register it in a classic parser-blocking `<script>` in `<head>`, or an async/module script marked `blocking="render"` (Chrome-XDoc).
- Clean-up: remove temporary `view-transition-name` values after the snapshots are taken. If they stay set, the page restored from back/forward cache can end up with duplicate names and skip the transition (MDN-Using, Chrome-XDoc).

Types, to choose a variant per navigation:

- Static: `@view-transition { navigation: auto; types: slide, forwards; }` (MDN-AtRule, Chrome-XDoc).
- Dynamic: `e.viewTransition.types.add('name')` in `pageswap` and `pagereveal`. Types are not copied from the old page's transition to the new page's; set them on the new page at least (Chrome-XDoc).
- Style by type with `html:active-view-transition-type(forwards) { &::view-transition-new(root) { ... } }` (Chrome-XDoc).
- Types are cleared when the transition finishes, so they work with back/forward cache (Chrome-XDoc).
- Direction inputs: `navigation.activation.from.url`, `.entry.url`, `.navigationType` (`push`, `replace`, `traverse`).

What `navigation: auto` covers (MDN-AtRule, Chrome-XDoc, Spec-L2 section 8.1.1 and 12.5.1.1):

- Applies to `traverse` (back/forward), and to `push` or `replace` when the visitor started it by interacting with the page (link click, form submit).
- Excludes reload, navigations from the address bar or a bookmark, scripted `location.href` changes, anything with a cross-origin redirect, and anything where the page was hidden during the navigation.

---

## 3. Limits

**Duration limit.**

- Chrome documentation: "If a navigation takes too long (more than four seconds in Chrome's case) then the view transition is skipped with a TimeoutError DOMException" (Chrome-XDoc). The spec leaves the duration to the browser: "Wait for an implementation-defined duration" (Spec-L2 section 12.5.1.2).
- Chromium source shows two separate 4 second timers, not one. (a) The browser process waits for the old page to hand back its snapshot before it commits the navigation, with a 4 s fallback: `ViewTransitionCommitDeferringCondition::GetSnapshotCallbackTimeout()` returns `base::Seconds(4)` (https://chromium.googlesource.com/chromium/src/+/main/content/browser/renderer_host/view_transition_commit_deferring_condition.cc). (b) The new page, once rendering is paused for the transition, has a 4 s timer that ends in a skip with `kRejectTimeout` (https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/view_transition/view_transition.cc, `PauseRendering` and `OnRenderingPausedTimeout`).
- A CSS-Tricks article says the clock starts at navigation start, so TTFB counts (https://css-tricks.com/cross-document-view-transitions-part-1/). The source code does not obviously say that. Unconfirmed: exactly when the clock starts.
- There is no documented cap on the animation's own length. The skip is about the new page not becoming ready. A transition whose animation runs 1.2 s plays fully (own test: `finished` fired about 1.2 s after `ready`). Note that a long animation holds off page interaction (see "clicks" below).
- Chrome's `ViewTransition` waits for animations to end before `finished`. `ViewTransition.waitUntil()` can hold it longer (Chrome 144, BCD; Chrome-2025).

**Clicks during the transition.**

- The `::view-transition` overlay "gets overlayed on top of the document and captures all the clicks" (Bram Verdonck, Chrome DevRel: https://www.bram.us/2025/01/29/view-transitions-page-interactivity/).
- The spec says that while the transition animates, elements captured in it "do not respond to hit-testing (as if they had pointer-events: none)" and are not painted in place (Spec-L2, section on view transition painting and layout; same text in Spec-L1). Since `root` is captured by default, the whole page is unclickable for the duration of the animation. Accessibility tree access is unchanged (spec same section), and the transition tree itself is not exposed to the accessibility tree (Spec-L2 section 5.2).
- Fix: `::view-transition { pointer-events: none; }` plus `:root { view-transition-name: none; }` so clicks fall through (same Bram article). A wave that masks `::view-transition-new(root)` needs `root` captured, so this fix is off the table for that design. Keep the animation short.
- Rendering suppression window: while a document's rendering is suppressed for the transition (the capture step), "all pointer hit testing must target its document element" (Spec-L2 section 12.1.1).
- Keyboard events are not mentioned in the spec's hit-testing text. Unconfirmed: whether a keyboard activation during the animation starts a new navigation. Spec-L2 12.5.1.2 says an active transition in the old document is skipped with `AbortError` when the next navigation is ready to swap, so a second navigation interrupts the first.
- Only one view transition runs per document at a time; starting another skips the running one to its end (Chrome-SameDoc, Chrome-Misconceptions).

**How long the browser waits for the new page.**

- Browsers start rendering after loading `<head>` stylesheets, parsing render-blocking scripts and enough markup. "Cross-document view transitions don't change this: the content required for First Contentful Paint is unaltered" (Chrome-Misconceptions, misconception 4).
- You can delay the first render on purpose with `<link rel="expect" href="#id" blocking="render">`, which waits for the element to be parsed, not for images to load (Chrome-XDoc). Built-in safeguard: if `</html>` is seen without the element, blocking ends (Chrome-Misconceptions). Chrome's guidance: avoid `blocking=render` unless you measure its effect on Core Web Vitals (Chrome-XDoc).
- `rel=expect` only waits for the DOM node, so an `<img>` in the new snapshot can still be undecoded and show as an empty box (https://github.com/GoogleChrome/modern-web-guidance-src/issues/1649, an issue on Google's own guidance repo; secondary evidence).
- The spec warns that overusing render blocking "could make it so that the old state remains frozen for a long time" (Spec-L2 section 8.1.2).
- While the new page loads, the old page's last frame stays on screen "until either the pagereveal event is fired, or its active view transition's phase is done" (Spec-L2 section 12.5.1.2). Chrome's cost for the capture itself is "two stale frames at most" (Chrome-Misconceptions, misconception 5).
- Chrome 4 s ceiling: see "Duration limit".

**Slow networks.**

- The old page stays visible and live until the new document's response arrives and the browser commits (Chromium source, commit deferring condition above, runs when the navigation is ready to commit). Then the old page snapshots, then the new page renders.
- Slow TTFB or slow render-blocking resources therefore extend how long the visitor stares at the old page. If the new page misses the 4 s limit, the transition is skipped and the page just appears.
- Chrome's mitigation advice: prerender with the Speculation Rules API so pages are already rendered (Chrome-XDoc).
- A proposal for "two-phase" cross-document transitions (start an animation at navigation start, finish when the new page is ready) exists at https://chromestatus.com/feature/5568746374692864, status "Proposed". Not available. Confirmed as proposal only.
- A same-origin redirect chain is fine; a cross-origin redirect anywhere skips the transition and makes `activation` null (MDN-Using, Spec-L2).

**Back/forward cache and prerender.**

- `pagereveal` fires both on a fresh load and on activation from back/forward cache or prerender (MDN-Using). Traverse navigations are included in `navigation: auto` (Chrome-XDoc).
- Anything you add to the old page in `pageswap` (names, overlay elements) is saved in the cached page. Remove it after `viewTransition.finished`, or on `pagehide`/`pageshow`, so it is not there on return (MDN-Using explains the duplicate-name case; the overlay case follows the same logic and is my extension, unconfirmed by a source).
- Types are cleared automatically at the end of each transition (Chrome-XDoc).

**Same-origin requirement.**

- Cross-origin navigations never transition, even same-site (`developer.chrome.com` to `www.chrome.com` fails). Scheme, host and port must all match (Chrome-XDoc). If the site serves both `www` and the apex, the transition only works within one of them.
- Chrome's cross-document transitions are main-frame only in the first release; iframes were planned later (Chrome-XDoc). Irrelevant here.

**Browser-owned gestures.**

- The spec lets the browser ignore the author's transition when it shows its own navigation animation, "e.g. a gesture-based transition for a back navigation" (Spec-L2 section 12.5.1.1). Swipe-back on iOS Safari and Chrome on Android with its experimental back transition flag can therefore replace or suppress yours (Chrome-SameDoc, vtbag: https://vtbag.dev/tips/view-transition-fails-and-fixes/). Plan for the transition to be absent on swipe-back.

---

## 4. Effect on LCP, INP, CLS and FCP

There is no Chrome-team or web.dev page that measures this for cross-document transitions. What exists:

**Official statements (confirmed).**

- FCP and first-render rules are unchanged: "the content required for First Contentful Paint is unaltered" (Chrome-Misconceptions). Only `blocking=render` additions delay first paint, and Chrome says to measure them (Chrome-XDoc).
- Old page stays visible a little longer while the new view is prepared (about two frames) (Chrome-Misconceptions).
- LCP ignores elements with opacity 0 until they are visible (web.dev LCP: https://web.dev/articles/lcp, "Elements with an opacity of 0, that are invisible to the user" are excluded in Chromium). A reveal that starts the new page at full opacity, with the content hidden by a mask rather than by opacity, is not the opacity-0 case. I did not find a source that says how a mask or clip-path hides a candidate. Unconfirmed.
- A fade-in on the LCP element pushes LCP to the end of the fade: "Chrome takes the end of the animation period as the LCP measurement" (https://csswizardry.com/2022/03/optimising-largest-contentful-paint/). That page is about element animations. I found no source that applies the same rule to a view transition snapshot. Unconfirmed for transitions.
- Back/forward cache restores and prerender activations are measured differently from fresh loads (web.dev LCP).

**Field measurement (secondary, one vendor).**

- CoreDash ran an A/B test on 5 sites for 7 days with `@view-transition { navigation: auto; }` on half the page views. From about 120,000 mobile page views that came from in-site navigations, it measured about +70 ms LCP on repeat mobile views. Lab runs: +5 ms (no throttle, cached) to +77 ms (20x CPU slowdown, no cache); the penalty grows as CPU slows (https://www.corewebvitals.io/pagespeed/view-transition-web-performance, updated 2026-02-27). One vendor's data, no independent confirmation found.
- Their mitigations: wrap the opt-in in `prefers-reduced-motion: no-preference` (removes the cost for those users), combine with Speculation Rules prerender (transition between already-rendered pages), keep LCP headroom, optionally limit to wide screens.

**INP.**

- A transition does not itself create an interaction. The risk is the freeze: while rendering is paused for capture, nothing paints, so a tap during that window gets a late next paint (https://kurtextrem.de/preview/improve-inp-vt, 2024, about same-document callbacks; the freeze logic is the same idea, "the browser does not paint in that period").
- During the animation the overlay absorbs pointer input (section 3). A tap on a captured area does nothing. Whether the browser counts such a tap as an interaction in INP: unconfirmed.
- Chromium's metrics changelog (https://github.com/chromium/chromium/tree/main/docs/speed/metrics_changelog) has no entry mentioning view transitions for LCP, FCP, CLS or INP. I searched the four main metric files and the 2025 to 2026 entries for "view transition", "pageswap" and "snapshot". Nothing found.

**CLS.**

- The snapshot overlay is built from absolutely positioned pseudo-elements animated with transform and opacity, and the page below does not reflow. web.dev says gradual, transform-based movement is fine for layout stability (https://web.dev/articles/cls). Layout shifts within 500 ms of user input are excluded by the `hadRecentInput` flag (same article).
- Each navigation is a fresh document with its own CLS, so the old page's snapshot does not add to the new page's score. This is my reading; no source states it. Unconfirmed.
- Real CLS risk is a mismatch between what the old snapshot showed and the first frame of the new page (fonts, late CSS). The fix is blocking on critical styles and scripts so the new page is stable when the transition starts (MDN-Using section "Stabilizing page state", Google guidance: https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance/main/skills/modern-web-guidance/guides/ui-behaviors/consistent-cross-document-transitions.md).

**Lighthouse.**

- No source found on how Lighthouse treats cross-document transitions. Lighthouse's default navigation run loads the page cold from `about:blank`, so no old page exists to transition from; my expectation is that it never plays the transition. Unconfirmed inference. To see the effect, use real-user measurement or a Lighthouse user flow with a navigation step. Do not rely on a green Lighthouse score as proof the transition is free.
- Automation browsers may not run cross-document transitions at all (secondary: https://earezki.com/ai-news/2026-07-31-my-zero-js-page-transitions-flashed-white-two-bugs-two-causes-one-blend-mode-id-never-heard-of/, aggregator; unconfirmed). My own test did run them in Playwright Chromium 152 on Windows, so this is not universal.

Does the animation delay LCP for real users? The honest answer from the sources: measured at about 70 ms on slow mobile in one vendor's data, structurally small on fast devices, and zero effect on first-render rules unless render-blocking is added. No official Chrome figure exists.

---

## 5. Masks and clip-paths on `::view-transition-new(root)`

**Own test (confirmed in Chrome 152, Windows):**

- `mask-image` with an inline SVG data URL (wavy top edge, opaque below) plus an animation of `mask-position` on `::view-transition-new(root)` works for a real cross-document navigation. Screenshot mid-transition showed the new page rising from the bottom behind a wave-shaped edge, with the old page visible above it. Required companion CSS: `::view-transition-old(root){animation:none}`, `::view-transition-new(root){mix-blend-mode:normal}`, `::view-transition-image-pair(root){isolation:auto}`. The transition lasted about 1.2 s (`ready` to `finished`).
- `clip-path: path('M0 ... Z')` animated through `@keyframes` between two paths with the same command structure also works on the root pseudo-element. Caveat seen in the test: `path()` coordinates are fixed CSS pixels. I wrote the path for a 1200 px wide box and the test viewport was about 915 px wide, so the wave edge was cropped on the right, and it would not scale across screen sizes. For responsive reveals use `inset()`, `circle()`, `polygon()` with percentages, or a `mask-image` SVG with `mask-size: 100% 100%` and `preserveAspectRatio='none'`. (`shape()` is a newer responsive function; I did not test it. Unconfirmed.)
- `clip-path: inset()` keyframes on the root pseudo-element also ran a full transition (own test, the fixed-element and reduced-motion test pages; the `inset` visuals were seen in the fixed-element screenshot).

**Documented support:**

- MDN's own example animates `clip-path: circle(...)` on `::view-transition-new(root)` through the Web Animations API with `pseudoElement: "::view-transition-new(root)"`, after setting `::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; display: block; }` and `::view-transition-image-pair(root) { isolation: auto; }` (MDN-Using, "A JavaScript-powered custom same-document (SPA) transition"). The same pseudo-elements and animation properties apply to cross-document transitions; MDN-Using demonstrates cross-document custom animations using `animation` on `::view-transition-old/new(root)`.
- `::view-transition-old` and `::view-transition-new` are replaced elements, so `object-fit`, `object-position`, `mask-*`, `clip-path`, `filter` and `mix-blend-mode` apply as on an image (Spec-L1 sections on the pseudo-elements; MDN-Using).
- The default cross-fade uses `mix-blend-mode: plus-lighter` inside an isolated image pair. If you replace the fade with a mask reveal, set `mix-blend-mode: normal` and `isolation: auto`, otherwise overlapping layers add their colours and can flash bright (Spec-L1 section 5; Chrome-SameDoc; one aggregator reports white flashes from this, unconfirmed: the earezki link above).

**Compositor versus main thread (partly confirmed, partly not):**

- Chromium has a stable feature `CompositeClipPathAnimation` (https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/runtime_enabled_features.json5 lists it with `status: "stable"`). Its implementation runs `clip-path` animations through a native paint worklet that interpolates basic shapes as paths (https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/modules/csspaint/nativepaint/clip_path_paint_definition.cc and `compositor_animations.cc`). The code handles basic shapes; geometry-box values are listed as a TODO. A WebKit bug comment from 2026-01-28 says "Chromium is getting close to launching this" (https://bugs.webkit.org/show_bug.cgi?id=185816). So by Chrome 150 it was live. I could not find the milestone it shipped in. Unconfirmed.
- Whether a `clip-path` animation targeting a view-transition pseudo-element is eligible for this path, and whether `path()` specifically qualifies, I could not confirm from the code. Unconfirmed.
- Regressions tied to this feature in Chrome 150 and 151: a Chromium tracker entry (https://doc-4ehg-4da0-issuetracker.googleusercontent.com/issues/538488442) says `inset(... round ...)` with an offset of exactly 100 percent fails to animate and links a P1 bug titled "View Transition API clip-path animation mispositioned on Windows high DPI in Chrome 150", attributed to `CompositeClipPathAnimation`. The Motion library's issue #3786 reports a clip-path animation staying frozen then jumping on Chrome 151 (https://github.com/motiondivision/motion/issues/3786), and a comment there says `inset()` animates only with percentage values. I did not open the linked high-DPI bug. Treat clip-path on the view transition root as a regression risk on recent Chrome and test on Windows high DPI.
- Safari does not run clip-path animations on the compositor: WebKit bug 185816 is still NEW, with a pull request filed 2026-06-01 (same bugs.webkit.org link). Firefox: not checked. Unconfirmed.
- `mask-image` and `mask-position` animation is a paint-time operation, not a compositor-only one. Motion's performance guide lists the compositor-capable properties as transform, opacity, filter and clip-path, and says animating `mask-image` costs more than `background-color` because it redraws an image (https://motion.dev/magazine/web-animation-performance-tier-list). Secondary source; consistent with my knowledge, no first-party Chrome statement found. Unconfirmed first-party.
- The cheapest reveal: put an SVG mask on a layer and animate `transform` (translate the whole wave shape) instead of `mask-position` or path data. A transform on a view transition group or pseudo-element runs on the compositor, but a transform of the mask image itself needs a mask on a transformed element, which the pseudo-element does not give you. My own test did not measure frame cost for any option. Not measured.
- Chrome's same-document guide says animating `width` and `height` on `::view-transition-group` runs layout per frame and that off-main-thread handling is planned (Chrome-SameDoc). A 2025 post says width/height animations can now avoid the main thread in some conditions (https://www.bram.us/2025/11/13/animating-css-width-or-height-no-longer-force-a-main-thread-animation-in-chrome-under-the-right-conditions/). Not needed for a mask reveal.

Measure it: the simplest check is a Chrome DevTools Performance trace on a throttled phone profile, looking at the main-thread activity during the transition and at whether animations are flagged as non-composited.

---

## 6. Showing extra decoration (logo, water layer) that is not on both pages

Four routes. Only the first two are confirmed by my own tests or documentation.

1. **A fixed element present on every page with a shared `view-transition-name`.** Put the same fixed logo or water layer element in the shared layout, give it `view-transition-name: logo`. It gets its own group, painted above the `root` group, and can be animated or held steady with `::view-transition-group(logo)`, `::view-transition-old(logo)`, `::view-transition-new(logo)`. Own test: a gold fixed square named `logo` stayed on top of the revealed `root` throughout a 1.2 s mask-style reveal. This also fixes the "sticky or fixed header fades with the page" problem (section 8). The element is captured as a bitmap, so keep it small to limit capture cost.
2. **Pseudo-element styling on `::view-transition` and the groups.** Backgrounds and other box properties on `::view-transition`, `::view-transition-group(root)` or a named group work like on normal elements. I confirmed the group's visual layers by test; I did not test `background` on `::view-transition` itself or `::before` / `::after` on these pseudo-elements. Unconfirmed: the specs do not list generated content for them, and I could not confirm browser behaviour. The pseudo-tree exists only in the destination document for cross-document transitions (MDN-Using), so it can only decorate what the new page's CSS describes.
3. **Overlay added during `pageswap` on the old page.** `pageswap` runs before the old frame is captured, so a DOM element added there is part of the old snapshot (or, if it has its own `view-transition-name`, its own group) (Chrome-XDoc: "do some last-minute changes on the outgoing page, right before the old snapshots get taken"). The old snapshot is static, so the overlay cannot animate in the old document; animate it only through the pseudo-element groups in the new document. Remove it after `viewTransition.finished` or on `pagehide` so back/forward cache restores do not keep it (MDN-Using logic for names).
4. **Overlay added during `pagereveal` on the new page.** `pagereveal` runs before the first render of the new page, so an element injected there (with a `view-transition-name` if you want it separate) is in the live new snapshot and can be driven by CSS or the Web Animations API through `ready`/`finished` (Chrome-XDoc). Needs the listener in a render-blocking script in `<head>` (Chrome-XDoc). Not tested by me; the mechanism is documented but my claim that it works for a water overlay is unconfirmed.

Pass information from the old page to the new one with `sessionStorage` (Chrome-XDoc's click-position example) or, on browsers that have it, `navigation.activation`.

Dynamic names: `match-element` does not work across documents (Chrome-2025). Use explicit names or set names in `pageswap`/`pagereveal` just in time (Chrome-XDoc profile example).

---

## 7. Reduced motion

Chrome and WebKit give different advice; both are on the record.

- Chrome (same-document guide): either disable all view transition animation, with `@media (prefers-reduced-motion) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }`, or "choose a more subtle animation" because reduced motion "doesn't mean the user wants no motion" (Chrome-SameDoc).
- Google's cross-document guide gives two patterns: opt in only when motion is fine, `@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }`, and a "copy-paste safety" version, `@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }` (https://raw.githubusercontent.com/GoogleChrome/modern-web-guidance/main/skills/modern-web-guidance/guides/ui-behaviors/consistent-cross-document-transitions.md and `cross-document-transitions.md` in the same folder).
- WebKit: a plain cross-fade "doesn't introduce motion" and "simple crossfades are not known to cause adverse effects in those with motion sensitivity"; remove the zooming, scaling, sliding and parallax kinds (WebKit-TwoLines).
- Own test: with `@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }`, emulating `reduce` gave `event.viewTransition === null` on `pagereveal` (no transition at all, plain navigation); `no-preference` gave a normal transition.
- Recommended pattern for this site: keep `@view-transition { navigation: auto; }` outside the media query and override the pseudo-elements under `@media (prefers-reduced-motion: reduce)` to a 150 to 200 ms opacity cross-fade with the wave and logo layers hidden (`animation: none; display: none` on the decoration groups). Or use the guide's `navigation: none` for a hard cut. Both meet the intent; the cross-fade keeps continuity for people who only dislike movement. This recommendation is mine, built on the sources above.
- Since the same stylesheet must be on both pages, put the media query in the shared CSS.

WCAG 2.2 position:

- 2.3.3 Animation from Interactions is Level AAA, so it is not required for AA, but it says non-essential motion triggered by interaction should be possible to disable, and its example is exactly a "page-flipping animation that respects prefers-reduced-motion" (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- 2.3.1 Three Flashes or Below Threshold is Level A: nothing may flash more than three times per second above the thresholds (https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html). A single reveal is not a flash. Avoid bright full-screen pulses (a bad blend mode can cause one, section 5).
- 2.2.2 Pause, Stop, Hide (Level A) targets automatic moving content over 5 seconds. A transition shorter than 5 seconds started by the visitor does not fall under it (my reading of the criterion; unconfirmed by quoting its text).
- The transition tree is not exposed to assistive tech and the real page is in the accessibility tree during the animation (Spec-L2). Focus order and screen-reader reading of the new page are unchanged. I did not test a screen reader.

---

## 8. Known bugs and gotchas, 2025 to 2026

WebKit (Safari, iOS), all open in WebKit Bugzilla as of the dates shown:

- Bug 310627, filed 2026-03-24: "Cross-document view transition flickers the new page before transition starts playing". On macOS Safari and iOS 26.3.1 the new page's final frame flashes before the animation starts, shown with Chrome's own demo (https://view-transitions.chrome.dev/circle/mpa/index.html). Reporter says it makes cross-document transitions hard to adopt. Status NEW (https://bugs.webkit.org/show_bug.cgi?id=310627). This directly hits a reveal effect where the new page must not show early.
- Bug 325199, filed 2026-09-24: view transitions show a white/blank bar behind a floating bottom nav on iOS Safari; reproduced with Chrome's same-document demo (https://bugs.webkit.org/show_bug.cgi?id=325199). Relevant to fixed bottom bars. This one was filed against same-document transitions; whether cross-document ones show it too is unconfirmed.
- Bug 320238, filed 2026-07-24: on iOS Safari with the transparent top and bottom toolbars, the view transition pseudo-elements make the header and footer area turn solid during the animation, a visible flash. A WebKit engineer says Safari samples the top 6 px of the viewport when `position: fixed` content is present and the pseudo-elements count (https://bugs.webkit.org/show_bug.cgi?id=320238). Mitigations tried by the reporter had "limited success". The most successful was removing the root transition. Same-document repro; unconfirmed for cross-document.
- Bug 288795 (open since 2025-02): on iOS, starting a view transition interrupts an in-progress scroll inside the transitioning area (https://bugs.webkit.org/show_bug.cgi?id=288795).
- Bug 290146 (2025-03): `view-transition-name` from a newly loaded uncached stylesheet may not be picked up if the transition starts in the same frame, so the old snapshot lacks the named element (https://bugs.webkit.org/show_bug.cgi?id=290146). Inline critical CSS or ensure styles load before the transition.
- Bug 326285 (2026-10-04): WebKit is making snapshot capture asynchronous for site isolation (https://bugs.webkit.org/show_bug.cgi?id=326285). Behaviour may shift in a coming Safari. Informational.
- Safari 18.2 `view-transition-name: auto` inconsistencies across documents (secondary, link in section 2).
- Safari 18.2 to 26.1 has no `navigation.activation` (section 1).
- iOS 26 Liquid Glass toolbar tinting scans fixed and sticky elements near viewport edges (https://1ar.io/updates/safari-26-liquid-glass-web/, secondary), which is a likely reason fixed header and footer elements and transition pseudo-elements interact oddly in bug 320238. Not specific to transitions.

Chrome and Chromium:

- Chrome 150 and 151 clip-path regressions tied to compositor clip-path animation (section 5).
- Position of `::view-transition` changed from fixed to absolute in Chrome 142, with no visual change (Chrome-2025).
- Chrome 140 shipped the `finished` promise timing fix and the animation-property inheritance on pseudo-elements (Chrome-2025).
- Chrome 4 s timeouts skip transitions silently (section 3). Add a `pagereveal` listener that logs when `event.viewTransition` is null or `finished` rejects with `TimeoutError`.
- A GitHub issue on a user app reports a cross-document transition leaving the arriving page unrendered with no `pagereveal`; removing the opt-in fixed it. Single app report, not a confirmed Chromium bug (https://github.com/Koopa0/yomihon/issues/474).

Sticky and fixed headers and bars (any browser):

- With the default `root` snapshot, a fixed or sticky header is baked into the root bitmap and cross-fades or moves with the whole page. The standard fix is a shared `view-transition-name` on the header on both pages so it is its own group and stays put (WebKit-TwoLines notes that identical elements "stay exactly in place" but only for what is the same inside the root image; a separate named group is the dependable way; secondary: https://github.com/zagrajmy/ludamus/pull/260). Own test confirmed that a fixed named element stays above the reveal.
- Everything inside a named group is rasterized, so interactive-looking elements in a snapshot are not clickable until the transition ends (section 3).
- Mobile browser UI: the snapshot area covers the full window area where content can appear, including the URL bar region and the keyboard, so root snapshots stay the same size when the URL bar collapses (Spec-L1 section 4.1, with its mobile diagram). Unit gotcha: `dvh`-sized elements differ between old and new states when the bar collapses; prefer `svh` or `lvh` for elements that must match (secondary, search summary of CSSWG issue 7859: https://github.com/w3c/csswg-drafts/issues/7859; unconfirmed). Give `html` a background colour so any extended snapshot area has a fill.
- Unstyled first frame: if the new page's CSS arrives late, the first frame can be the browser default white. Inline critical CSS with a background colour (aggregator article above; also consistent with the Google guidance on render-blocking styles).
- Stale or wrong first frame from late fonts or CSS: block rendering on critical CSS and scripts, and use `<link rel="expect" blocking="render">` for above-the-fold content (Google guidance links in section 4).
- Duplicate `view-transition-name` on one page skips the transition (MDN-Using). Names left set on elements in a page that goes into the back/forward cache cause this on return.
- A named image stretched during a transition looks warped because snapshots are scaled bitmaps; use `object-fit` on the pseudo-elements (CSS-Tricks part 1, link in section 3). Not relevant to the root reveal.

Testing gotcha (my own run, 2026-10-05): after I started a throwaway Node server named `server.mjs` and finished, I tried to stop it with a process filter that matched the substring `server.mjs`; it matched 23 unrelated Node processes and stopped them. Always stop by the exact process ID returned when starting. This note is for whoever continues this work on this machine.

---

## 9. What I ran myself

- Environment: isolated Playwright browser, Chrome 152 (user agent string `Chrome/152.0.0.0`), Windows, local Node HTTP server serving two pages (A blue, B red) that link to each other, both with `@view-transition { navigation: auto; }` and a `pagereveal` listener logging `event.viewTransition`, `ready` and `finished`.
- Mask test: `::view-transition-new(root)` with an inline SVG wave `mask-image`, `mask-size: 100% 100%`, `mask-position` animated from `0 100%` to `0 -10%` over 1.2 s, `::view-transition-old(root)` animation none, new at `mix-blend-mode: normal`, image pair `isolation: auto`. Result: transition ran (`ready` 86 ms, `finished` 1263 ms after reveal start); mid-frame screenshot showed a wave edge rising with old page behind it.
- Clip-path test: animated `path()` clip on the new root; ran (`finished` about 1.2 s); mid-frame showed a wavy edge, but the fixed-pixel path did not span the viewport width.
- Fixed named element test: a 60 px gold fixed square with `view-transition-name: logo` plus an `inset()` clip reveal on root; the square stayed visible and on top during the reveal.
- Reduced motion test: `emulateMedia({reducedMotion:'reduce'})` with the opt-in inside `@media (prefers-reduced-motion: no-preference)` gave no transition (`viewTransition` null); `no-preference` gave one.
- Not tested: Safari, Firefox, real phones, frame cost or compositor use, Lighthouse, a screen reader, `pageswap` overlays, `link rel=expect` timing, throttled networks, the 4 s timeout.
- Screenshots: `D:\screenshots\FloMaster\page-transition\mask-mid-0.png`, `mask-mid-1.png`, `path-mid.png`, `fixed-mid.png`.

---

## 10. Summary for the design

- Cross-document view transitions work in Chrome and Edge 126+, Safari and iOS Safari 18.2+, about 86 percent of users by caniuse. Firefox does not have them (Samsung Internet is unclear). Everyone else gets a plain navigation, so the water effect must be decoration, never required.
- A wave-shaped mask reveal on `::view-transition-new(root)` is feasible and was confirmed in Chrome 152. The page cannot be clicked during the animation, so keep it short.
- The animation does not move first-render timing by itself. Expect up to a small LCP cost on slow phones (one vendor measured about 70 ms) and none from render blocking unless you add it. No official Chrome figure exists; measure with real-user data.
- Keep the opt-in or the heavy layers behind `prefers-reduced-motion`; offer a short plain cross-fade or a hard cut.
- Put the logo and water layer in the shared layout as fixed elements with a shared `view-transition-name`; they appear on both pages without overlays.
- Known risks to test: Safari new-page flash before the animation starts (bug 310627), iOS fixed bars and toolbar flashes (bugs 325199, 320238), Chrome 150 and 151 clip-path regressions, the 4 s skip, and no animation on browser swipe-back gestures.
