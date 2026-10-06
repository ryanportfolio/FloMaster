# Visual overhaul plan

Status, 2026-10-05: Round 1 is built and waiting for the user's review. Rounds 2 to 4 are not started.

## Goal

Turn the first build, which reads as flat, into a premium site that feels effortless to use and builds trust through its quality. Antonio's feedback will mostly be the real numbers and facts, not design direction, so the base design has to be finished and compelling on its own.

## Sources

- The user's feedback (2026-10-05): on a plumber's site, delight comes from feeling looked after. Be specific, honest and quick. One creative moment tied to the trade, restraint everywhere else. Interactions must be effortless and premium: people expect to click or drag anywhere on an image, not hunt for a thin bar.
- Design review workflow: five reviewers, a synthesis and a critic (`.tmp/review-synthesis.md`, `.tmp/review-critique.md`).
- A fresh `/why` review of the build order.
- Astra full review (`.tmp/astra-fullreview-PPrHbsvD/report.md`).
- Brief section 12, decisions 11 to 14: visuals first; line art, generated images and 2D/3D allowed within the speed budget; orange marks emergencies only.

## Rules for every round

- Mobile Core Web Vitals stay good on the production build: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less. Home page weight stays under 400 KB.
- WCAG 2.2 AA. Every moving piece has a designed reduced-motion state. Nothing in the first screen fades or slides in, because the phone LCP element is the headline.
- Motion only where it shows something real: proof, price, progress or a step to follow. No sheen, scroll drift, count-up numbers, stamp effects, autoplay loops or scroll locking.
- Effortless means direct manipulation: press or drag anywhere on the thing you want to move, large targets, immediate response, no hidden controls.
- Facts keep coming from `src/data/facts.ts`, with tags. No invented data in display type (no rating histograms, no live-looking timestamps).
- Use `/codex-image-gen` for photo stand-ins and the `build-flomaster-ui` skill for build and audit rules. Screenshots go to `D:\screenshots\FloMaster\`.

## Design direction for Rounds 2 to 4 (user, 2026-10-05)

The contracts in `CLAUDE.md` and the design brief set the minimum standard, not the target. Restraint means no noise: no sheen, no autoplay, no fake data. It does not mean no character. Every section needs one choice that could only belong to FloMasters in Hampton Roads; a section that would fit any plumber's site is not done.

Take structure, not decoration, from Antonio's world, one per section, using what the thing does rather than how it looks:

- The carbon-copy work order: pricing reads as a written quote, with filled-in fields, line items and a copy for each side.
- Stamped brass valve tags: licence and phone numbers, stamped and fixed to the thing they identify.
- Shipyard and Navy hull stencils: Hampton Roads is shipbuilding country, so big numbers are set like hull numbers, large and readable from a distance.
- The Tidewater chart: the service area, divided the way the water divides it.

Process for every section:

1. Write one line describing the obvious plumber site for that section (navy hero, smiling plumber, three service cards, shield badges, star row, wrench and droplet icons), and don't build it.
2. Build three directions and show the user screenshots. The user picks; reviewers never pick.
3. Reviewers score each direction on "could only be this business" alongside "premium".

## The signature moment: the repair story

The before/after becomes the site's main creative moment and moves up the home page, next to the pricing proof.

- **Grab anywhere.** Pressing anywhere on the image moves the split there; dragging follows the finger or pointer exactly. The handle is a large pipe-ring grab target in the logo's two blues. The native range input stays underneath for keyboard and screen readers. Horizontal drags move the split; vertical swipes still scroll the page (start moving after about 6 px of horizontal travel, `touch-action: pan-y`).
- **A story in stages.** The slider scrubs through the job instead of two photos: the problem (a water-stained wall or cabinet), the diagnosis (an X-ray view of the pipes inside the wall, showing the leak), the repair, and the tested result. Frames are generated from one reference image so the angle and light match, in landscape at 1600 px or wider.
- **A job ticket beside the image**, not on it: what failed, what changed, how it was tested, the written price. Every field tagged as a sample.
- **Feel.** On first view, one short peek (the split moves a little each way and settles) shows that it can be dragged; skipped under reduced motion. Labels fade as the divider passes them.

## Round 1: home page structure, emergency, signature moment

1. Section system: three surface tones (paper, raised panel, navy band), two spacing sizes, two or three shadow levels taken from the business card's shadow, varied layouts so no two neighbouring sections look the same, and fewer bordered cards. The wave pattern is the business card's own texture and stays as a brand element on navy surfaces; text over it keeps AA contrast.
2. Hero: move the business card so it doesn't cover Antonio. Keep the call and book fork exactly as it is.
3. Emergency panel with visual weight: one compact first instruction, then line-art valve states (a wheel valve turned right until it stops; a lever valve across the pipe means off), with a quarter-turn that plays when tapped. Antonio confirms the valve types before launch.
4. Proof bar in place of the small trust strip: the licence number first, linked to the DPOR lookup, then insurance, warranty and reviews, each with its own icon and tag.
5. The repair story, as described above.

Stop after Round 1 for the user to review.

## Round 2: booking and appointment

1. Problem buttons in the customer's words ("Water won't go down", "No hot water", "Something's leaking", "Toilet keeps running", "Sewage smell or backup").
2. The price range appears right under the button you tap, with the call-out fee, before any other field.
3. A shorter arrival-window picker: a strip of days, then the windows for the chosen day.
4. A pipe that fills as each booking step is completed, using the logo ring as step markers.
5. Appointment page: the step controls sit next to the phone preview on phone too, and the texts play when tapped, never on load.

Stop after Round 2 for the user to review.

## Round 3: inner pages

1. Page headers with a wave-shaped bottom edge, the first content panel overlapping the band, and a page-specific object in the empty right half (pricing: the example quote; about: the card and portrait; a service page: its "from" price).
2. Pricing: a written example quote, labelled "Example quote", with line items from the price data and "If it isn't on this list, I don't charge it" as its footer.
3. "How a job runs" in four steps: I look and find the cause; you get a written price; you say yes, or no and owe only the call-out; I fix it, test it, clean up and show you the old part. "Nothing starts until you say yes" is confirmed with Antonio.
4. Service area as city tiles (not a map yet, because the ZIP lists are unchecked); FAQ as accordions with the key number for each group in large type; about page with a two-sided business card that flips with its own button.

## Round 4: motion system and small delights

1. Replace the blanket reduced-motion rule with motion tokens (durations, easings) and one `prefersReducedMotion()` helper that every script reads.
2. Small feedback: buttons press, service cards lift, the menu fades, the ZIP result appears with a tick or cross and the logo ring fills with water when the ZIP is covered (secondary, beside the written answer, with a static equivalent).
3. Optional, if the X-ray frames work well in Round 1: a tap-the-problem house illustration that builds a checklist to send with a booking.

## Dropped for now

Consequence numbers, a service-area map, a star histogram, scroll-linked effects, a page-wide water-drop animation, playing texts on the confirmation page.

## Acceptance checks for every round

- `npm run build` succeeds; `scripts/check-flows.mjs`, `check-a11y.mjs`, `check-keyboard.mjs`, `check-overflow.mjs` and `check-perf.mjs` pass.
- New checks for the repair story: pressing anywhere on the image moves the split; dragging follows the pointer; arrow keys still work; a vertical swipe on a touch screen scrolls the page; reduced motion shows no peek.
- Screenshots at phone and desktop sizes, reviewed in headed Chrome, plus one fresh reviewer scoring how premium and effortless each changed section feels, before the round is called done.
