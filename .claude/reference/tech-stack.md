# Tech stack

> Non-default library choices and WHY they were made, so future sessions don't "fix" deliberate picks.

- **Astro, static output, plain CSS, small vanilla JS scripts.** Chosen 2026-10-05 (design brief section 11 and section 12, decision 10). Pages ship as finished HTML so the mobile Core Web Vitals targets hold by default; shared header, licence line and footer are components; one placeholder data file drives the "confirm this" tags and `/review`. No UI framework (React, Preact, Svelte), no CSS framework.
- **Images:** prototype photos are AI-generated stand-ins (brief section 12, decision 2), each tracked in the placeholder data file and replaced by real photos before launch.
- **Booking backend:** not chosen. Wait for the host decision (`deployment.md`).
