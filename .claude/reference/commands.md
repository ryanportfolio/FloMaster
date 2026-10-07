# Commands

> Build / dev / test / deploy commands for this project.

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server on http://localhost:4321 (not for measuring speed) |
| `npm run build` | Prototype build into `dist/` (tags, review bar, `noindex`, `/review`) |
| `npm run build:public` | Public build. Refuses while any fact is open, sample reviews or AI stand-in photos remain, or the ZIP list is unchecked |
| `npx astro preview --port 4321` | Serve `dist/` locally. Astro 7 allows one preview server; `npx astro preview stop` stops it |
| `npm run logo` | Rebuild `src/assets/logo.svg` and `public/favicon.svg` from `scripts/build-logo.mjs` |

Checks (run after `npm run build`; each starts and stops its own preview server and uses headed Chrome offscreen):

| Command | Checks |
|---|---|
| `node scripts/check-flows.mjs` | Booking errors and focus, ZIP check, phone carried to the callback form, no personal data in URLs, tags off by default and moving nothing, sticky bar timing, slider keys |
| `node scripts/check-a11y.mjs` | axe-core (local copy), WCAG 2.x A/AA rules, every page, phone and desktop, tags off and on |
| `node scripts/check-keyboard.mjs` | Focus visible and never under the sticky bar; target sizes; Call buttons at least 44x44 |
| `node scripts/check-overflow.mjs` | No sideways scrolling at 320 and 375 px |
| `node scripts/check-reveal.mjs` | Load reveal (`src/scripts/reveal.js`) on 7 pages, phone and desktop: tiers start in order (planned and as first shown on screen), the first screen at rest by the planned end, no layout shift; presented frames from a trace filmstrip at 4x CPU on phone (no gap over 34 ms after 100 ms); no script shows everything at once; reduced motion plays the same reveal; taps on Call during the reveal reach it; Replay in the review bar; the X-ray find still plays; sticky bar timing; the admin page has no reveal. `CHECK_BASE=http://localhost:<port>` runs it against another served build |
| `node scripts/check-perf.mjs` | Lighthouse mobile, 3 runs per page (median LCP, CLS, TBT, weight); INP stand-in from real taps with 4x CPU slowdown |
| `MSYS_NO_PATHCONV=1 node scripts/shoot.mjs --out D:/screenshots/FloMaster/<run> [--tags on] / /pricing` | Phone and desktop screenshots |
| `node scripts/grid.mjs <out.jpg> <tileWidth> <cols> <files...>` | Contact sheet of screenshots |

Image stand-ins are generated with the `codex-image-gen` skill; raw output stays in `.tmp/img/`, processed JPGs go in `src/assets/photos/`.
