# Page transition inspiration: water and the logo

Research for a short branded page transition on the FloMasters site: when a visitor moves between pages, a brief water effect plays with the pipe-ring logo. It has to feel calm and premium, never slow anyone down, and respect reduced motion.

Compiled 2026-10-05. Pages were read with curl where possible ("read"). Codrops pages block scripted fetches (Cloudflare challenge), and some pages are paywalled or video-only; for those, facts come from search-engine extracts and are marked "search extract". Anything not confirmed either way is marked "not confirmed".

Compared against `~/.claude/skills/motion-design/references/principles.md` (and its `accessibility.md` and `web-engine.md`). What is new is listed at the end as proposals; those files were not edited.

## Who teaches what

### Navigation timing, frequency and restraint

**Page Laubheimer, Nielsen Norman Group: "Executing UX Animations: Duration and Motion Characteristics"** ([NN/g](https://www.nngroup.com/articles/animation-duration/), read)
- Most animations should last 100 to 500 ms, depending on complexity and distance. "At 500ms, animations start to feel like a real drag for users." In most cases 100 to 400 ms, "with 400ms being a very slow animation, to be used only for big movements across large screens."
- "It is far more common for animations to be too long than too short." Look for the shortest time that isn't jarring.
- Entrances run a little longer than exits: a popup "may take 300ms to appear, but only 200 or 250ms to disappear."
- "The more frequent the animation, the more subtle and shorter you'll want it to be."

**Aurora Harley, NN/g: "Animation for Attention and Comprehension"** ([NN/g](https://www.nngroup.com/articles/animation-usability/), 2014, updated 2018, read)
- On a navigation animation that plays every time: "While the animation may be cute and visually appealing the first time, the second viewing is tiresome, and the third is downright annoying (and may never occur should the user become frustrated and abandon the site entirely)."
- Her example, the Newton Running site, zooms the page out into a square and back on every menu choice, and "there is no way to skip the animation once it has been triggered."

**Val Head, author of *Designing Interface Animation*** ([How fast should your UI animations be?](https://valhead.com/2016/05/05/how-fast-should-your-ui-animations-be/), read)
- "200ms to 500ms seconds is a good range to start with." Small changes sit at 200 to 300 ms; large moves or bouncy easing at 400 to 500 ms.
- "One entire second feels like ages for UI animation though, so that's why the suggested upper limit for durations is half that at 500ms." People need about 230 ms to perceive something (Model Human Processor), so much shorter risks going unseen.
- Already in `accessibility.md`: she rates a full-screen wipe as likely to trigger motion sickness, and opacity, colour and blur changes as unlikely.

**Jakob Nielsen** ([Response times](https://www.nngroup.com/articles/response-times-3-important-limits/)): 1.0 s is the limit for the user's flow of thought to stay uninterrupted. `principles.md` cites this page for the 0.1 s limit only.

**Emil Kowalski** ([You don't need animations](https://emilkowal.ski/ui/you-dont-need-animations), read; [skills repo](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md), search extract)
- "I use Raycast hundreds of times a day. If it animated every time I opened it, it would be *very* annoying. But there's no animation at all. That's the optimal experience."
- Delight works on rare interactions: "It'll then become a pleasant surprise, rather than a daily annoyance."
- His skill file sorts by frequency: 100+ times a day, no animation; tens of times a day, remove or drastically reduce; occasional (modals, drawers), standard animation; rare or first-time, room for delight.

**Rauno Freiberg** ([Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design), read; [Novelty](https://rauno.me/craft/novelty), February 2026, read)
- Interruptibility: turning a book page can be interrupted, "But imagine if it were an animation that you had to wait for!" His counter-example is iOS Settings: after a mistap, "swiping back immediately does not interrupt the animation"; "you have to wait for it to end."
- Novelty wears out with repetition, like semantic satiation of a repeated word: "Novelty is the equivalent of an exclamation mark. Akin to seasoning, you don't want too much of it."

**Apple Human Interface Guidelines: Launching** ([HIG](https://developer.apple.com/design/human-interface-guidelines/launching), read from the page's JSON)
- "A launch screen's sole function is to enhance the perception of your experience as quick to launch and immediately ready to use."
- "The launch screen isn't a branding opportunity... don't include logos or other branding elements unless they're a fixed part of your app's first screen." If a splash screen is needed, show it at the start of onboarding, once.
- Applied here: the FloMasters logo is a fixed part of every page header, so animating it in place fits this rule; a separate full-screen logo card would not.

**First visit in full, later visits short** ([1820 Productions case study, Codrops, 2026-02-13](https://tympanus.net/codrops/2026/02/13/1820-productions-minimal-design-maximal-motion/), search extract)
- "First-time visitors get the full branded intro; returning visitors get something snappier." A small controller checks `sessionStorage` on load and picks the full or the quick version.
- Choosing the store: `sessionStorage` replays in every new tab; `localStorage` plays once per browser. Several 2026 sites moved to `localStorage` after complaints that every new tab replayed the intro (GitHub pull requests found by search; anecdotal).

### Page transitions on the web: continuity and choreography

**Pasquale D'Silva: "Transitional Interfaces"** ([Medium, 2013](https://medium.com/@pasql/transitional-interfaces-926eb80d64e3), search extract): animation uses time, "an invisible fabric which stitches space together." The often-quoted "Good animation is invisible" may come from his talk rather than the essay (not confirmed).

**Sarah Drasner: "Native-Like Animations for Page Transitions on the Web"** ([CSS-Tricks, 2018](https://css-tricks.com/native-like-animations-for-page-transitions-on-the-web/), search extract): a new page forces the visitor to rebuild their mental map of the screen; elements that exist on both pages should move to their new place instead of disappearing and reappearing.

**Material Design fade through** ([MDC source, FadeThroughProvider](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/FadeThroughProvider.java) and [MaterialFadeThrough](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/transition/MaterialFadeThrough.java), read): for pages with no strong relation, the old content fades out first, then the new fades in while scaling from 0.92 to 1. The fade hand-off sits at 0.35 of the progress. Default duration is the theme's `motionDurationLong1`, 450 ms in the M3 token file. The often-quoted 90 ms out plus 210 ms in (300 ms total) is the older Material 2 timing (search extract, not confirmed in an official spec page).

**Bramus Van Damme and the Chrome team: cross-document view transitions** ([guide](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document), [misconceptions](https://developer.chrome.com/blog/view-transitions-misconceptions), read)
- Both pages opt in with `@view-transition { navigation: auto; }`. `pageswap` and `pagereveal` events allow last-moment changes and per-navigation choices.
- The old page stays on screen while the new one loads; snapshotting costs "two stale frames at most" in Chrome.
- If a navigation takes more than four seconds in Chrome, the view transition is skipped with a `TimeoutError`.
- Avoid `blocking="render"` "unless you can actively measure and gauge the impact".
- Reduced motion: wrap the opt-in or the animations in a `prefers-reduced-motion: no-preference` media query.
- Clicks during a transition: the `::view-transition` overlay sits over the page and catches clicks. Bramus's fix is `::view-transition { pointer-events: none; }` with `:root { view-transition-name: none; }` ([bram.us, 2025-01-29](https://www.bram.us/2025/01/29/view-transitions-page-interactivity/), search extract).
- Support as of October 2026 (search extract): Chrome and Edge 126+, Safari 18.2+; stable Firefox has same-document transitions (since 144) but not cross-document ones. Astro's client router gives Firefox transitions too. `web-engine.md` already says "no Firefox; ship a fallback".

**Arjen Karel, CoreWebVitals.io: "The Impact of CSS View Transitions on Web Performance"** ([article](https://www.corewebvitals.io/pagespeed/view-transition-web-performance), updated 2026-02-27, read)
- A 7-day A/B test, 120,000 mobile same-site navigations analysed: cross-document view transitions added about 70 ms to Largest Contentful Paint on repeat mobile pageviews; on fast desktop CPUs, about 5 ms. Slower CPUs pay more.
- Remedies: restrict transitions to desktop with a `min-width` media query (his own site uses `@media (min-width: 768px)`), or prerender the next page with the Speculation Rules API, after which "the transition adds no measurable" delay.

**Patterns.dev: "Animating View Transitions"** ([article](https://www.patterns.dev/vanilla/view-transitions/), search extract; author not confirmed): for script-driven transitions, don't freeze the page while the next one loads. Start the exit animation on click while the request runs, wait for both, then animate the new page in, "similar to how standard iOS navigations slide across immediately whilst loading the next screen."

**Studiogusto case study** ([Codrops, 2023-04-25](https://tympanus.net/codrops/2023/04/25/case-study-studiogusto/), search extract): a canvas sits over the page. On click, a circle in the next page's colour expands to cover the screen; once the next page has loaded, a hole opens from the pointer position and expands to reveal it. Covering first and revealing after load hides the wait inside the motion.

**Dennis Snellenberg and Ilja van Eck (Osmo)**: Snellenberg's portfolio curve transition, a panel with a curved leading edge that sweeps over the page, is one of the most copied transitions on the web ([Olivier Larose's rebuild](https://blog.olivierlarose.com/articles/nextjs-page-transition-guide)). Their [Page Transition Course](https://www.osmo.supply/product/page-transition-course) teaches column wipes, page-name transitions and clip-path reveals with Barba.js and GSAP. Their timing advice is inside the paid lessons (not confirmed).

### Liquid on the web: how it is built

**Yoichi Kobayashi: "Dynamic Shape Overlays with SVG"** ([Codrops, 2017](https://tympanus.net/codrops/2017/10/17/dynamic-shape-overlays-with-svg/); [source](https://github.com/ykob/shape-overlays/blob/master/js/demo1.js), read)
- The wavy edge is not drawn as a wave. Each of 18 control points along the edge runs the same 600 ms cubic in-out tween, but starts after its own delay, up to 300 ms. The delays come from the sum of two sines, `(sin(-r) + sin(-r * range) + 2) / 4 * 300`, with `range` random between 6 and 10, so the edge ripples as it travels and differs every time.
- Several paths stacked 100 ms apart give layered colours. Total time is 600 + 300 + 100 x (paths - 1) ms, about a second for three layers.

**Maksym Ponomarenko: bleibtgleich'26** ([Codrops, 2026-09-23](https://tympanus.net/codrops/2026/09/23/bleibtgleich26-a-180-turn-from-brutalism-to-minimalism/), search extract)
- Wavy SVG clip-path reveals: 12 points with random vertical offsets, rebuilt every frame as `baseY + offset * sin(progress * PI)`. The sine envelope makes the edge flat at the start and end and wavy only mid-move.
- Two identical masks, one on the frame and one on the image, with the image 0.1 s behind. The band between the two wavy edges "is what makes it feel like the image develops rather than just slides up from below."

**Lucas Bebber: the gooey effect** ([CSS-Tricks, 2015](https://css-tricks.com/gooey-effect/), search extract): blur shapes together, then raise the alpha contrast with a colour matrix so the soft edges snap back to a sharp outline, and composite with `atop`. This is how blobs merge like liquid with plain SVG filters. Safari support for some variants is limited (not confirmed).

**Andrea Biason with Adoratorio Studio: "How to Animate WebGL Shaders with GSAP"** ([Codrops, 2025-10-08](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/), search extract): ripples and reveals that start at the click point, found with a raycaster in texture coordinates; GSAP drives shader uniforms and its ticker drives rendering.

**Evan Wallace: WebGL Water** ([demo](https://madebyevan.com/webgl-water/), 2010 to 2011, search extract): a heightfield pool with reflection, refraction and caustics. His own note: "the focus was on the rendering aspect, not on the simulation." Water reads as water through light (bent and focused) more than through accurate physics.

**Pavel Dobryakov: WebGL Fluid Simulation** ([demo](https://paveldogreat.github.io/WebGL-Fluid-Simulation/), 2017, search extract): a full GPU Navier-Stokes solver. Impressive and widely copied; far more than a half-second transition needs.

**Maxime Heckel** ([refraction and dispersion](https://blog.maximeheckel.com/posts/refraction-dispersion-and-other-shader-light-effects/); [caustics](https://blog.maximeheckel.com/posts/caustics-in-webgl/), search extract): step-by-step shader refraction (water's index is 1.333; GLSL has `refract`) and caustics drawn from refracted rays onto a plane.

**Apple: "Meet Liquid Glass"** ([WWDC25 session 219](https://developer.apple.com/videos/play/wwdc2025/219/), transcript read)
- Liquid Glass defines itself through lensing: the bending and concentrating of light.
- "Instead of fading, Liquid Glass objects materialize in and out by gradually modulating the light bending and lensing."
- Motion has "an inherent gel-like flexibility" that "moves in tandem with your interaction".
- Under Reduce Motion it "decreases the intensity of some effects and disables any elastic properties for the material."

### Water as animators draw it

**Joseph Gilland: *Elemental Magic*, volumes I and II** (2009, 2011; former Disney effects supervisor on *Lilo & Stitch* and *Brother Bear*; [Internet Archive](https://archive.org/details/elementalmagicar0000gill)). The books were not read; this comes from catalogue pages and reviews. Liquids are taught through density, gravity, viscosity, point of impact and secondary splash. Reviewers sum up his approach as "animating energy", and he teaches simplifying detail while keeping the motion believable.

**Erik Roystan Ross: Toon Water Shader** ([tutorial](https://roystan.net/articles/toon-water/), search extract): three elements are enough to read as water: colour that deepens with depth (a shallow-to-deep gradient), a foam line where objects meet the surface, and scrolling, distorted noise for waves.

**Minions Art: fake liquid shader** ([Patreon](https://www.patreon.com/minionsart/posts/unity-liquid-18245226), search extract): no simulation. The container's velocity is added to a value that decays over time; multiplied by a sine, it tilts the surface back and forth and dies out. A second sine ripples the surface while it moves. A related write-up models the same idea as a small damped pendulum, with the slosh turning around the axis perpendicular to the movement ([Entertainment Engineers](https://entertainmentengineers.net/?p=51653), search extract).

**Ben Marriott** ([Animating a Liquid Reveal](https://www.youtube.com/watch?v=geBX861h8K4)) and other After Effects teachers: two liquid layers, the darker one offset in phase (Motion Array: Wave Warp phase 100 degrees) give depth with no extra detail (search extract; videos not watched).

**Reference to study:** Cartoon Brew names the water in Disney's *Pinocchio* (1940), by Art Palmer, Josh Meador, Don Tobin and Sandy Strother, as possibly the best water animation ever drawn ([Cartoon Brew](https://www.cartoonbrew.com/cartoon-study/fire-and-water-in-animation-pixar-elemental-229791.html), search extract).

No source was found that teaches a meniscus (the curve where water meets a wall) for 2D motion design. Roystan's foam line is the nearest taught equivalent.

### Logo and small marks

**Max Kravchenko, Motion Design School** ([The main principles of logo animation](https://motiondesign.school/blog/animation-principles-in-logo-animation/), search extract): one major action at a time; show the logo in its original form before or after the animation so it stays recognisable; offset the parts instead of moving everything at once.

**Apple: SF Symbols animation** ([What's new in SF Symbols 6, WWDC24](https://developer.apple.com/videos/play/wwdc2024/10188/); [SF Symbols 7, WWDC25](https://developer.apple.com/videos/play/wwdc2025/337/), search extract)
- "Using too many or in the wrong context can make it feel overwhelming and distracting."
- Draw On and Draw Off trace a symbol like handwriting. The default, By Layer, offsets each layer's start; Whole Symbol is "a single, swift movement". Guide points set where a custom path starts and ends.

**Ethode: liquid SVG logo reveal** ([article](https://www.ethode.com/blog/dive-into-a-liquid-svg-logo-reveal-animation), search extract): stack an outline or grey copy of the logo under a full-colour copy, mask both with a wave and raise the wave to "fill" the mark. A CSS animation on a `<mask>` element itself does nothing; animate a `<g>` inside it.

**Cassie Evans, GSAP** ([Making a lil' me](https://www.cassie.codes/posts/making-a-lil-me-part-1/); [GSAP accessibility guide](https://gsap.com/resources/a11y/), search extract): check `prefers-reduced-motion` at the start of every animation function and return early; `gsap.matchMedia()` reverts everything when the preference changes; under reduced motion, jump a timeline to its end state (`progress(1)`) instead of hiding the mark.

## What this transition should apply

1. **Play it in full once, then keep it short and out of the way.** The frequency rule (NN/g, Kowalski, Freiberg) and NN/g's "second viewing is tiresome" say a site navigation must not replay a showpiece. Proposal, derived from the sources rather than quoted from them:
   - First navigation in a tab: the full water pass, about 500 to 600 ms of motion.
   - Later navigations: a 250 to 300 ms version with the same wave edge and no logo moment.
   - Back and forward navigations: plain or nothing.
   - Store the "seen" flag in `sessionStorage`.
   - Nothing over NN/g's 400 ms "very slow" mark except the first play, and never near Nielsen's 1 s.
   - Clicks pass through while it runs (`pointer-events: none` on `::view-transition`).
   - Reduced motion: no wipe at all, since a full-screen wipe is a likely vestibular trigger; an instant swap or a short opacity cross-fade instead, with the logo shown in its finished state.

2. **Make the water read with three or four cues, and let timing shape the edge.**
   - Front edge: a wavy edge whose ripple comes from staggered point timing (Kobayashi), with its amplitude multiplied by `sin(progress * PI)` so it is flat at rest and alive only mid-move (bleibtgleich).
   - Depth: a second, trailing layer in slate or sky blue about 0.1 s behind, for the band of depth (bleibtgleich, the two-layer liquid trick, Roystan's depth gradient), plus one thin light line on the surface for the foam line.
   - Slosh: only one damped swing as it settles (Minions Art).
   - Skip fluid simulation and WebGL refraction: they cost load time and battery on phones for an effect that lasts half a second.

3. **Lead with the logo, keep it in place, and never add waiting time.**
   - The header's pipe ring is the one element on every page. Give it a `view-transition-name` so it stays put across the swap (Drasner's continuity, Apple's "fixed part of the first screen").
   - The ring's water level leads: it dips as the wave passes and settles last as follow-through.
   - Cross-document view transitions run only after the next page is ready, and they cost about 70 ms of LCP on mobile (Karel). Pair them with Speculation Rules prerendering, or limit the full version to wide screens, and measure LCP before and after.
   - Firefox gets a normal navigation, which is acceptable as progressive enhancement.
   - The overhaul plan's rule still holds: nothing on the first screen may hold back the phone headline.

## New compared with principles.md (proposals only)

`principles.md` already has: exits shorter than entrances (Material), Apple's "avoid motion on frequent interactions" and "optional and cancelable", Carbon's expressive motion for occasional moments, the M3 duration tokens, the 0.1 s instant limit, transform-over-cut continuity (Willenskomer), and basement.studio's liquid Vercel Ship film. `accessibility.md` covers full-screen wipes as vestibular triggers. `web-engine.md` notes no Firefox for cross-page transitions. The following is not there:

1. **Frequency tiers and repeat plays.** Add NN/g's "the more frequent the animation, the more subtle and shorter", NN/g's "second viewing is tiresome", Kowalski's frequency tiers, Freiberg's novelty-as-seasoning (2026), and the full-first-then-short pattern with the `sessionStorage` vs `localStorage` choice.
2. **A ceiling for UI durations.** NN/g: 500 ms "a real drag", 400 ms for big moves only, "far more common for animations to be too long than too short". Val Head: "One entire second feels like ages". Nielsen's 1.0 s flow limit.
3. **Interruptibility as a rule, with the web specifics.** Freiberg's "imagine if it were an animation that you had to wait for", plus the `::view-transition` click-blocking fix.
4. **Navigation transitions must not add waiting time.** Chrome's 4 s skip, Karel's 70 ms mobile LCP cost and the prerender remedy, the cover-then-reveal and exit-on-click patterns (Studiogusto, Patterns.dev). This may belong in `web-engine.md` rather than `principles.md`.
5. **A liquid section.**
   - Stagger point timing to get a wavy edge (Kobayashi).
   - Envelope the wave with `sin(PI * progress)` (bleibtgleich).
   - Use two offset layers for depth.
   - Three cues are enough: depth colour, foam line, moving surface (Roystan).
   - Slosh is a damped value driven by the container's motion (Minions Art).
   - Water reads through light more than physics (Wallace).
   - "Materialize" through lensing instead of fading (Apple Liquid Glass).
6. **Logo craft for small marks.** One major action at a time and show the true mark before or after (Kravchenko); offset layers for a draw-on (SF Symbols 7); end state under reduced motion (Evans). `principles.md` has logo rules for trailers only (Lieu, Zukowski).
7. **Branding on load.** Apple's HIG: a launch screen "isn't a branding opportunity"; logos only when they are a fixed part of the first screen.

## Not confirmed

- **Paywalled or unreachable:** Osmo's timing advice (paid course); Minions Art's full write-ups (Patreon); the wording of Codrops case studies (blocked to scripted fetches; read through search extracts).
- **Books and videos:** Gilland's teaching was read only through reviews and catalogue entries, not the books. Ben Marriott's liquid tutorials were not watched.
- **Speculation Rules and Astro:** whether Safari supports Speculation Rules prerendering in October 2026, and whether the site's Astro version prerenders through them, was not checked.
- **CSS mask performance:** whether animating `mask-position` or `clip-path: path()` on `::view-transition-new(root)` stays off the main thread in each browser was not checked. Test it before choosing between CSS masks and a canvas overlay.
- **Award-winning sites:** no 2025 or 2026 Awwwards Site of the Day was found that is specifically a water page transition with a build write-up. The closest are YARD's "Water Effect Transition" (an Awwwards inspiration element, older, built with three.js) and the Codrops case studies above.
- **The proposed durations** in "What this transition should apply" are our synthesis of the sources, not numbers any source gives for a branded liquid transition.
