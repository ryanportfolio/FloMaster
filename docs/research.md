# Plumbing websites: what customers want, what they punish, and what to build

Research brief for designing and building a plumbing business website. Compiled 2026-10-05 from four research lenses (customer voice, web UX, site teardowns, trust and pricing). Each finding was checked against its source, and findings that failed verification are left out. Numbers in brackets point to the sources list in section 10.

## How to read the evidence

- **Strongest:** BrightLocal Local Consumer Review Survey 2026 (n=1,002 US adults) [2], WebAIM Million [30], web.dev Core Web Vitals [23], WCAG [31], Baymard [28], regulator guidance [33][54][55][56][60][61][62], Angi/HIRI tracker [13][14].
- **Medium:** Housecall Pro homeowner survey (n=1,040, Oct 2025) [5]. It comes from a software vendor, covers all home services rather than plumbing alone, and some figures appear only in chart alt text. Invoca call benchmarks [19][20] are also vendor data.
- **Weak:** agency blogs and listicles [16][17][18][21][32][43][44][52][53] are opinion. Voctiv's "50,000 reviews" analysis [8] gives no method. Trustpilot pages [6][7] are self-selected reviews of two franchise brands.
- Single-source or weak items are flagged **(weak)** or **(single source)**.

## 1. Summary: top 10 takeaways

1. Reviews are the first filter: 68% require 4+ stars (55% in 2025), 47% skip businesses with fewer than 20 reviews, and 74% want reviews from the last 3 months [2].
2. The website is step two: 54% visit it after reading positive reviews, up from 32% in 2019 [2].
3. Leads arrive mostly by phone. Plumbing searchers are among the most likely to call [19]. Agencies put calls at 75-85% of conversions **(weak)** [21].
4. Only 52% of home-services calls reach a person, and 55% of answered calls never ask for the booking [20]. The site needs booking and callback fallbacks.
5. Price surprise is the top complaint theme. 97% say speed and transparent pricing affect who they hire (one combined figure) [5], and 43% exceeded their estimate [14].
6. Customers check qualifications first [1][13]. In California and Texas, putting the licence number in advertising is a legal requirement [60][61].
7. Real photos of the team, trucks and jobs beat stock [16][17][24]. 58% are reassured by a tech's name and photo [5].
8. About half of US traffic is mobile [22]. Target LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at p75 [23].
9. Split the emergency and planned paths. 80% factor in online booking [5][17][52].
10. Avoid the visible failures common on real plumber sites: broken review widgets, outage banners, staging URLs, typos, stacked CTAs and pop-ups [26][36-42].

## 2. What customers like about plumbing businesses

- **Qualified and trustworthy people.** WaterSafe surveyed 2,000 UK homeowners on their top 3 qualities: qualified 83%, trustworthy 79%, water-safety knowledge 43%, punctuality almost a quarter, neat/tidy 15%, friendly 14% [1]. The year is not stated and the data is likely dated **(single source)**. US homeowners hire for expertise (61%), work quality (54%) and guaranteed workmanship (43%) [13].
- **Techs who explain and clean up.** Praise in reviews names individual techs: "within the hour", "took the time to explain what he was seeing", "cleaned up after the day was done everyday" [6]. "Within the hour" also appears in a 1-star review, so speed does not save a bad price experience **(anecdotal, one brand)**.
- **Proof of past work.** 92% are influenced by visuals of past work (alt text only). 68% expect photo or video proof, and 28% call it nice to have [5]. 92% find photos useful, and over three-quarters watch video [3].
- **Knowing who is coming.** 58% are reassured by a tech photo and ID, and 59% expect text updates (alt text) [5].
- **Options, not a hard sell.** 62% chose repair over replacement (up from 51%). 41% said the pro recommended products while they made the final call [13].
- **Payment flexibility.** 55% expect payment plans [5]. In Sept 2023 data (n=1,000), 59% could not afford a repair now, 31% had $1,000 or less, and the average emergency repair was about $2,000 [59].
- **Premium and loyalty.** 72% would pay more for better service, 73% would refer and 68% would rehire [5]. 31% of jobs come from prior experience with the pro and 31% from referrals [13].
- **Owners who reply to reviews.** 80% are likely to use a business that replies to all reviews, and 89% expect a response [2].

## 3. What customers dislike

