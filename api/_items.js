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
const photos = ["portrait", "hero", "jobs", "beforeAfter"].map((k) => `ph.${k}`);
const prices = ["drains", "water-heaters", "leaks-and-pipes", "fixtures", "sewer-lines"].map((k) => `price.${k}`);
const zips = ["chesapeake", "hampton", "newport-news", "norfolk", "portsmouth", "suffolk", "virginia-beach"].map((k) => `zip.${k}`);
const questions = Array.from({ length: 6 }, (_, i) => `q.${i + 1}`);
const shots = Array.from({ length: 18 }, (_, i) => `shot.${i + 1}`);

/** @type {Record<string, "fact" | "question" | "shot">} */
export const ITEMS = Object.fromEntries([
  ...[...facts, ...photos, ...prices, ...zips].map((id) => [id, "fact"]),
  ...questions.map((id) => [id, "question"]),
  ...shots.map((id) => [id, "shot"]),
]);
