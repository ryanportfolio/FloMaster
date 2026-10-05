# Pitfalls

> Accumulated project-specific gotchas. Dated entries, newest at the bottom. If this file exceeds ~200 lines, split by area (`pitfalls-<area>.md`) and update the CLAUDE.md index.

- **2026-10-05 · Git Bash turns a `/` page argument into a Windows path.** `node scripts/shoot.mjs /` navigated to `http://localhost:4321C:/Program Files/Git/`. Prefix page-path commands with `MSYS_NO_PATHCONV=1`.
- **2026-10-05 · Astro 7 runs one preview server at a time.** A second `astro preview` exits with "Another astro preview server is already running", and a kill queued in a Node `exit` handler never runs, so the first server lingered. Use `scripts/lib/preview.mjs` (reuses a running server, stops its own with a synchronous `taskkill`), or `npx astro preview stop`.
- **2026-10-05 · opentype.js 2.0 writes NaN into Cinzel's "M".** One horizontal segment has an undefined x, so `getPath().toPathData()` emits `LNaN`, and whole-string layout adds a ligature bug on top. `scripts/build-logo.mjs` lays out letter by letter and serializes path commands itself, carrying the previous point forward.