- **Surprise prices and fees.** Overcharging and hidden fees rank #1 in Voctiv's analysis **(weak: no method, vendor-run)** [8]. 77% are frustrated by hidden costs, which the survey calls "deal-breakers" [5]. 43% exceeded their estimate, and a third of those spent 30%+ more [14]. Review examples: "$50 in parts and $540", "$40 for the part and $460 for labor", "over $850 due to evening call" [7], "$583 for 30 min", and $1,800 plus a 3% card fee [6].
- **Repairs that fail.** Workmanship ranks #2 [8]. "Service or Repair Issues" dominated sampled BBB profiles, ahead of billing [15] **(categories from search snippets only)**. One customer was charged $233 for a leak that was never found [7].
- **Unanswered calls.** Communication and slow response rank #3 [8]. Among homeowners who struggled to hire, 14% blame lack of response and 13% communication [13]. Voctiv's claims that 30-40% of calls are missed and 80% hang up on voicemail are **weak and unsourced** [8]. Housecall Pro's line that frustration is "communication, not quality" has no figure behind it and conflicts with [8][15].
- **No-shows and lateness.** 35% are frustrated by late arrivals [5], and no-shows rank #4 [8].
- **Upselling and scare tactics, often aimed at the elderly.** Reviews mention a "100 year old woman" charged $6,200 and an "elderly couple" [6]. A ~$10,000 sewer "collapse" was cleared by another plumber "in less than 10 minutes" [7]. Today's Homeowner reports pressure on "the elderly, newly arrived immigrants" [9].
- **Bad calls.** 38% stop using a business after a bad call. The top annoyances are rude staff 59%, holds 58%, transfers 54% and repeating information 46% (2022 data) [19].
- **Templated or missing review replies.** 50% are put off by templated replies, and 42% are unlikely to use a business that never replies [2]. Mr. Rooter's Trustpilot page shows 2.3 stars, 62% 1-star and no replies to negative reviews [6]. Roto-Rooter's shows 1.8 stars, 81% 1-star, unclaimed [7].

Hypothesis, not supported: that a disclosed, credited call-out fee is accepted. No source shows it [11].

## 4. How customers choose and what earns trust

**Discovery path.** 97% read reviews, and 41% always do (up from 29%). People use six review sites on average. Google's share fell from 83% to 71%, AI tools rose from 6% to 45% and Apple Maps from 14% to 27%. 82% read AI summaries, and 23% would rely on the summary alone [2]. After reading reviews, 66% research further and 34% book; one chart says 68% [2]. People without a referral turn to search and reviews first [13]. Owner-reported data says customers choose on price 62%, reviews 51% and response speed 25%. On timing, 28% expect an immediate reply, 55%+ within an hour and 70%+ the same day [46] **(owner-reported)**.

**Review thresholds** [2][4]:

- Ratings: 68% need 4+ stars, 31% need 4.5+ (17% in 2025) and 10% accept only 5 stars.
- Volume: 47% reject businesses with fewer than 20 reviews, and 9% would accept 5 or fewer.
- Recency: 74% want reviews from the last 3 months, and 32% from the last 2 weeks.
- Replies: 81% expect a reply within a week. Replying to all reviews wins 80%, only to positives 45%, only to negatives 47%.
- Fakes: named reviewers raise trust for 48%, and 40% suspect reviews that sound AI-written [4]. Trust in reviews fell from 79% in 2020 to 42% in 2025 [3].

**Customer checklists from regulators:**

- FTC: check licence and insurance, get three written estimates, sign a written contract first, and avoid cash or wire payments [54].
- NY AG: a written contract is required over $500. Licensing is required in NYC, Suffolk, Nassau, Westchester, Putnam, Rockland and Buffalo. Never pay a cash deposit before the contract or the full price upfront [55].
- BBB red flags: cash only, high upfront payment, handshake deals, mid-job "found" problems, and contractors who contact you first [56].
- Today's Homeowner: ask for the licence number and proof of insurance [9]. Its uncited claim of a "10% upfront cap" is likely California-specific; do not repeat it.
- A competitor's red-flag list: no fixed written price, missing licence or insurance, vague clauses, "equal substitution of materials", unclear scope and a weak warranty [57] **(competitor source)**.

**Badges.** Google replaced its Local Services badges with one "Google Verified" badge on Oct 20 2025. The Money Back Guarantee covers only bookings made before Dec 7 2025 [34][50]. Screening can cover owner and field-worker background checks, company civil-litigation history, insurance and state licence validation [49]. No consumer data shows how much customers weigh the badge.

