# Build guidance

Read only the sections the task touches. Routes, placeholder codes, copy voice and visual direction live in `docs/design-brief.md`; this file says how to build with them. The brief names colours in words only ("harbour navy", "safety orange"), so exact values are defined once in the CSS when first needed, then recorded in `.claude/reference/` after the user approves them.

## Placeholders and the "confirm this" tags

The brief's section 8 describes the behaviour (still a proposal; build it as written). Build it this way:

- One data file holds every placeholder: code (P01...), ideal value, the question for the owner, status (open or confirmed), and the pages it appears on. Pages read values only from this file.
- In running text, one component renders the value. When the status is open, it wraps the value in a dashed outline with a corner label "Confirm P12" that reveals the question. The label sits over the content, so turning tags on or off moves nothing. The revealed question must meet WCAG 1.4.13: it opens on hover and on focus, Escape closes it, and the pointer can move onto it without it closing.
- Inside a link or button (the `tel:` number, the hero Call button, the rating link), show only the outline. A focusable label nested in an `<a>` or `<button>` is invalid HTML and breaks keyboard and screen reader use. The question for that placeholder appears on `/review`.
- Placeholders in attributes or metadata (`<title>`, `alt`, `href`, structured data) can't carry a visible tag. They appear on `/review` only.
- The switch is a `<button aria-pressed>`. Its state comes from `?tags=on|off` first, then saved browser storage. A small inline script in the page head, not a bundled or deferred script, sets a class on `<html>` before first paint so tags never flash.
- The `/review` checklist page is generated from the same data file.
- A public build excludes the tag markup, the switch script and `/review`, and fails if any placeholder is still open. A hidden tag still ships its sample value, so hiding is not enough.
- Sample reviews show a visible "sample" label whether tags are on or off.

## First screen and navigation

- Phone numbers are `tel:` links in `+1` format, one number written one way across the site. The phone sits in the same place in the header on every page (WCAG 3.2.6).
- The emergency colour appears only on the emergency path. The emergency button says "emergency" or "leaking now" in words, so colour is never the only signal.
- Sticky bar: two equal buttons, at least 48px tall, padded with `env(safe-area-inset-bottom)`. On pages whose first screen has its own Call and Book buttons, the bar appears once those scroll away; on every other page it shows from load. Set `scroll-padding-bottom` to cover the bar and the floating tag switch, so a focused field or link is never hidden under either (WCAG 2.4.11).
- Never set `user-scalable=no` or `maximum-scale=1`.
- Every prototype page has `<meta name="robots" content="noindex">`.

## Forms (booking, callback, commercial request, ZIP check)

