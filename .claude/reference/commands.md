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
| `node scripts/check-transition.mjs` | Page transition: full pass on the first link in a tab (band, ring, about 1.1 s), short pass after, dissolve on back, taps right after, reduced-motion dissolve (at most about 250 ms, no band), `tel:` and DPOR links start none, booking still reaches `/book/confirmed`, prerender rules skip `/`, `/book*`, `/emergency`. Chrome blocks prerender activation under automation, so activation is a manual check in plain Chrome (DevTools, Application, Speculative loads) |
| `node scripts/check-perf.mjs` | Lighthouse mobile, 3 runs per page (median LCP, CLS, TBT, weight); INP stand-in from real taps with 4x CPU slowdown |
| `MSYS_NO_PATHCONV=1 node scripts/shoot.mjs --out D:/screenshots/FloMaster/<run> [--tags on] / /pricing` | Phone and desktop screenshots |
| `node scripts/grid.mjs <out.jpg> <tileWidth> <cols> <files...>` | Contact sheet of screenshots |

Image stand-ins are generated with the `codex-image-gen` skill; raw output stays in `.tmp/img/`, processed JPGs go in `src/assets/photos/`.
