# Design brief: prototype website for a Hampton Roads master plumber

Status: draft for review, 2026-10-05. Nothing is built yet.
Research: [research.md](research.md) (copied unedited from the research session).

## How to read this brief

Each design decision points back to the research in one of two ways:

- **Finding 1-8** are the eight main findings listed in [section 2](#2-research-findings-this-brief-relies-on).
- **Checklist 1-27** are the numbered build checklist items in section 8 of [research.md](research.md). Items 1-12 are "must", 13-21 "should", 22-27 "could".

Where this brief departs from the checklist, it says so and gives the reason (usually an owner answer recorded in section 11 of the research).

Placeholders have short codes (P01, P02 and so on) so the owner can answer by number. The full list is in [section 7](#7-placeholder-list).

## 1. What the prototype is for

The first build is a clickable prototype for one reader: the owner. It is not a public launch. It has two jobs:

1. **Get his answers.** Every fact we don't have yet appears on the page as an ideal-case placeholder with a "confirm this" tag. He goes through the site, sees exactly where each fact will appear and why it matters, and tells us the real value, a different value, or "take it out".
2. **Get his reaction to the design.** With the tags switched off, the site looks finished, so he can judge the layout, tone and photos without the clutter.

### What the owner should be able to answer after one walk-through

Facts about the business (from section 11 of the research, items still "to come"):

- His licence number or numbers, and his insurance and bonding (P04-P06).
- Whether 24/7 emergency service is real, who answers after hours, and how fast he can arrive (P07-P09).
- How many calls he answers live, and how fast he can return a callback request (P10-P11).
- Every fee he charges and whether each is credited against the job (P12-P16).
- Price ranges for his common jobs, and flat-rate or time and materials (P17-P18).
- Warranty terms for labour and parts (P19-P20).
- Where his reviews are, their counts and ratings, and who replies (P21-P24).
- Which photos he can supply, and whether customers will consent to before/after shots (P25-P28).

Decisions about how he works, which the site design forces into the open:

- Which arrival windows he can commit to, and whether online bookings confirm instantly or wait for him (P29-P30).
- What commercial customers get that residential customers don't (P33).
- Which jobs he wants a service page for (P32).
- Whether he is comfortable with the site speaking in his own voice ("I", "me"), since he is the only person customers will meet.

Design questions:

- Does it look and sound like his business?
- Is the emergency path a promise he can keep at 2 a.m.?
- Are the published prices and fees ones he will stand behind?

### Prototype safety rules

- Every page carries `noindex`, and the review link is private (host to be decided; see [section 11](#11-recommended-tech-stack)).
- The placeholder phone number is `+1-757-555-0123`. Numbers from 555-0100 to 555-0199 are reserved for fictional use, so a tap on "Call" during review cannot ring a stranger.
- Booking and callback forms do not send anything. Submitting shows the confirmation screens with the details entered.
- Sample reviews are marked as samples. They must never reach a public site: the FTC rule bans fake reviews (research section 4, Checklist 11).

## 2. Research findings this brief relies on

1. **Reviews are the first filter.** 68% need 4+ stars, 47% skip businesses with fewer than 20 reviews, 74% want reviews from the last 3 months. 54% visit the website only after reading good reviews, so the site confirms what the reviews said.
2. **Most leads arrive by phone, but only 52% of home-services calls reach a person.** For a one-person business, the callback request and online booking are the fallbacks when he is under a sink.
3. **Surprise pricing is the top complaint.** 43% went over their estimate. Show prices or ranges and list every fee.
4. **Customers check qualifications and trustworthiness first** (83% and 79%). Show the licence and insurance.
5. **Real photos and a named technician beat stock images.** 58% are reassured by the tech's name and photo before the visit. Here the technician is the owner.
6. **Emergency and planned work need separate paths from the first screen.** Emergencies go to the phone; planned jobs go to booking.
7. **About half of US traffic is mobile.** Target LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, WCAG 2.2 AA, and a call button of at least 44x44px.
8. **Real plumber sites make visible mistakes:** broken review widgets, outdated banners, staging links, typos, stacked pop-ups, repeated "CLICK NOW" buttons, expired badges, filtered or fake testimonials.

### Where this brief departs from the research checklist

| Checklist item | Decision | Reason |
|---|---|---|
| 16. Financing next to prices | Left out | Owner offers no financing (research section 11, answer 8). |
| 27. "Google Verified" badge | Left out | No Local Services Ads yet (answer 17). |
| 23. Text updates or van tracking | Designed in, as text updates and an appointment status page | We build our own booking system (answer 9), so updates are ours to design. No live van tracking in the prototype. |
| 14. Technician profiles | One profile: the owner | One-person business (answers 2 and 12). |
| 26. Chatbot | Left out | A chatbot only helps when it has a phone escape; for one person, the callback form does that job with less to go wrong (research section 6). |

## 3. Sitemap

About 15 pages. Every page shares the same header (phone, Book, licence line), the same footer (licence, insurance, hours, service area) and, on mobile, the same sticky Call and Book bar.

| Page | Path | Role | Research |
|---|---|---|---|
| Home | `/` | Confirms what the reviews said, splits emergency from planned work, and sends residential and commercial visitors to their paths. | Findings 1, 6; Checklist 3, 4 |
| Emergency | `/emergency` | Phone first. What counts as an emergency, what to do while you wait (shut-off valve), the after-hours fee, the arrival time. Callback form as the fallback. | Finding 6; Checklist 3, 8, 18 |
| Book a visit | `/book` | The four-field booking flow, with the callback request beside it. | Finding 2; Checklist 3, 18 |
| Booking confirmed | `/book/confirmed` | Owner's photo and name, arrival window, fees that apply, how to change or cancel. | Finding 5; Checklist 14 |
| Appointment status | `/appointment` (sample) | Shows each update state the customer sees: booked, confirmed, on the way, arrived, done. Prototype only shows sample states. | Checklist 23 |
| Residential services | `/residential` | Hub listing every service with its price range, linking to service pages. | Finding 3; Checklist 7, 20 |
| Service pages | `/residential/<service>` | One page per common job (list in P32): what it covers, price range, typical time on site, repair-or-replace options, related reviews. | Checklist 7, 15, 17, 20 |
| Commercial | `/commercial` | For property managers, landlords, restaurants and offices: scheduling around business hours, a site-visit request instead of the four-field booking, insurance certificate on request, billing terms. Details in P33. | Owner answer 14 |
| Prices, fees and guarantee | `/pricing` | Every fee, every published range, flat-rate or time and materials, how quotes work, the written guarantee. | Finding 3; Checklist 7, 13, 17 |
| Reviews | `/reviews` | Rating, count, every review from the source (not a filtered set), a link to the source, owner replies. | Finding 1; Checklist 4, 11, 21 |
| Service area | `/service-area` | The seven cities, a ZIP check, hours, and what "24/7" means. | Checklist 8 |
| About | `/about` | The owner: name, photo, master plumber licence, years in the trade, why customers always get him. | Findings 4, 5; Checklist 5, 6 |
| FAQ | `/faq` | Fees, arrival windows, warranty, payment methods, what to do in an emergency. | Checklist 19 |
| Privacy | `/privacy` | Required because the forms collect names, numbers and addresses. Placeholder text in the prototype. | |
| Items to confirm | `/review` | Prototype only. Printable list of every placeholder, generated from the same data as the tags. See [section 8](#8-how-the-placeholder-tags-work). | |

### Residential and commercial paths

The home page offers both paths without making every visitor choose first. Residential is the default because emergencies and most bookings come from homeowners. Commercial gets a clearly labelled link in the first screen ("Business or rental property? Commercial service") and its own page, because its needs differ: work scheduled around opening hours, a quote or site visit before booking, a certificate of insurance, invoices to a company. The four-field booking flow is residential; commercial uses a four-field site-visit request (business name, contact number, address, what's needed).

### Service area and city pages

The prototype has **no city pages**. One service-area page lists Chesapeake, Hampton, Newport News, Norfolk, Portsmouth, Suffolk and Virginia Beach, with a ZIP check that answers "Yes, I cover [ZIP]" or "That's outside my area" (Checklist 8). The booking form uses the same check on the address field.

Pages that repeat the same text with a city name swapped in count as doorway pages and keyword stuffing under Google's spam policy (research section 6, Checklist 20). A city page gets added later only when it has content that is true for that city and no other, for example:

- jobs actually done there, with photos and the neighbourhood named (with consent);
- reviews from customers in that city;
- a local difference the owner can speak to, such as a different arrival time.

If the owner can't supply at least one of those per city, the city stays a line on the service-area page.

## 4. The first screen

The first screen has to do five things before any scrolling: offer a call, offer a booking, separate emergencies, show the rating, and show the licence (Findings 1, 4, 6; Checklist 1-5).

### Mobile (375 x 667 as the smallest target)

From top to bottom:

1. **Header bar.** Business name placeholder (P01) on the left; phone icon button on the right (`tel:` link, 48x48px). Directly under it, one line in readable type: "Virginia Master Plumber · Licence [P04]". The owner asked for the licence to be prominent on every page; it sits in the header, not the footer.
2. **Headline in plain words.** Draft: "Plumbing repairs across Hampton Roads, done by a master plumber." One line under it: "When you call, you get me: [Owner name]." with a small round photo of the owner (P25).
3. **Rating line.** "[4.9] stars from [86] Google reviews · newest [3 days] ago" (P21-P23). Tapping it goes to `/reviews`. Showing the newest review's age answers the 74% who want recent reviews (Finding 1).
4. **The emergency fork.** Two large stacked buttons, full width, at least 48px tall:
   - "Water leaking now? Call [P07: 24/7]" in the emergency colour. Opens the dialler.
   - "Plan a repair or install: Book a time". Goes to `/book`.
5. **Commercial link.** "Business or rental property? Commercial service".

**Sticky bottom bar** (all pages, mobile only): Call and Book, nothing else (Checklist 2). It appears after the first screen scrolls away, so the hero buttons aren't doubled on load. Two buttons only, so there is no "CLICK NOW" stacking (Finding 8).

Just below the first screen: one recent dated review with the reviewer's first name and town (Checklist 4), then the three-line "how I price" summary linking to `/pricing` (Finding 3).

### Desktop (1280 wide as the main target)

- **Header:** business name, navigation (Residential, Commercial, Prices, Reviews, Service area, About), phone number written out in full as a link, a Book button, and the licence line under the business name.
- **Hero, two columns.** Left: headline, owner line, rating line, the most recent review quoted in full with its date, and the two fork buttons side by side (emergency call, book a time). Right: a real photo of the owner with his van (P26). This photo is the page's largest image, so it is sized and compressed to keep LCP under 2.5s (Finding 7).
- **Trust strip** directly under the hero: licence, insurance (P05), years in the trade (P31), warranty headline (P19), and "Every fee listed on the price page".

### Things the first screen will not have

No carousel, no pop-up or cookie wall over the content, no chat bubble, no auto-playing video, no badges we can't back (no "Google Verified", Checklist 27). Each is a mistake catalogued in research sections 6 and 7.

## 5. Booking flow

Booking exists so a customer can reach him when he can't answer (Finding 2). Baymard found that the number of fields matters more than the number of steps (research section 5), so the flow is capped at **four fields**.

### The four fields

| # | Field | Input | Notes |
|---|---|---|---|
| 1 | What needs doing | Tap one of 6-8 job buttons, or "Something else" | The buttons match the service pages (P32). "Something else" opens an optional one-line note, still counted as this field. |
| 2 | When | Tap an arrival window, for example "Tue 8 Oct, 10 a.m.-12 p.m." | Windows come from the owner's calendar (P29). The prototype shows sample windows. |
| 3 | Address | One street-address field with suggestions | Checks the ZIP against the seven cities. Outside the area: a plain message and the phone number. A ZIP that is only partly inside the area gets "Call me to check" rather than a yes or no. |
| 4 | Mobile number | Phone field, numeric keyboard | Used for the confirmation text and updates. A line under it states that he will text about this booking; the real system needs the customer's consent to texts, so the wording is a placeholder until the booking system is designed. |

All four sit on one screen on desktop. On mobile they are one short screen, field 1 first, so the customer commits to the job before typing anything.

Name is not one of the four. The confirmation page asks "What should I call you?" as an optional extra after the booking is made. This keeps the booking to four fields, but the owner may need a name up front; see [open questions](#12-open-questions).

The price range for the chosen job and the call-out fee (P12) appear beside the form before the customer submits, so the first number they see isn't on the invoice (Finding 3).

### Callback fallback

Shown on `/book`, `/emergency`, and whenever no arrival window suits: "Can't find a time, or rather talk first? Leave your number and I'll call you back within [P11: 30 minutes] during working hours." One required field (mobile number), one optional (what's going on). Outside working hours the message changes to say when he will call back, never promising a time he can't keep (Checklist 8).

### Confirmation screen

The confirmation is where the customer first meets him, so it carries the trust signals from the research (Finding 5, Checklist 14):

- The owner's photo, his name and "Virginia Master Plumber, Licence [P04]".
- The arrival window in large type, with the date written out.
- What happens next. The ideal default is a request the owner confirms: "I'll text you within [1 hour] during working hours to confirm this window." An emergency can take him off his schedule at any moment, so a one-person business promising exact slots instantly risks breaking the promise. If he keeps his calendar tight enough, P30 can switch this to instant confirmation. The prototype can show both versions.
- "I'll text you when I'm on my way."
- The fees that apply to this visit and whether they come off the job price (P12-P16).
- The address and job, with a link to change them.
- Reschedule and cancel links, and the cancellation terms if any (P15).
- Add to calendar.
- Optional: "What should I call you?" and "Send a photo of the problem" (photo upload is in several example sites, research section 5, and helps him bring the right parts).

### Appointment updates

The same details go out by text, with a link to the appointment status page. The prototype shows each state as a sample so the owner can approve the wording:

1. **Requested** (or "Booked", if P30 switches to instant confirmation).
2. **Confirmed** by the owner, or a different window offered.
3. **Reminder** the evening before.
4. **On my way**, with an estimated arrival time.
5. **Arrived**.
6. **Done**: what was done, the price, the warranty, and a review link with no incentive attached (an incentive would break the FTC rule, Checklist 11).

## 6. Trust, pricing, fees and guarantee

### Trust

| Element | Where it appears | Research |
|---|---|---|
| Licence number (P04) | Header of every page, footer, About, confirmation | Owner request; Finding 4; Checklist 5 |
| Insurance and bonding (P05, P06) | Trust strip, footer, About, Commercial (certificate on request) | Finding 4; Checklist 5 |
| Rating, review count, newest review age (P21-P23) | First screen, Reviews page, service pages | Finding 1; Checklist 4 |
| Owner photo and name (P25) | First screen, About, booking confirmation, every update text | Finding 5; Checklist 6, 14 |
| Van and job photos (P26-P28) | Home, service pages, About | Finding 5; Checklist 6, 15 |
| Owner replies to reviews (P24) | Reviews page | Checklist 21; research section 3 (templated replies put off 50%) |
| Years in the trade (P31) | Trust strip, About | Research section 5 (specific local copy) |

Reviews come in through the review site's API in the built site, never as screenshots, because screenshots are easy to alter and a broken widget is worse than none (research section 5, Finding 8). The prototype uses sample reviews in the same shape. If the API ever fails, the block shows the rating and a link to the source; it never shows "Loading reviews..." or an empty heading (research section 7).

### Pricing and fees

The `/pricing` page has four parts, and service pages repeat the line relevant to them.

1. **Fees, all of them, in one table** (Finding 3, Checklist 7): call-out or trip fee (P12), diagnostic fee (P13), after-hours or emergency fee (P14), cancellation fee if any (P15), card fee if any (P16). Each row says whether it comes off the job price. A fee he doesn't charge is listed as "None", because the absence of a fee is a selling point.
2. **Price ranges for common jobs** (P17), for example "Unblock a kitchen sink: $[150]-$[275]". Each range says what pushes a job to the top of it.
3. **How I charge** (P18): flat-rate per job or time and materials, in two sentences.
4. **How I quote** (Checklist 17, research section 4 regulator checklists): written price before work starts; repair options before replacement; no cash-only; no full payment up front. Each is also a placeholder (P34) because each is a promise about how he works.

Sample dollar figures in the prototype are there to make the layout realistic. They are not price advice from the research and are tagged like any other placeholder.

Virginia's fee-disclosure rules have not been checked. Listing every fee reduces the risk, and the check should happen before launch (see [open questions](#12-open-questions)).

### Guarantee

A short written guarantee on `/pricing`, summarised in the trust strip (Checklist 13): labour warranty length (P19), parts warranty (P20), what's excluded, and how to claim it. The research shows guarantees without terms ("MORE THAN A GUARANTEE") and guarantees contradicted by their own fine print (research section 7), so the terms sit on the page in full, not behind a link.

## 7. Placeholder list

Every item below appears on the site with a "confirm this" tag until the owner supplies the real value. "Ideal default" is what the prototype shows meanwhile.

| Code | Item | Ideal default shown | Where |
|---|---|---|---|
| P01 | Business name | "[Business Name] Plumbing" | Everywhere |
| P02 | Logo | Text wordmark of P01 | Header, footer, favicon |
| P03 | Phone number and email | +1-757-555-0123; hello@example.com | Header, sticky bar, footer, forms |
| P04 | Licence number(s) and type | "Virginia Master Plumber · Licence #[000000]" | Header of every page, footer, About, confirmation |
| P05 | Insurance | "Fully insured: general liability [$1M]" | Trust strip, footer, Commercial |
| P06 | Bonding | "Bonded" | Trust strip, footer |
| P07 | 24/7 emergency service | "24/7 emergency line" | Hero button, Emergency page, footer |
| P08 | Who answers after hours | "You reach me directly, day or night" | Emergency page |
| P09 | Emergency arrival time | "Usually there within [60] minutes" | Emergency page, FAQ |
| P10 | Working hours | "Mon-Fri 7 a.m.-6 p.m., Sat 8 a.m.-1 p.m." | Footer, service area, FAQ |
| P11 | Callback time | "Within 30 minutes during working hours" | Callback form, Book, Emergency |
| P12 | Call-out or trip fee | "$[89], taken off the job price" | Pricing, booking form, confirmation |
| P13 | Diagnostic fee | "None" | Pricing |
| P14 | After-hours fee | "$[150] extra after 6 p.m. and weekends" | Pricing, Emergency |
| P15 | Cancellation terms | "Free to cancel up to 2 hours before" | Pricing, confirmation |
| P16 | Card fee | "None" | Pricing, FAQ |
| P17 | Price ranges for common jobs | Sample ranges per job | Pricing, service pages, booking form |
| P18 | Flat-rate or time and materials | "Flat price per job, agreed before I start" | Pricing |
| P19 | Labour warranty | "[1-year] labour warranty" | Pricing, trust strip, Done update |
| P20 | Parts warranty | "Manufacturer's warranty, handled by me" | Pricing |
| P21 | Review source | Google | First screen, Reviews |
| P22 | Rating and count | "[4.9] from [86] reviews" | First screen, Reviews |
| P23 | Recent reviews | Sample reviews, marked as samples | First screen, Reviews, service pages |
| P24 | Who replies to reviews | "I reply to every review myself" | Reviews |
| P25 | Owner name and portrait | "[Owner name]"; labelled photo frame | First screen, About, confirmation |
| P26 | Van photo | Labelled photo frame | Home hero, About |
| P27 | Job photos | Labelled photo frames | Service pages, home |
| P28 | Before/after consent | Before/after pair with "shared with the customer's permission" | Service pages |
| P29 | Bookable arrival windows | Two-hour windows, weekdays | Booking form |
| P30 | Instant or owner-confirmed bookings | Owner confirms by text within [1 hour] | Booking, confirmation, updates |
| P31 | Years in the trade | "[18] years in the trade" | Trust strip, About |
| P32 | Service list for service pages | Drain clearing, water heaters, leaks and pipe repair, toilets and fixtures, sewer lines | Residential hub, service pages, booking field 1 |
| P33 | Commercial offer | Scheduling around opening hours, certificate of insurance, invoiced billing | Commercial |
| P34 | Quoting promises | Written price first, repair options first, no cash-only, no full payment up front | Pricing, FAQ |
| P35 | Payment methods | "Card, check, cash" | Pricing, FAQ |

Items P07-P20 and P21-P28 are claims about the business. The research warns that an unconfirmed "24/7", warranty or price on a live site is a false-advertising risk (research section 11), so none of them can go public tagged.

## 8. How the placeholder tags work

This is a proposal; it hasn't been approved yet.

- **What a tag looks like.** The placeholder value is shown as it would appear on the finished site, with a thin dashed outline and a small "Confirm P12" label attached to its corner. Tapping or focusing the label shows the question for the owner in one sentence, for example "Do you charge a call-out fee, and is it taken off the job price?"
- **The switch.** One floating button, bottom left on desktop and above the sticky bar on mobile: "Items to confirm: On / Off". Off removes every outline and label, so the page looks finished. It is a real button with `aria-pressed`, reachable by keyboard.
- **The setting sticks.** The choice is saved in the browser and can also be set with `?tags=on` or `?tags=off` in the link, so we can send the owner one link for "answer the questions" and one for "judge the design". A tiny script in the page head applies the setting before anything is drawn, so tags never flash on and then disappear.
- **No layout jumps.** Labels sit on top of the content rather than pushing it, so switching doesn't move the page. Shifts within half a second of a tap don't count towards CLS anyway, but the design shouldn't rely on that.
- **One source of truth.** Every placeholder lives in one data file with its code, ideal value, question and status. The tags, the `/review` checklist page and later the real values all read from that file. When the owner answers, we change the value once and its tag disappears everywhere.
- **The checklist page** (`/review`) lists every open item with its question, the ideal default, and the pages where it appears. It prints on two or three pages, so he can fill it in by hand or go through it on a call. The page doesn't collect answers; we type them into the data file afterwards.
- **Before any public launch** the build fails if any placeholder is still unconfirmed, and the public build leaves out the tag code and the `/review` page entirely. Hiding tags with a switch is not enough on a live site, because a sample licence number would still be in the page. This prevents the stale-content mistakes in Finding 8.

## 9. Visual direction and copy voice

### Look

- **Real photos only.** Until the owner supplies photos, each photo slot is a labelled frame describing the shot needed ("Owner at the van, landscape, morning light"). No stock photos and no AI-generated people: stock is the most-cited trust killer, and images people suspect are AI lower trust ratings (Finding 5, research section 5). The frames double as a shot list for the photo session.
- **Plain, sturdy, local.** A working tradesman's site, not a franchise template. Deep harbour navy and off-white as the base, with one warm safety orange used only for the emergency path, so emergency is the only thing on the page in that colour. All text pairs meet WCAG AA contrast (4.5:1 for body text).
- **Type.** One readable sans-serif family, self-hosted, 18px body text on mobile, with numbers (prices, phone, licence) set large and in tabular figures so they line up in the fee table.
- **Layout.** Short sections, generous spacing, one action per section. Icons only where they carry meaning (phone, calendar, map pin), always with a text label.
- **Logo.** Text wordmark until P02 is settled. The design must work without a logo.

### Copy voice

The owner is the only person customers will deal with, so the site speaks as him, in the first person: "I", "me", "my van". This turns the one-person business into the selling point (Finding 5) and keeps every promise attributable to a person. It needs his approval.

- **Plain.** Short sentences, everyday words, numbers instead of adjectives. "Usually there within an hour" beats "lightning-fast response".
- **Local.** Name the cities and real places he works. No generic "serving the greater area".
- **Honest.** Repair before replace, written prices first, no scare tactics. The research found hard-sell and scare stories, often aimed at older customers, among the strongest complaints (research section 3).
- **Calm in emergencies.** The emergency page tells people what to do right now (find the shut-off valve), then how to reach him.
- **One label per action.** "Call" and "Book a time" read the same everywhere. No "CLICK NOW", no exclamation marks, no countdown offers.

Sample lines for the owner to react to:

- "When you call, you get me: the master plumber who'll do the work."
- "Every fee I charge is on this page. If it isn't listed, I don't charge it."
- "I'll text you when I'm on my way."

### Launch QA from the research

Before anything goes public: no staging links, no leftover placeholder text, no old years in the footer, no seasonal banners out of season, review counts that match their source, no typos in headings, one phone number formatted one way (Checklist 1, 12; research section 7).

## 10. Performance and accessibility targets

| Target | Value | How we check it |
|---|---|---|
| Largest Contentful Paint | ≤ 2.5s | Lighthouse mobile run with throttling, plus headed Chrome on this machine |
| Interaction to Next Paint | ≤ 200ms | A recorded run through the booking flow, ZIP check and tag switch, using Chrome DevTools live metrics or a Lighthouse timespan recording. A standard Lighthouse page-load run doesn't measure INP. |
| Cumulative Layout Shift | ≤ 0.1 | Lighthouse; tag switch tested separately |
| Accessibility | WCAG 2.2 AA | axe scan of every page, keyboard-only run, screen reader run (NVDA) on Home, Book and Pricing |
| Call button size | At least 44x44px (we use 48px) | Measured in the browser at 375px wide |

These are the Core Web Vitals "good" thresholds at the 75th percentile of real visits (Finding 7, Checklist 9-10). A private prototype has no real visitors, so it can only be measured in the lab; field data starts at launch.

What keeps the numbers in range:

- Pages are delivered as finished HTML with almost no JavaScript; scripts load only for the booking form, the ZIP check and the tag switch.
- The hero photo is the only large image above the fold, served in modern formats at the size the screen needs, with width and height set so nothing shifts.
- One web font family, preloaded, with a matching fallback so text doesn't jump when it loads.

Accessibility details the research singles out, since most home pages fail on them (research section 5, WebAIM figures): contrast, alt text on every real photo, a visible label on every form field, and a text name on every icon button. Also: visible focus outlines, no information carried by colour alone (the emergency button says "emergency" in words), and motion only where it helps, switched off for visitors who ask their device to reduce motion.

## 11. Recommended tech stack

**Astro, producing static pages, with plain CSS.** Reasons:

- **Speed by default.** Astro sends finished HTML and no JavaScript unless a component asks for it. That suits a mostly static site with three interactive pieces (booking form, ZIP check, tag switch) and makes the Core Web Vitals targets the default outcome rather than a tuning job (Finding 7).
- **Shared components without a heavy framework.** The header, licence line, footer and sticky bar are written once and reused on all 15 pages. Hand-written HTML would copy them 15 times.
- **One data file for the placeholders.** Astro reads typed data files at build time, so the tags, the `/review` checklist and the "fail the build if anything is unconfirmed" check all come from the same file (section 8).
- **Room to grow.** Astro can add server routes later, which is where our own booking system will live, without moving the static pages to another framework.
- **Plain CSS** with a small set of variables for colour, spacing and type. The site is small enough that a CSS framework adds setup without saving work.

Considered and not chosen: **Next.js** sends more JavaScript to every page and needs a server runtime the prototype doesn't need. **Hand-written HTML** has no shared components or data. A **site builder** (Wix, Squarespace) can't host our own booking system or the placeholder tags.

**The booking system is out of scope for the prototype.** The prototype's forms are front-end only, with sample arrival windows. Those choices wait until the owner has answered P29-P30 and we know how he wants to run his day. So the size of that later job is visible now, the real system will need:

- a login for the owner, and a way for him to see and confirm requests from his phone;
- his calendar and availability, with protection against double booking and correct handling of daylight saving time;
- a database for bookings, with backups, and a privacy policy that matches what we store;
- text messages for confirmations, reminders and "on my way". Business texting in the US requires registering the sending number with the carriers (known as A2P 10DLC registration), which takes time and carries fees, and forms need the customer's consent to texts;
- scheduled jobs for reminders, which a static host can't run;
- appointment links that can't be guessed and that expire;
- spam protection on the forms;
- an alert that reaches him while he's on a job.

**Hosting** is undecided, for the review link and for later. The host should be chosen before any booking code is written, because the Astro adapter, scheduled jobs and database all depend on it. The review link must be behind a password or access control; `noindex` only keeps it out of search results and doesn't stop anyone with the link.

## 12. Open questions

For you, before the build starts:

1. **Placeholder tags.** Do you approve the tag design and switch in section 8? Should tags start on or off when the owner opens the link?
2. **Photos during review.** Labelled frames describing each shot (my recommendation, and it avoids stock entirely), or temporary stock photos in "tags off" mode so the design looks complete? Stock risks the owner judging a look he can't have.
3. **First-person voice.** Should the site speak as the owner ("I", "me")? I recommend it for a one-person business; it changes almost every line of copy.
4. **Name in the booking form.** Keep the four fields as job, time, address and mobile, with the name asked afterwards? Or swap one field for name?
5. **Business name.** Is "FloMaster" (the repo name) a working business name we can use in the prototype, or should it stay "[Business Name]"?
6. **Commercial depth.** Is one commercial page with a site-visit request enough for the prototype, or does the owner do enough commercial work to need commercial service pages?
7. **Review link hosting.** Any preference for where the private prototype is hosted? It needs a password or private link and must stay out of search results.
8. **Virginia fee disclosure.** Do you want the Virginia advertising and fee-disclosure rules checked now, or before launch?
9. **Sample figures.** Are you comfortable with realistic sample prices and fees in the prototype, tagged, or would you rather show "$___" so the owner isn't anchored by our numbers?
10. **Who edits content after launch.** If the owner should be able to change prices or hours himself, we add a simple editing tool on top of the data files. If changes always go through us, we don't. Which is it?
11. **Booking confirmation default.** Show bookings as requests the owner confirms (my recommendation, since emergencies will disrupt his schedule), or as instantly confirmed slots? The prototype can show both, but one should lead.
12. **Licence numbers.** Virginia may issue both a contractor licence for the business and a master plumber licence for the person. Should the brief plan for showing both? (Not yet checked; the owner can confirm which he holds.)