- Label above each field; hint text below, linked with `aria-describedby`. Placeholder text is never the label.
- Use the right `type`, `inputmode` and `autocomplete`: `type="tel"` with `autocomplete="tel"` for the mobile number. The address is one brief field built as a small `<fieldset>`: a street line (`autocomplete="address-line1"`) and a ZIP (`autocomplete="postal-code"`, `inputmode="numeric"`). `street-address` leaves out the ZIP, so autofill would skip it. Don't block paste. Don't set `autocomplete="off"` on personal data fields (WCAG 1.3.5).
- The ZIP check reads its in, out and "call me to check" lists from a data file that records where the list came from. Treat the list as a placeholder for the owner to confirm; never invent coverage.
- Job choice and arrival windows are radio groups styled as large buttons, inside a `<fieldset>` with a `<legend>`, so keyboard and screen reader users get one group with arrow-key movement.
- Validation: check on submit, move focus to the first invalid field, and show the error under that field (linked by `aria-describedby`, field marked `aria-invalid="true"`). After the first submit, re-check each field as it changes so errors clear as soon as they're fixed. Validate phone numbers loosely: accept spaces, dashes, brackets and a leading +1.
- Error text says what to do, in the voice the brief sets, without apologising: "Enter a mobile number so I can text you the confirmation."
- Keep everything the customer entered after a failed submit. If they switch from booking to the callback form, carry the phone number across (WCAG 3.3.7).
- The submit button keeps its verb through the flow: "Book this time" becomes "Booking..." while sending, then the confirmation page says "Booked" (or "Requested", per the brief's P30). Disable it while sending, never before.
- Pass booking details to the confirmation page through `sessionStorage`. Never put the address, phone number or name in the URL.
- Working hours and the out-of-hours callback message are worked out in `America/New_York` time, not the visitor's device clock.
- Errors appear in direct response to a tap, so they don't count towards CLS; don't reserve empty space for them. Do reserve space for content that arrives on its own, such as the ZIP result after a lookup.
- Prototype forms send nothing. Production needs spam protection: prefer a hidden honeypot field plus a minimum fill time over a visible puzzle.

## Images and photo slots

- Name the LCP element for each screen size before optimising. In the brief's layout it is likely the headline or the owner line on mobile (the owner photo is a small circle there) and the van photo (P26) on desktop. Check in the browser rather than assuming.
- The LCP image, when it is an image, is a plain `<img>` in the initial HTML with `width`, `height` and `fetchpriority="high"`, never lazy-loaded, served in AVIF or WebP at the sizes the layout needs (`srcset` and `sizes`). Add a preload only if a trace shows it being found late.
- Prototype photo slots hold AI-generated stand-ins. Export them at the size and compression the real photos will have, so speed numbers carry over to launch.
- Every image below the first screen gets `loading="lazy"` and explicit dimensions.
- Real photos get alt text that says what's in them ("[Owner] fitting a water heater in a garage"). Decorative images get `alt=""` and nothing else.
- Each AI stand-in is a placeholder like any other fact: it lives in the placeholder data file with the shot description (which doubles as the brief for the real photo session), renders with a "replace with a real photo" tag, and keeps the final aspect ratio so swapping in the real photo changes nothing around it. Generated people must look like ordinary working tradespeople, never like stock models, and must not carry other companies' logos or invented text.

## Styling

- Plain CSS with custom properties for colour, spacing and type, defined once. Check every text and background pair against WCAG AA contrast (4.5:1 body, 3:1 large text and UI boundaries) when you add it. White text on a safety orange usually fails 4.5:1; darken the orange or use dark text.
- Keep specificity flat: one class per component, no section-level selectors that reach into components. Section and component rules overriding each other is the usual plain-CSS bug.
- Tabular figures (`font-variant-numeric: tabular-nums`) for prices, fees, phone and licence numbers.
- One font family at most, self-hosted and subset, with a size-adjusted fallback so text doesn't jump when it loads. A system font stack is acceptable.
- Visible focus style on every interactive element; never remove outlines without a replacement.
- Motion: none is required. New motion (from 2026-10-06 on) plays the same under `prefers-reduced-motion`, by the user's decision; motion built before then keeps its existing reduced-motion state. Never `transition: all`.
- Text must survive 200% zoom, 320px-wide reflow and increased letter and line spacing without clipping.

## Content structure

- Service pages, the pricing page and the FAQ use real headings in order, so the owner's prices and terms are readable as plain text by search engines and AI summaries.
- `LocalBusiness`/`Plumber` structured data only from confirmed facts; omit any property whose placeholder is still open.
- No city pages unless the brief's rule for them is met.

## If the stack is Astro

Apply only once `tech-stack.md` records Astro. Check each point against the current Astro docs before relying on it.

- Pages render to static HTML. Interactions use Astro `<script>` tags with plain JavaScript; no UI framework (React, Preact, Svelte) and no `client:*` directives, which exist only to load framework components.
- Astro bundles a plain `<script>` as a deferred module, which runs after first paint. The tag-state script must be `<script is:inline>` in `<head>`.
- For a small static site, inline stylesheets (`build.inlineStylesheets`) to avoid a render-blocking request; confirm with the built output.
- Use Astro's image component for the LCP image with eager loading and high fetch priority.
- Measure the built site (`astro build` then `astro preview`), never the dev server.