**Law:**

- California: the licence number must appear in all advertising, including electronic [60]. Advertised prices must include mandatory fees (SB 478, from July 1 2024) [62].
- Texas: every ad must show the RMP licence number. Franchisor internet ads may say the number is available on request [61].
- FTC rule (Aug 2024): bans fake or AI-written reviews, sentiment-conditioned incentives, suppressing reviews, and presenting a filtered set as all reviews [33].

## 5. What makes a plumbing website good

**Calls first.**

- Put a `tel:` link in international format (+1-...) on every page. Chrome on Android detects numbers but does not style them [35].
- Use a sticky bottom bar with only Call and Book [17]. Agencies call sticky click-to-call critical [18], but no measured lift exists **(weak)** [21].
- Emergency pages should lead with click-to-call; info pages can lead with a form [16][52].
- About 40% of callers from search buy (Google, no year) [19], and 45% of answered leads convert [20].

**Trust in the first screen.**

- Show rating, review count and a testimonial in the first viewport [17]. Brothers leads with 9,095 reviews and a red phone button; Soderlin shows 4.7 from 559 reviews [43].
- Pull reviews by API, because "Screenshot images are easy to alter" [16].
- Show the licence number [16], insurance and Google rating above the fold [52].
- Use original photos of trucks and staff [16]. Photos of real people draw attention, while decorative photos are ignored as "pure filler" [24]. AI hero images did not lower 10-second trust versus stock (n=77), but images people suspected were AI lowered ratings [25].
- Use before/after mini case studies, and send booking confirmations with the tech's photo and arrival window [17].

**Pricing and booking.**

- 93% say instant estimates influence who they hire (alt text) [5]. Price ranges are recommended without test data [52][53]. Examples: Abacus shows "$2,299 installed" and "as low as $36.33 a month" [43]; Roscoe Brown lists its costs [44].
- 80% factor in online booking [5]. Online scheduling and photo upload appear on several examples [32].
- Booking form fields: service, address, date/time, contact [17]. Baymard found an average of 11.3 fields where 8 were needed. Field count matters more than step count [28].
- Add a ZIP/postcode checker [17] and show financing next to prices [43].

**Content.**

- Specific local copy works, such as Erik Nelson's 11-person shop and 16 years, or Christopher's "Since 1959" [43] **(opinion)**.
- Of home-service sites, 74% lack an FAQ, 65% hours and 43% clear service areas [45][46]. This is home services overall, with no sample size.
- On 10 large-brand sites, users found the right location only 63% of the time [48] **(2001, not home services)**.
- State a "repair first" approach or present options [13].

**Speed and mobile.** US traffic in Sep 2026: mobile 49.1%, desktop 48.47%, tablet 2.42% [22]. Core Web Vitals good thresholds are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at p75 [23]. Plumber sites reportedly load in 8.6s on mobile **(weak)** [21]. 53% abandon a mobile page that takes over 3s **(2016)** [47].

**Accessibility.** WCAG 2.2 AA requires targets of at least 24x24px; aim for 44x44px (AAA 2.5.5) on the call button [31][52]. 95.9% of home pages fail, with contrast failures on 83.9%, missing alt text on 53.1%, unlabeled form fields on 51% and empty buttons on 30.6% [30].

## 6. What makes one bad

- **Hidden or broken phone numbers.** Nearly 1 in 4 sites in a 47-site audit lacked a prominent phone, and 30% had no CTA above the fold [21]. Roscoe Brown uses 4+ `tel:` formats (`tel:%20615-893-6972`, `tel:\(615\)%20203-3874`), and its Murfreesboro page shows a Nashville number [40].
- **Pricing claims with no prices.** Benjamin Franklin, Mr. Rooter, Pimlico and Roto-Rooter all claim upfront or transparent pricing but show no job prices on the homepage. Pimlico does link a rates page [36-39].
- **Stock photos**, called "the single biggest trust-killer" [17] **(opinion)**. Buried reviews "might as well not exist" [17].
- **Slow load, long forms, pop-ups and low contrast** [18]. Stacked pop-ups read as "unprofessional, desperate, and disorganized". Use one at a time, or non-modal banners [26].
- **Chatbots without a human route.** Bots fail on unexpected input. Disclose the bot, state its limits and offer the phone. Improving the site pays back more than adding a bot [27].
- **Long lead forms.** Mr. Rooter requires 6 fields [37]; Soderlin uses 5 plus a captcha [43].
- **Missing emergency path.** Roto-Rooter's hero says "Trusted for Over 90 Years" [39]. Abacus has no emergency button, and Brothers' service list is "a checklist rather than a fork" [43].
- **Doorway city pages**, which break Google spam policy. City-name blocks count as keyword stuffing [29].
- **Outdated "Google Guaranteed" copy** [34], and filtered or incentivised testimonials [33].
- **Made-up statistics**, such as "92% want fixed upfront price, 11,000 homeowners", which has no traceable survey [51].

