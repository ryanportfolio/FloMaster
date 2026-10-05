# Build guidance

Read only the sections the task touches. Values (colours, type sizes, placeholder codes, routes) live in `docs/design-brief.md`; this file says how to build with them.

## Placeholders and the "confirm this" tags

The brief's section 8 describes the behaviour. Build it this way:

- One data file holds every placeholder: code (P01...), ideal value, the question for the owner, status (open or confirmed), and the pages it appears on. Pages read values only from this file.
- One component renders a placeholder value. When the status is open, it wraps the value with a dashed outline and a corner label "Confirm P12" that reveals the question on hover, focus or tap. The label is positioned over the content, so turning tags on or off moves nothing.
- The switch is a `<button aria-pressed>`. Its state comes from `?tags=on|off` first, then saved browser storage. A small inline script in the page head sets a class on `<html>` before first paint, so tags never flash.
- The `/review` checklist page is generated from the same data file.
- A public build excludes the tag markup, the switch script and `/review`, and fails if any placeholder is still open. A hidden tag still ships its sample value, so hiding is not enough.

## First screen and navigation

- Phone numbers are `tel:` links in `+1` format, one number written one way across the site. The phone sits in the same place in the header on every page (WCAG 3.2.6).
- The emergency colour appears only on the emergency path. The emergency button says "emergency" or "leaking now" in words, so colour is never the only signal.
- Sticky bar: two equal buttons, at least 48px tall, padded with `env(safe-area-inset-bottom)`. Add `scroll-padding-bottom` equal to the bar height so a focused field or link is never hidden under it (WCAG 2.4.11). It appears after the hero's own buttons scroll away.
- Never set `user-scalable=no` or `maximum-scale=1`.

## Forms (booking, callback, commercial request, ZIP check)

- Label above each field; hint text below, linked with `aria-describedby`. Placeholder text is never the label.
- Use the right `type`, `inputmode` and `autocomplete`: `tel` plus `autocomplete="tel"` for the mobile number, `autocomplete="street-address"` (or the address parts) for the address, `inputmode="numeric"` for ZIP. Don't block paste. Don't set `autocomplete="off"` on personal data fields (WCAG 1.3.5).
- Job choice and arrival windows are radio groups styled as large buttons, inside a `<fieldset>` with a `<legend>`, so keyboard and screen reader users get one group with arrow-key movement.
- Validation: check on submit, move focus to the first invalid field, and show the error under that field (linked by `aria-describedby`, field marked `aria-invalid="true"`). After the first submit, re-check each field as it changes so errors clear as soon as they're fixed. Validate phone numbers loosely: accept spaces, dashes, brackets and a leading +1.
- Error text says what to do, in the owner's voice, without apologising: "Enter a mobile number so I can text you the confirmation."
- Keep everything the customer entered after a failed submit. If they switch from booking to the callback form, carry the phone number across (WCAG 3.3.7).
- The submit button keeps its verb through the flow: "Book this time" becomes "Booking..." while sending, then the confirmation page says "Booked" (or "Requested", per the brief's P30). Disable it while sending, never before.
- Reserve the height of error messages and the ZIP result line so their appearance doesn't shift the page.
- Prototype forms send nothing. Production needs spam protection: prefer a hidden honeypot field plus a minimum fill time over a visible puzzle.

## Images and photo slots

- The largest first-screen image (usually the owner photo) is a plain `<img>` in the initial HTML with `width`, `height`, `fetchpriority="high"`, no lazy loading, served in AVIF or WebP at the sizes the layout needs (`srcset` and `sizes`). Add a preload only if a trace shows it being found late.
- Every other image below the first screen gets `loading="lazy"` and explicit dimensions.
- Real photos get alt text that says what's in them ("[Owner] fitting a water heater in a garage"). Decorative images get `alt=""` and nothing else.
- Empty photo slots are labelled frames with the shot description from the brief, at the final aspect ratio, so swapping in the real photo changes nothing around it.

## Styling

- Plain CSS with custom properties for colour, spacing and type, defined once. Check every text and background pair against WCAG AA contrast (4.5:1 body, 3:1 large text and UI boundaries) when you add it.
- Keep specificity flat: one class per component, no section-level selectors that reach into components. Section and component rules overriding each other is the usual plain-CSS bug.
- Tabular figures (`font-variant-numeric: tabular-nums`) for prices, fees, phone and licence numbers.
- One font family at most, self-hosted and subset, with a size-adjusted fallback so text doesn't jump when it loads. A system font stack is acceptable.
- Visible focus style on every interactive element; never remove outlines without a replacement.
- Motion: none is required. Anything that moves respects `prefers-reduced-motion`. Never `transition: all`.
- Text must survive 200% zoom, 320px-wide reflow and increased letter and line spacing without clipping.

## Content structure

- Service pages, the pricing page and the FAQ use real headings in order, so the owner's prices and terms are readable as plain text by search engines and AI summaries.
- `LocalBusiness`/`Plumber` structured data only from confirmed facts; omit any property whose placeholder is still open.
- No city pages unless the brief's rule for them is met.

## If the stack is Astro

Apply only once `tech-stack.md` records Astro. Check each point against the current Astro docs before relying on it.

- Pages render to static HTML. Each `client:*` directive needs a stated reason; prefer `client:visible` or `client:idle` over `client:load` unless the interaction is in the first screen.
- For a small static site, inline stylesheets (`build.inlineStylesheets`) to avoid a render-blocking request; confirm with the built output.
- Use Astro's image component for the hero with eager loading and high fetch priority.
- Measure the built site (`astro build` then `astro preview`), never the dev server.
