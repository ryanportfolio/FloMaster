# Audit guidance

An audit reports; it doesn't edit. Fix only when the user asks, then re-run the passes that cover the fix.

Run the passes in order. Skip a pass only when the audited change can't affect it, and say which ones you skipped.

## 1. Source sweep (no browser)

Search the changed files for:

- `user-scalable=no` or `maximum-scale=1`;
- `outline: none` or `outline: 0` without a replacement focus style;
- `transition: all`;
- click handlers on `div` or `span`;
- `<img>` without `width` and `height`, or without `alt`;
- inputs without a `<label>`, or using placeholder text as the label;
- `autocomplete="off"` on name, phone, email or address fields;
- business facts typed into a page instead of read from the placeholder data file;
- more than one format of the phone number, or a number outside 555-0100 to 555-0199 while the real one is unconfirmed;
- leftover template text, staging URLs, old years, "TODO", "Lorem", empty headings.

Report each hit as `path:line`, what's wrong, the fix.

## 2. Contracts and research checklist

Check the built pages against the contracts in this skill's SKILL.md and the "must" items (1-12) of section 8 in `docs/research.md`, plus any "should" items the brief adopted. For each, mark pass, fail or not yet built, with the page you checked. Departures the brief records (no financing, no "Google Verified" badge, one technician profile) are passes.

## 3. Generic-template look

The brief asks for a plain, local, owner-run site. Flag patterns that make it read as a generated template:

- rows of identical rounded cards with soft shadows for content that isn't a set of equal items;
- all-caps "eyebrow" labels above every heading;
- arrows or icons decorating every button;
- 01/02/03 numbering on things that aren't steps;
- a decorative gradient or blob background;
- stock-style or AI-looking people;
- several competing accent colours, or the emergency colour used off the emergency path;
- marketing filler copy ("Your trusted partner for all your plumbing needs").

Report these as suggestions, not failures, unless the brief rules them out.

## 4. Accessibility (WCAG 2.2 AA)

Never call a page AA-compliant without the output of steps a and b in hand.

a. **Automated scan.** Run axe limited to WCAG 2.x A and AA tags against the built page in headed Chrome. Use a pinned, locally installed copy, not a CDN script, and ask before installing it. Report violations, and list axe's "incomplete" results as needing a manual check.
b. **Keyboard.** Tab through the whole page: every control reachable, order follows the layout, focus always visible and never hidden under the sticky bar or header (2.4.11), no traps, radio groups move with arrow keys, the tag switch and form submit work with Enter or Space.
c. **Visual.** Contrast of every text and UI pair; 200% zoom; 320px-wide reflow with no sideways scrolling; increased text spacing; Call button at least 44x44px and other targets at least 24x24px (2.5.8), measured in the browser.
d. **Screen reader** (NVDA) on Home, Book and Pricing at least: headings outline, form labels, error announcements, the confirmation page, the tag labels.

Also check the newer 2.2 criteria that map to this site: phone and help in the same place on every page (3.2.6) and entered data reused rather than asked again (3.3.7).

Write each finding as: criterion, element (`path:line` or selector), what fails, fix. Don't cite 4.1.1; it no longer applies in WCAG 2.2.

## 5. Speed

- Measure the production build served locally, on a mobile profile, three runs, and report the median. Never measure the dev server.
- LCP and CLS: Lighthouse page-load runs. Name the LCP element and confirm it's the intended image or heading.
- INP: a recorded interaction run through the booking flow, ZIP check and tag switch (DevTools live metrics or a Lighthouse timespan recording). Total Blocking Time is a lab stand-in, not INP.
- Label every number as lab data. Field data (75th percentile of real visits) exists only after launch.
- Don't call a target failing or passing from reading code. If you couldn't measure, say "not measured".

## 6. Forms

For each form: valid submit, invalid submit (focus moves to the first error, message is specific), empty submit, keyboard only, screen reader, browser autofill, and a phone-width run. Check that entered data survives a failed submit and carries into the callback form.

## Report format

```text
Scope: pages and files audited, build or dev, viewport sizes
Passes run: 1-6, with any skipped and why
Failures (fix before the owner sees it): path:line or page, problem, fix
Suggestions: same format
Checked and fine: one line each
Not checked: what and why
```

Call it "visual acceptance" when there's no earlier screenshot to compare against; it's only a regression check when a baseline exists.