## 7. Real-site examples

Claims come from text or markup fetches and were not checked visually unless stated.

**Good:**

- **Benjamin Franklin:** a 4.82 (120,810 reviews) badge in the hero, a 24/7 tel line and Book Now. All numbers are `tel:` links. A sticky bar is inferred from the markup [36].
- **Brothers:** a reviews-plus-phone hero and real staff with the van [43].
- **Reliant:** a real tech at a real fixture [43].
- **Abacus:** price and monthly payment in view [43].
- **Erik Nelson and Christopher's:** honest local copy [43].
- **Mr. Rooter:** reviews name techs (Sergey, Kelvin, Luis) [37].
- **Metropolitan (AU):** same rates every day, a 30-minute courtesy call, van tracking and licence numbers for VIC/SA/QLD/WA. Promises are "subject to availability" [42].
- **Pimlico (UK):** six accreditation logos and a 1-hour promise [38].
- **Quix:** a red emergency CTA [44].
- **Penguin Air:** a 3-field form and online scheduling [44][32].
- **HubSpot opinions:** Aspen Mountain (booking CTAs, photo upload), Black Diamond (scrolling reviews), Superior (embedded reviews) [32].
- **waukeganplumberpros.com** is Claremont's own demo, not an independent example [17].

**Bad:**

- **Roto-Rooter:** "Loading customer reviews..." left on the page, a "Plumbers Wanted!" banner, "MORE THAN A GUARANTEE" with no terms, and no emergency message in the hero [39].
- **Mr. Rooter:** a 0/5 widget above 5-star reviews, 7+ "Book Online" buttons, Canadian CASL text, and a $75-off offer as the only price [37].
- **Superior:** "WE ARE CURRENTLY EXPERIENCING SOME PHONE ISSUES" four times next to "Answering 24/7", an empty reviews heading, "Its Too Late", "WHAT ARE CLIENTS", a "New Field:" label, "CLICK NOW TO BOOK APPOINTMENT" three times, and stray "Button" labels. It names a licensed master plumber but shows no insurance [41].
- **Roscoe Brown:** a phone-trouble banner, a "Winter Weather Emergency" bar in October, review counts of 2,094 vs 2,102, an empty "Trusted By" section, a guarantee linking to /our-people/, three different quote URLs and a Nicaraguan review locale [40].
- **Metropolitan:** a staging URL (cloudwaysapps.com), "vigorous training", leftover "Generic filters" text, a "Business for sale" block, and a wrong "Zip Pay" alt text on the humm icon [42].
- **Pimlico:** exposed honeypot text, a (c) 2024 footer and a text-only Trustpilot link [38].
- **Benjamin Franklin, Huntington NY page:** "if we're late, you don't pay!" against a footer that says "$5.00 for each minute we're late, up to 60 minutes (or $300)". It also has no licence numbers, no after-hours fee, "Ask your technician" for financing, only a national 800 number, no local owner, and "appointment hours are listed above" with none listed [58]. The homepage shows a 2024 Forbes badge over http and an empty placeid in its review link [36].

## 8. Design implications: build checklist

**Must**

