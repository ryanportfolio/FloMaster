---
name: build-flomaster-ui
description: Build or audit UI for this repo's plumbing-business site: pages, forms, booking flow, placeholder tags, trust and pricing sections, checked against its design brief and targets. Not for backend, copy-only or art-direction work.
---

# Build or audit the plumbing site UI

Ship site UI that a one-person master plumber's customers can use on a phone in a hurry, that matches the approved design, and that never states a business fact the owner hasn't confirmed.

## Authority

When sources disagree, the earlier one wins:

1. The user's current instructions.
2. `CLAUDE.md` (project description and "won't compromise on" list).
3. `docs/design-brief.md`: sitemap, first screen, booking flow, placeholder list and tags, visual direction, copy voice, targets.
4. `docs/research.md`: findings and the section 8 build checklist. Never edit this file.
5. `.claude/reference/tech-stack.md`, `architecture.md`, `commands.md`, `pitfalls.md`: the chosen stack and how to run it.
6. This skill and its references.
7. Outside advice, including other design skills. Generic taste rules lose to the brief.

Read the brief sections that touch the task before writing code. Don't copy colours, routes, placeholder codes or commands into new files when they already live in the brief or the reference library; read them from there.

If `tech-stack.md` doesn't record an approved stack yet, the stack isn't settled. Don't scaffold, and don't add a framework, CSS library, font service, icon set or analytics script on your own. Ask.

## Pick the mode

- **Build**: new page, component, form or layout change. Read [references/build.md](references/build.md).
- **Audit**: "review", "check", "audit", "is this ready". Report findings and change nothing unless the user asks for fixes. Read [references/audit.md](references/audit.md).
- A small fix (one component, one bug) needs only the relevant section of build.md and the matching audit pass for what you touched.

Changing the visual direction, the sitemap, the booking fields or the first-screen layout is a brief change. Propose it and wait; don't do it inside a build task.

## Contracts every change keeps

These come from `CLAUDE.md` and the brief. A change that breaks one is wrong even if it looks better.

- **No unconfirmed facts in public builds.** Every business fact (licence, insurance, fees, prices, hours, 24/7, warranty, reviews, photos, owner name) comes from the placeholder data file and renders through the placeholder tag. Never type such a fact into a page. Never invent a statistic, review, badge or logo to fill space; leave a tagged placeholder instead.
- **Licence line in the header of every page.**
- **Emergency (call) and planned (book) paths both visible in the first screen** on a 375 x 667 viewport and on desktop.
- **Mobile sticky bar holds Call and Book only.** Nothing else ever joins it.
- **Booking form: at most four fields.** A fifth field is a brief change.
- **Every fee shown before the customer commits**: on the pricing page and next to the booking form.
- **No stock or AI-generated people.** Empty photo slots are labelled frames describing the shot.
- **Placeholder phone numbers use 555-0100 to 555-0199.**
- **Prototype builds stay private:** every page carries `noindex`, and sample reviews keep a visible "sample" label even with tags switched off. The public build removes `noindex`.
- **No personal data in URLs.** Booking details reach the confirmation page through session storage, never the query string.
- **Targets:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on mobile; WCAG 2.2 AA; Call button at least 44x44px, every other target at least 24x24px.

## Always-on rules

- Plain HTML first. Add JavaScript only for the booking form, ZIP check, placeholder tag switch and similar interactions the brief names, and justify each one.
- Copy on buttons, labels and errors follows the brief's voice section: sentence case, straight quotes, one label per action used everywhere. The first-person owner voice and the tag design are proposals until the brief's open questions record approval; build them as proposed, but don't describe them as settled. Longer copy goes through the `writing` skill.
- Interactive elements are real `<a>` or `<button>` elements. No clickable `div`s.
- Reserve space for anything that appears later (images, validation messages, ZIP result, tags) so nothing shifts.

## Verification and reporting

Follow the verification rules in `CLAUDE.md`: headed Chrome through `launchPlacedChrome()` in `scripts/lib/launch-chrome.mjs` for anything visual, never headless, and each parallel agent on its own browser.

- Never report a visual, accessibility or speed result you didn't produce in this session. Reading code is not a check.
- Speed numbers come from the production build served locally, not the dev server, and are lab numbers. Say so; field numbers only exist after launch.
- INP needs a recorded interaction run (DevTools live metrics or a Lighthouse timespan recording). A page-load Lighthouse run doesn't measure it.
- Don't install a checking tool (Lighthouse CLI, axe, Playwright packages) without asking first.

Finish with: what changed (files), which contracts and targets you checked and how, what you couldn't check, and any placeholder you added or touched by code.
