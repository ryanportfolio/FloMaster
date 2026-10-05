# Notice

This skill is original writing for this repository. Its project rules come from `CLAUDE.md`, `docs/design-brief.md` and `docs/research.md`. The ideas below were taken from public agent skills, reviewed on 2026-10-05, and rewritten in our own words. No text, scripts or datasets were copied.

| Source | File and commit read | License | Ideas used |
|---|---|---|---|
| [anthropics/skills, frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | `SKILL.md` at 41bbe19 | Apache-2.0 | List of generated-template tells; button verbs kept through a flow; errors that say how to fix; flat CSS specificity |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) | `command.md` at e3d624b | MIT | Input types and autocomplete, no paste blocking, sticky bars not covering focus, safe-area padding, source anti-pattern sweep reported as `path:line` |
| [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills) | `core-web-vitals`, `accessibility`, `web-quality-audit` at c6b06ad | MIT | Measure before fixing; lab versus field data; LCP image handling; reserving space for late content; audit report that separates evidence from guesses |
| [84emllc/claude-wcag-skill](https://github.com/84emllc/claude-wcag-skill/blob/main/SKILL.md) | `SKILL.md` at 877e859 | MIT | Four-pass accessibility audit; no AA claim without scan and keyboard results; WCAG 2.2 criteria first; axe "incomplete" items as manual checks; criterion, element, fix format |
| [rampstackco/claude-skills, form-strategy](https://github.com/rampstackco/claude-skills/blob/main/skills/form-strategy/SKILL.md) | `SKILL.md` at e5bc675, `references/form-anatomy-checklist.md` at f066ffe | MIT | Label and hint placement, loose phone validation, keeping entered data, honeypot spam defence, pre-launch form test list |
| [ConardLi/garden-skills, web-design-engineer](https://github.com/ConardLi/garden-skills/blob/main/skills/web-design-engineer/SKILL.md) | `SKILL.md` and `references/browser-acceptance.md` at ea45dc5 | MIT | Placeholders instead of invented data; report-only audits; "visual acceptance" versus regression wording |
| [JordiParraCrespo/astro-skills, astro-perf](https://github.com/JordiParraCrespo/astro-skills/blob/claude/focused-albattani-70gdwk/skills/astro-perf/SKILL.md) | `SKILL.md` at acf5560 | MIT | Measure the built site, not the dev server; justify each `client:*`; inline styles on small static sites. Young, unreviewed repository: treated as hints to check against the Astro docs |

Rejected sources and the reasons are recorded in the session that created this skill; the main ones were framework mismatches (React, Next, Tailwind), mandatory motion or creative ceremony, bundled scripts or settings changes, outdated WCAG 2.1 targets, and missing licenses.