1. A `tel:` number (+1 format) in every header, one consistent number per location [35][40][19].
2. A mobile sticky bar with only Call and Book [17][18].
3. Separate emergency (phone) and planned (4-field form or scheduler) paths from the first screen [17][28][52][5].
4. A live Google rating, review count and recent dated review in the first screen, pulled by API [2][16][17].
5. Licence number, insurance and accreditations shown site-wide; legally required in CA and TX [60][61][1][9].
6. Real photos of the owner, techs, trucks and jobs [16][24][17].
7. Published prices or ranges for common jobs, with call-out, after-hours and card fees stated. In CA, mandatory fees must be inside the advertised price [62][5][14][7].
8. Hours, service area or ZIP check, and a defined meaning for "24/7" [45][46][17].
9. Core Web Vitals passing on mobile at p75 [23][22].
10. WCAG 2.2 AA compliance, with a 44x44px call button [30][31].
11. No fake, filtered or incentivised reviews, and a link to the review source [33][2].
12. Launch QA: no staging links, placeholders, stale banners, old years or badges, or mismatched review counts [39-42][34].

**Should**

13. A written guarantee with terms on the page [57][36][13].
14. Technician profiles, reused in booking confirmations [5][17].
15. Before/after case studies with cost ranges [5][17].
16. Financing next to prices, with a monthly figure [5][59][43].
17. A "how we quote" section: written quote first, repair options, no cash-only, no full upfront payment [54][55][56][13].
18. A missed-call fallback: callback, text or after-hours booking [20][8].
19. An FAQ covering fees, arrival windows, warranty and payment [45][46].
20. Unique service pages, and city pages only where the content differs [29].
21. Reply to every review within a week, without templates. This is an operations process the site depends on [2].

**Could**

22. An instant estimate or price calculator [5].
23. Text updates or van tracking, if the job software supports it [5][42].
24. A team or job video [3].
25. Plain structured content that AI tools can summarise, since 45% now use AI for local recommendations [2] **(no direct evidence on what AI tools pick up)**.
26. A chatbot only if it is disclosed and has a phone escape; skip it if the phone is reliably answered [27].
27. A "Google Verified" badge if the business runs Local Services Ads [34][49].

Avoid: stacked or entry pop-ups [26], repeated "CLICK NOW" CTAs [41] and hard-sell replacement copy [13][7].

## 9. Open questions for the business owner

1. Which state or country, and which cities or ZIPs, do you serve? This decides the licence and fee-disclosure rules.
2. What is your licence number, who is the responsible master plumber, and what insurance or bonding do you carry?
3. Is 24/7 emergency service real? Who answers after hours, and what is the arrival time?
4. What share of calls are answered live today? Do you use call tracking or an answering service?
5. Do you charge call-out, trip, diagnostic, after-hours or card fees? Are they credited against the job?
6. Can you publish prices or ranges for your top 10 jobs? Do you charge flat-rate or time and materials?
7. What are your warranty terms on labour and parts?
8. Do you offer financing? Which provider, and what is the minimum job size?
9. Which job software do you use (Housecall Pro, Jobber, ServiceTitan)? Does it support online booking, text updates or tech profiles?
10. Where are your reviews, what are the counts and ratings, and who replies to them?
11. Can we photograph the team, trucks and jobs, and get customer consent for before/after shots?
12. Which techs will be named and pictured on the site?
13. Which jobs are most profitable, and which do you want fewer of?
14. Residential, commercial or both? What specialities?
15. Who are your local competitors, and what do customers say you do better?
16. Are you independent or a franchise, and are there brand rules?
17. Do you run Google Local Services Ads or other paid channels the site must support?

## 10. Sources

