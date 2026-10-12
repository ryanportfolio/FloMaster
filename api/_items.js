// Every item on Antonio's checklist, by id, with its kind. The API accepts answers only
// for these ids. The admin page (src/pages/antonio-1q79h4to.astro) builds its items from
// src/data/owner-questions.ts and fails the build if that list and this one differ, so a
// new or renamed item shows up as a build error instead of a rejected save.
// The leading underscore keeps Vercel from turning this file into a function.

const facts = [
  // License, insurance, business
  "contractorLicense", "insurance", "bonded", "yearsInTrade", "email",
  // Prices and fees
  "calloutFee", "calloutCredited", "diagnosticFee", "afterHoursFee", "afterHoursWhen", "cancellation", "pricingModel", "permits", "serviceList",
  // Hours, arrival, emergencies
  "hours", "emergency247", "afterHoursAnswer", "emergencyArrival", "valveTypes", "callback", "callbackAfterHours", "windows", "bookingConfirm", "textConsent",
  // Promises and warranty
  "laborWarranty", "warrantyExclusions", "partsWarranty", "workPromises", "quoting", "startsOnYes", "commercialOffer",
  // Payment
  "payment", "cardFee",
  // Reviews
  "reviewSource", "rating", "reviewCount", "reviewPolicy", "reviewReplies",
  // Photos
  "sampleJob",
].map((k) => `f.${k}`);
const photos = ["portrait", "hero", "van", "jobs", "beforeAfter"].map((k) => `ph.${k}`);
const prices = ["drains", "water-heaters", "leaks-and-pipes", "fixtures", "sewer-lines"].map((k) => `price.${k}`);
const zips = ["chesapeake", "hampton", "newport-news", "norfolk", "portsmouth", "suffolk", "virginia-beach"].map((k) => `zip.${k}`);
const questions = Array.from({ length: 6 }, (_, i) => `q.${i + 1}`);
// shot.11 and shot.12 (the sink job's repair and test, shown by the old repair story) are retired;
// the zoom story's shots keep their ids 13 to 18.
const shots = [...Array.from({ length: 10 }, (_, i) => i + 1), 13, 14, 15, 16, 17, 18].map((n) => `shot.${n}`);

// The /review page's answer boxes, one per open fact it lists, by the fact's code and label
// (src/pages/review.astro fails the build if its rows and this list differ).
const review = ["p05-insurance", "p06-bonding", "p07-24-7-service", "p08-who-answers-after-hours", "p09-emergency-arrival-time", "p10-working-hours", "p11-callback-time", "p11-callback-outside-working-hours", "p12-call-out-fee", "p12-call-out-fee-credited", "p13-diagnostic-fee", "p14-after-hours-fee", "p14-after-hours-window", "p15-cancellation-terms", "p16-card-fee", "p17-price-ranges", "p18-how-i-charge", "p19-labor-warranty", "p19-warranty-exclusions", "p20-parts-warranty", "p28-before-and-after", "p29-arrival-windows", "p30-booking-confirmation", "p31-years-in-the-trade", "p32-service-pages", "p32-service-area-zip-codes", "p33-commercial-offer", "p34-quoting-promises", "p34-nothing-starts-until-yes", "p35-payment-methods", "p36-permits"].map((k) => `rv.${k}`);

/** @type {Record<string, "fact" | "question" | "shot" | "review">} */
export const ITEMS = Object.fromEntries([
  ...[...facts, ...photos, ...prices, ...zips].map((id) => [id, "fact"]),
  ...questions.map((id) => [id, "question"]),
  ...shots.map((id) => [id, "shot"]),
  ...review.map((id) => [id, "review"]),
]);
