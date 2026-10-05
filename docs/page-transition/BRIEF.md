# Page transition brief

## The ask

The owner, 2026-10-05: "when you go from 1 page to another there's some type of water effect with the logo." Premium and effortless, never in the visitor's way, mobile Core Web Vitals stay good, a designed reduced-motion version.

## Feeling and job

The new page arrives already settled, like sand after a wave goes out, and the pipe ring in the header holds the water for a moment, so the brand feels like one calm, competent hand moving the visitor along.

## Direction: the tide, with the drop

Based on `pitch-tide.md`, with two changes taken from the other pitches.

- **The drop starts it** (from `pitch-ring.md`): the logo's own drop falls from the tap into the ring as the transition begins. The logo is visibly the source of the water.
- **The tide**: a band of the business card's water (navy-900 with the card's wave tile, about 14% of the screen tall) slides down from under the header and off the bottom, uncovering the new page from the top. The lower edge is the card's wave line with a sky-300 foam line; the upper edge is the same wave half a period out of step with a slate wet line. The surface drifts sideways one wave period while it travels. Nothing on either page moves, scales or fades.
- **The ring fills**: inside the header's pipe ring, water rises to about half the ring (changed from a third in the pitch, so it reads at 25 to 28 px), tips once as the band leaves, and drains.
- **The header and the phone's bottom bar stay above the water** the whole time, so Call is never covered.
- **Repeats are short**: after the first navigation in a tab, later pages arrive with a 400 ms dissolve plus a small swell in the ring and the drop. Back and forward get the dissolve only.
- **Reduced motion**: a 200 ms dissolve with the header held still; no band, no drop, no slosh.
- Colors only from `facts.md`; no orange, no text, no white flash.

## Beat sheet

Time 0 is when the new page is ready and the view transition starts. Before that, the old page stays live while the new one loads.

### Owner review of the animatic, 2026-10-05

"good but lets have it run at half speed, still smooth and crisp, but its difficult to tell what's happening with its current speed". Every animated pass below is twice the length of the first animatic. The reduced-motion dissolve stays short. Three fixes from the animatic review also apply: the band's tail must leave the screen cleanly instead of creeping along the bottom on desktop (reshape the easing so the band is fully gone by about 85% of its time); on phones, a bottom bar that was hidden on the old page arrives with the water (uncovered with the new page) instead of popping in at time 0; the ring water stays subtle.

### Full pass, first navigation in a tab: 1040 ms, ring settles by 1280 ms

| Time (ms) | What moves | Easing |
|---|---|---|
| 0 to 280 | The logo's drop stretches and falls from the tap into the ring | ease-in |
| 0 to 1040 | Band travels from above the screen to below it, fully off screen by about 880; the new page is uncovered behind its center line | ease-out, reshaped so the tail does not creep |
| 0 to 1040 | Foam and wet lines drift one wave period sideways | linear |
| about 200 | Top 240 px of the new page visible below the header | |
| about 680 | Whole screen visible; band leaving under the bottom bar | |
| 120 to 600 | Ring water rises to about half the ring | ease-out cubic |
| 400 to 920 | One damped slosh inside the ring: -4°, +1.5°, 0° | ease-in-out |
| 840 to 1120 | The drop re-forms at the tap | ease-out |
| 920 to 1280 | Ring water drains | ease-in cubic |
| 1040 | Transition over; the page takes taps again | |

### Short pass, every later navigation: 400 ms, ring settles by 640 ms

| Time (ms) | What moves | Easing |
|---|---|---|
| 0 to 400 | Page dissolve, header and bar still | ease-in-out |
| 0 to 240 | Drop dips into the ring and re-forms | ease-in-out |
| 0 to 360 | Ring swell, a thin sliver along the bottom of the ring | ease-out cubic |
| 360 to 640 | Swell drains | ease-in cubic |

### Reduced motion: 200 ms dissolve, header held still, no band, drop or slosh

## Build method (from the pitch, to confirm in the build)

Cross-document view transitions (`@view-transition { navigation: auto; }` inside `prefers-reduced-motion: no-preference`, plus a reduced-motion dissolve). Page reveal by `clip-path` on `::view-transition-new(root)`; the band as an element shown only during the transition and moved with `transform`; header and bottom bar given their own `view-transition-name` so they stay above the water; ring water and drop as an SVG group added to the logo by `scripts/build-logo.mjs`; a small inline head script picks full or short with a once-per-tab `sessionStorage` flag; Speculation Rules prerender most links (not `/book*`, `/emergency` or the home page). Firefox navigates normally.

## Checks

Pass a natural-speed playback review, stills at key beats, a 4x CPU-throttled trace with no long frames, home LCP at most 2.5 s, CLS at most 0.1, and all existing site checks. Safari's open bug 310627 (new page flashes first) needs a real iPhone or Mac check before launch; until then Safari may get the short pass.