1. WaterSafe, homeowner plumber survey, UK, year not stated. https://www.watersafe.org.uk/news/latest_news/watersafe-survey-homeowners-look-for-plumber/
2. BrightLocal, Local Consumer Review Survey, Feb 2026. https://www.brightlocal.com/research/local-consumer-review-survey/
3. BrightLocal, Local Consumer Review Survey, Jan 2025. https://www.brightlocal.com/research/local-consumer-review-survey-2025/
4. BrightLocal, Local Consumer Review Survey, Mar 2024. https://www.brightlocal.com/research/local-consumer-review-survey-2024/
5. Housecall Pro, homeowner survey, Oct 2025. https://www.housecallpro.com/resources/home-service-customer-service-report-trends-statistics/
6. Trustpilot, Mr. Rooter, accessed 2026. https://uk.trustpilot.com/review/mrrooter.com
7. Trustpilot, Roto-Rooter, accessed 2026. https://www.trustpilot.com/review/rotorooter.com
8. Voctiv, top 10 complaints about plumbers, c. 2025. https://voctiv.com/top-10-customer-complaints-about-plumbers/
9. Today's Homeowner, plumbing scams, Apr 2024. https://todayshomeowner.com/plumbing/guides/plumbing-scams/
10. House Digest, contractor complaints, Sept 2026. https://www.housedigest.com/2266940/common-customer-complaints-about-contractors/
11. EmerGenie, plumber complaints, Sept 2021. https://www.emergenie.co.uk/most-common-customer-complaints-for-plumbers/
12. BDR, plumbing industry trends, Sept 2026. https://www.bdrco.com/blog/plumbing-industry-trends/
13. Angi/HIRI, Q1 2026 tracker, 2026. https://intercom.help/angi/en/articles/15972206-the-backlog-boom-73-of-homeowners-have-projects-waiting
14. Angi, 2026 State of Home Spending Pulse, Jul 2026. https://www.angi.com/press/angis-2026-state-of-home-spending-pulse-report
15. BBB, Nussbaumer Plumbing complaints, accessed 2026. https://www.bbb.org/us/pa/freeport/profile/plumber/nussbaumer-plumbing-0141-71025528/complaints
16. Plumbing Webmasters, CRO, undated. https://www.plumbingwebmasters.com/conversion-rate-optimization/
17. Claremont Software, best plumber websites, 2026. https://claremontsoftware.com/blog/best-plumber-websites/
18. plumbingseo.agency, mobile test, 2026. https://plumbingseo.agency/blog/why-most-plumbing-websites-fail-mobile-test
19. Invoca, home services marketing stats, Mar 2025. https://www.invoca.com/blog/home-services-marketing-stats
20. Invoca, Home Services Lead Conversion Benchmarks, 2026. https://www.invoca.com/reports/the-invoca-home-services-lead-conversion-benchmarks-report-2026
21. Webtonic, plumbing landing page statistics, Jul 2026. https://www.webtonic.io/blog/plumbing-landing-page-statistics
22. Statcounter, US platform share, Sep 2026. https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/united-states-of-america
23. Google web.dev, Web Vitals. https://web.dev/articles/vitals
24. Nielsen Norman Group, photos as web content, 2010 (reviewed 2026). https://www.nngroup.com/articles/photos-as-web-content/
25. Nielsen Norman Group, AI-generated images, Aug 2026. https://www.nngroup.com/articles/ai-generated-images/
26. Nielsen Norman Group, popups, Jun 2019. https://www.nngroup.com/articles/popups/
27. Nielsen Norman Group, chatbots, Nov 2018. https://www.nngroup.com/articles/chatbots/
28. Baymard Institute, checkout form fields, Jun 2024. https://baymard.com/blog/checkout-flow-average-form-fields
29. Google Search Central, spam policies. https://developers.google.com/search/docs/essentials/spam-policies
30. WebAIM, The WebAIM Million, 2026. https://webaim.org/projects/million/
31. W3C WAI, SC 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
32. HubSpot, plumbing websites, Jul 2025. https://blog.hubspot.com/website/plumbing-websites
33. FTC, final rule banning fake reviews, Aug 2024. https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials
34. Search Engine Roundtable, Google Verified badge, Oct 2025. https://www.seroundtable.com/google-verified-local-service-ads-badge-39975.html
35. Google web.dev, click to call, 2014. https://web.dev/articles/click-to-call
36. Benjamin Franklin Plumbing, homepage, accessed Oct 2026. https://www.benjaminfranklinplumbing.com/
37. Mr. Rooter, homepage, accessed Oct 2026. https://www.mrrooter.com/
38. Pimlico Plumbers, homepage, accessed Oct 2026. https://www.pimlicoplumbers.com/
39. Roto-Rooter, homepage, accessed Oct 2026. https://www.rotorooter.com/
40. Roscoe Brown, homepage, accessed Oct 2026. https://www.roscoebrown.com/
41. Superior Plumbing, homepage, accessed Oct 2026. https://www.superiorplumbing.com/
42. Metropolitan Plumbing, homepage, accessed Oct 2026. https://www.metropolitanplumbing.com.au/
43. Skill Mammoth, plumber website design, May 2026 (updated Oct 2026). https://skillmammoth.com/blog/plumber-website-design
44. WebFX, plumber website examples, undated. https://www.webfx.com/blog/home-services/plumber-website-examples/
45. Jobber Academy, plumbing industry statistics, 2026. https://www.getjobber.com/academy/plumbing/plumbing-industry-statistics/
46. Jobber, 2026 Home Service Trends Report, Dec 2025 survey. https://www.getjobber.com/home-service-trends-report/
47. Marketing Dive, mobile abandonment, Sept 2016. https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/
48. Nielsen Norman Group, finding physical locations, 2001. https://www.nngroup.com/articles/helping-users-find-physical-locations/
49. Google Local Services Help, screening (6226575). https://support.google.com/localservices/answer/6226575?hl=en
50. Google Local Services Help, badge changes (7549288), 2025. https://support.google.com/localservices/answer/7549288
51. Service Fusion, flat rate vs time and materials, undated. https://servicefusion.com/blog/flat-rate-or-time-materials-which-pricing-should-you-use
52. Clicks Geek, CRO for plumbers, Apr 2026. https://clicksgeek.com/conversion-rate-optimization-for-plumbers/
53. Simpalm, plumber website design guide, Aug 2026. https://www.simpalm.com/blog/plumber-website-design-guide
54. FTC, home repair tear sheet, 2022. https://consumer.ftc.gov/system/files/consumer_ftc_gov/pdf/976A-PIO-HomeRepair-TearSheet-2022-508.pdf
55. NY Attorney General, contractors and home maintenance. https://www.ag.ny.gov/consumer-frauds/hiring-a-moving-company
56. BBB, home improvement scams, Feb 2025 (orig. 2018). https://www.bbb.org/article/news-releases/16924-bbb-tip-home-improvement-scams
57. Mother Modern Plumbing, quote red flags, Aug 2026. https://www.callmother.com/blogs/is-my-plumbing-quote-fair-6-red-flags-to-avoid
58. Benjamin Franklin Plumbing, Huntington NY page, accessed Oct 2026. https://www.benjaminfranklinplumbing.com/areas-we-service/huntington-ny/
59. Today's Homeowner, home repair survey, data Sept 2023. https://todayshomeowner.com/general/guides/home-repair-survey/
60. California CSLB, online marketplace fast facts. https://www.cslb.ca.gov/resources/industrybulletins/online_marketplace_fast_facts.pdf
61. Texas 22 TAC 367.10 (Cornell LII). https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-367-10
62. California Attorney General, hidden fees (SB 478), 2024. https://oag.ca.gov/hiddenfees
## 11. Owner answers (2026-10-05)

| # | Question | Answer | Site default until confirmed |
|---|---|---|---|
| 1 | Location | Virginia, Hampton Roads "7 Cities": Chesapeake, Hampton, Newport News, Norfolk, Portsmouth, Suffolk, Virginia Beach | Service-area list and ZIP check for the 7 cities |
| 2 | Licence and insurance | One-person business; owner is a master plumber. Numbers to come | Licence number shown prominently site-wide (owner decision; covers any Virginia ad rule); insurance alongside. Numbers marked placeholder |
| 3 | 24/7 emergency | To come | Ideal: emergency path on first screen; hours and response time as placeholders |
| 4 | Call answering | To come | Ideal: tap-to-call plus callback request and online booking as fallback |
| 5 | Fees | To come | Ideal: every fee listed on a pricing page; values as placeholders |
| 6 | Published prices | To come | Ideal: price ranges for common jobs; values as placeholders |
| 7 | Warranty | To come | Ideal: written guarantee section; terms as placeholders |
| 8 | Financing | No | Leave out |
| 9 | Job software | Custom, built by us | Booking, confirmations and updates are ours to design |
| 10 | Reviews | To come | Ideal: live rating, count and recent dated reviews; placeholder source |
| 11 | Photos | To come | Ideal: real team, van and job photos; placeholder slots |
| 12 | Named techs | To come | Owner is the technician: one named profile |
| 13 | Profitable jobs | N/A | |
| 14 | Residential or commercial | Both | Two audience paths |
| 15 | Competitors | N/A | |
| 16 | Independent or franchise | Independent | Local, owner-run positioning; no brand rules |
| 17 | Paid channels | Not yet | No Local Services Ads badge |

Placeholders for 3-7 and 10-12 are claims about the business. Each must be confirmed or removed before launch: an unconfirmed "24/7", warranty or price on a live site is a false-advertising risk.

Scope (2026-10-05): the first build is a prototype for the owner to review. It gathers his answers to the open questions above and his feedback on the design. It is not a public launch, so ideal-case placeholder content is fine at this stage.
