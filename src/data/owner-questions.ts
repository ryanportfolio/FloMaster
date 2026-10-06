// Antonio's checklist (the hidden admin page, src/pages/antonio-1q79h4to.astro).
// Same content and grouping as docs/owner-questions.md, built from the data files:
// facts.ts (code, label, value, pages), services.ts (price ranges), area.ts (ZIPs).
// Only the short wording is written here: the user asked for terse "caveman" copy on
// this page, so each fact gets a short ask instead of its full question. Values,
// prices, ZIPs and phone numbers always come from the data files, never retyped.
// Part 2 (open questions) and Part 3 (photo shot list) live only here.
//
// Item ids are the contract with api/answers.js: every id built below must be listed
// in api/_items.js with the same kind, or the build fails (checked in the page).
import { facts, photoFacts, workingHours, type Fact, type FactKey } from "./facts";
import { services } from "./services";
import { cities, zips, sometimes } from "./area";
import { rangeLabel } from "../components/book/schedule";

export type Kind = "fact" | "shot" | "question";
type Base = { id: string; kind: Kind };
export type FactItem = Base & {
  kind: "fact";
  code: string;
  label: string;
  // What the site shows now: one value, or a list of lines.
  now: string | null;
  lines: string[];
  // Extra lines under the value (price ranges' top-of-range note, ZIP notes).
  sub?: string;
  ask: string;
  pages: string[];
};
export type QuestionItem = Base & { kind: "question"; n: number; title: string; body: string[]; options: string[] };
export type ShotItem = Base & { kind: "shot"; n: number; title: string; codes: string; body: string; where?: string };
export type Item = FactItem | QuestionItem | ShotItem;
export type Group = { id: string; title: string; intro?: string[]; outro?: string[]; items: Item[] };
export type Part = { id: string; title: string; intro: string[]; groups: Group[] };

// ---- helpers ----
const clock = (h: number) => `${h % 12 || 12} ${h < 12 ? "a.m." : "p.m."}`;
const windowLabels = (open: number, close: number) => {
  const out: string[] = [];
  for (let s = open; s + 2 <= close; s += 2) out.push(rangeLabel(s, s + 2));
  return out;
};
const weekdayWindows = windowLabels(workingHours.weekday[0], workingHours.weekday[1]);
const saturdayWindows = windowLabels(workingHours.saturday[0], workingHours.saturday[1]);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---- Part 1: short asks, one per fact (no codes or jargon in the wording) ----
const asks: Partial<Record<FactKey, string>> = {
  contractorLicense: "Virginia contractor license? Class? Number?",
  insurance: "Who insures you? How much liability cover?",
  bonded: "Bonded? How much?",
  yearsInTrade: "Years as plumber, all of them, before FloMasters too?",
  email: "Email for customers?",
  calloutFee: "Trip fee? How much?",
  calloutCredited: "Trip fee taken off job price when customer says go?",
  diagnosticFee: "Separate fee to find problem?",
  afterHoursFee: "Extra for evenings, weekends, holidays? How much?",
  afterHoursWhen: "Which hours count as after-hours?",
  cancellation: "Cancel rules?",
  pricingModel: "Flat price per job, or time plus parts?",
  permits: "How you charge for permits?",
  serviceList: "Which jobs get own page? Which you want less of?",
  hours: "Normal work hours?",
  emergency247: "Emergency calls 24 hours, 7 days? If not, what hours?",
  afterHoursAnswer: "After hours, who picks up: you or answering service?",
  emergencyArrival: "Emergency in the 7 cities: how fast you get there, usually?",
  valveTypes: "Which shut-off valves most in Hampton Roads homes? This advice right?",
  callback: "Customer leaves number. How fast you call back?",
  callbackAfterHours: `Number left after hours. Call back when work starts (${clock(workingHours.weekday[0])} weekdays, ${clock(workingHours.saturday[0])} Saturday)?`,
  windows: "Which arrival windows you can promise?",
  bookingConfirm: "Online booking: confirmed right away, or you text to confirm? How fast?",
  textConsent: "Fine print for booking texts. Settle with texting company when booking system built",
  laborWarranty: "How long you guarantee labor?",
  warrantyExclusions: "Guarantee doesn't cover what? Full terms printed on invoices?",
  partsWarranty: "Parts warranty? Who handles claims?",
  workPromises: "Promise all of these, every job? You pick up phone, you do work, show old part, drop cloths, clean-up, test before leaving",
  quoting: "Promise every line? Written price first, repair first, no cash-only, no full pay up front",
  startsOnYes: "No work till customer says yes to written price? Customer says no: owes only trip fee?",
  commercialOffer: "What you offer businesses? Work around open hours, insurance certificate, invoice terms, backflow testing?",
  payment: "Which payments you take? When?",
  cardFee: "Extra fee for card?",
  reviewSource: "Where your reviews live? Google, Yelp, Nextdoor, Angi?",
  rating: "Star rating now?",
  reviewCount: "How many reviews?",
  reviewPolicy: "Show all reviews in full, bad ones too? Best: yes, pulled live from review site",
  reviewReplies: "Who answers reviews?",
  sampleJob: "One real job to show: what broke, how you found it, what you changed, how you tested, written price. Sink or water heater best",
};
const photoAsks: Record<keyof typeof photoFacts, string> = {
  portrait: "Portrait: you, work clothes, outside, morning light. OK?",
  hero: "You beside your van, home street. OK?",
  jobs: "Real jobs on camera: drain, water heater, repipe, fixture, sewer camera, business. OK?",
  beforeAfter: "One real job, 4 shots, same spot: problem, cause up close, repair, final test. Customer OK to show?",
};

// Facts whose value is a list on the page rather than one string in facts.ts. These
// lines are copied from the components named, so keep them in step with those files.
const listed: Partial<Record<FactKey, string[]>> = {
  serviceList: services.map((s) => s.title),
  windows: [`Weekdays: ${weekdayWindows.join(" · ")}`, `Saturdays: ${saturdayWindows.join(" · ")}`],
  // src/components/AboutRows.astro (steps) plus the labor warranty line
  workPromises: [
    "I find the cause before I name a price",
    "You get repair and replacement prices side by side, and you choose",
    "I show you the old part and explain what failed",
    "Drop cloths down, mess cleaned up, everything tested before I leave",
    `${facts.laborWarranty.value} on every job`,
  ],
  // src/components/ValveTagQuote.astro ("How I quote")
  quoting: [
    "Repair first. I only recommend replacing something when a repair won't last.",
    "No surprises mid-job. If I find something new, I stop and show you before the price changes.",
    `Pay when it's done. ${facts.payment.value}. No cash-only jobs, no full payment up front.`,
  ],
  // src/pages/commercial.astro
  commercialOffer: [
    "Scheduled around you: early mornings, after close or weekends, so customers and staff aren't disturbed.",
    "Paperwork: a certificate of insurance on request, a written quote before work, and an itemized invoice.",
    "One contact: you deal with me directly, every time.",
  ],
};

const factItem = (key: FactKey): FactItem => {
  const f: Fact = facts[key];
  const lines = listed[key] ?? [];
  return { id: `f.${key}`, kind: "fact", code: f.code, label: f.label, now: lines.length ? null : f.value, lines, ask: asks[key] ?? f.question, pages: f.pages };
};
const photoItem = (key: keyof typeof photoFacts): FactItem => {
  const f = photoFacts[key];
  return { id: `ph.${key}`, kind: "fact", code: f.code, label: f.label, now: f.value, lines: [], ask: photoAsks[key], pages: f.pages };
};
const priceItems = (): FactItem[] =>
  services.map((s) => ({
    id: `price.${s.slug}`,
    kind: "fact",
    code: facts.priceRanges.code,
    label: s.title,
    now: null,
    lines: s.prices.map((p) => `${p.job}: ${p.range}`),
    sub: `Top of range: ${s.topOfRange}`,
    ask: "Prices right? Change any you won't stand behind",
    pages: facts.priceRanges.pages,
  }));
const zipItems = (): FactItem[] =>
  cities.map((city) => {
    const list = Object.keys(zips).filter((z) => zips[z] === city);
    const edge = list.filter((z) => sometimes.includes(z));
    return {
      id: `zip.${slug(city)}`,
      kind: "fact",
      code: facts.zipList.code,
      label: `${city} (${list.length})`,
      now: null,
      lines: [list.map((z) => (sometimes.includes(z) ? `${z} (call to check)` : z)).join(", ")],
      sub: edge.length ? `"Call to check" ZIPs get "Call me to check" instead of yes` : undefined,
      ask: "Cover all of these? Cross out, mark sometimes, or add",
      pages: facts.zipList.pages,
    };
  });

// ---- Part 2: open questions ----
const sat = `${clock(workingHours.saturday[0])} to ${clock(workingHours.saturday[1])}`;
const questions: Omit<QuestionItem, "id" | "kind" | "n">[] = [
  {
    title: "Saturday bookings and the fee",
    body: [
      `Your hours: Saturday ${sat}. Booking page offers Saturday windows (${saturdayWindows.join(", ")}).`,
      `Weekends count as after-hours (P14), so every Saturday visit gets the "${facts.afterHoursFee.value}" fee.`,
    ],
    options: ["Take Saturday bookings, with fee", "Take Saturday bookings, no fee", "No Saturday bookings"],
  },
  {
    title: "Which number the texts come from",
    body: [
      `Callback form says: "I'll call this number. I may text first if I'm under a sink."`,
      "Booking texts (confirm, reminder, on my way) need a sending number too. Automatic business texts: number must be registered with phone carriers. Takes time, has fees.",
    ],
    options: [`My cell, ${facts.phone.value}`, "Separate business texting number"],
  },
  {
    title: "Your logo ring as progress marker",
    body: [
      "Booking page: each of the 4 questions marked with the pipe ring from your logo. Lights up in the logo's 2 blues when answered.",
      "Confirmation page: finished ring with pipe and drop. Booking details hang off it as tags.",
    ],
    options: ["Fine", "Don't use the logo that way"],
  },
  {
    title: "Navy hull-number look",
    body: [
      "Big numbers painted like the hull numbers on Navy ships, a nod to Hampton Roads shipbuilding: your license number on About, 757 above your phone on the booking page, the ZIP check on the service area page, day and window numbers on the booking page.",
      "No page names the Navy or a ship.",
    ],
    options: ["Fine", "Rather not"],
  },
  {
    title: "What puts a price at top of its range",
    body: [
      "Each service has 1 note now, shared by its 3 jobs. Toilet repair and fixture install share 1 note, for example.",
      "Want 1 note per job instead?",
    ],
    options: ["1 note per service is fine", "1 note per job (write them under Price ranges, Part 1)"],
  },
  {
    title: "Real street on the map",
    body: [
      "Scroll story being built for the home page: zooms from a Hampton Roads map down to 1 Norfolk house, into the leak in its wall.",
      "Map shows a real Norfolk block around W 36th St (Park Place). House on it is made up.",
    ],
    options: ["Fine as it is", "Use a street from a real job (customer's OK)", "Use a made-up place"],
  },
];

// ---- Part 3: photo shot list ----
type Shot = Omit<ShotItem, "id" | "kind" | "n">;
const shotGroups: { title: string; intro?: string[]; outro?: string[]; shots: Shot[] }[] = [
  {
    title: "You and the van",
    shots: [
      { title: "Portrait", codes: "P25", body: "You, navy work shirt, chest up, outside a house, van to one side, morning light on your face. Square or upright. Face in upper middle, so a square crop, a 4:5 crop and a small circle all work.", where: "Home top (small round photo) and Meet section, About page top, booking confirmation" },
      { title: "You with the van", codes: "P26", body: "You beside your van, home street with trees, side door open, parts shelves showing. Eye level, you in the right half, street running away on the left. Cropped to 4:3.", where: "About page, beside the year FloMasters started" },
    ],
  },
  {
    title: "Job photos (P27)",
    intro: ["Each one cropped to 3:2. Keep the work in the middle two-thirds."],
    shots: [
      { title: "Drain clearing", codes: "P27", body: "You under a kitchen sink clearing a line, trap in a bucket, drop cloth down. Low, cabinet height, from beside you: open cabinet on the left, your arm and the snake coming in from the right. Home page also shows it wider (16:9): leave room above and below.", where: "Drain clearing page, Residential page, Home services list (first card)" },
      { title: "Water heater", codes: "P27", body: "You finishing a tank water heater install in a garage, expansion tank and shut-off showing. From behind your shoulder: heater on the left, open garage door and daylight on the right.", where: "Water heaters page, Residential page, Home services list" },
      { title: "Leak and pipe repair", codes: "P27", body: "You in a crawlspace fitting new copper, headlamp on, old corroded pipe beside you. Low and close, crawlspace floor level: new fitting and tool center right, old pipe front left.", where: "Leaks and pipe repair page, Residential page, Home services list" },
      { title: "Fixtures", codes: "P27", body: "You fitting a new faucet in a bathroom, old one set aside on a towel. Side-on, counter height: new faucet in the center, old one on the towel lower left, window light.", where: "Toilets, faucets and fixtures page, Residential page, Home services list" },
      { title: "Sewer camera", codes: "P27", body: "You in a back yard at a cleanout with the sewer camera, monitor turned to the camera so the pipe picture reads. Reel on the left, you kneeling in the middle, open shade.", where: "Sewer lines page, Residential page, Home services list" },
      { title: "Shut-off valve", codes: "P27", body: "Gloved hand turning a main water shut-off, close, valve right of center, some water on the floor behind, out of focus. Use the valve type you named in P39. Cropped to 4:3.", where: "Emergency page, beside the steps" },
      { title: "Business job", codes: "P27", body: "You on the drain of a stainless 3-compartment sink in a restaurant kitchen, after hours, kneeling at the sink. You on the left half, sink and pipes on the right. Needs the business owner's OK.", where: "Commercial page" },
    ],
  },
  {
    title: "The leaking sink job (P28, P40)",
    intro: [
      "Home page first screen and the repair story both use 1 sink job, shot from 1 spot.",
      "Tripod (or wedge your phone) at cabinet-floor height, facing straight into the open cabinet, both doors open, whole cabinet in frame. Leak about 40% from the left and 60% down: on a computer the left part sits behind the headline; on phones it's cropped to 4:3 or 3:2 around the leak. Don't move the camera between shots.",
    ],
    outro: [
      "See-through pipe view (step 2, and inside the lens on the first screen) is a drawing and stays labeled as one. It gets redrawn over your shot 10: no photo needed.",
      "Close-up of the cause (4th shot in P28) optional: helps whoever redraws it.",
    ],
    shots: [
      { title: "The problem, as you found it", codes: "P28, P40", body: "Leak, drip, stain. Before you touch anything.", where: "Home page top and repair story, step 1" },
      { title: "The repair", codes: "P28, P40", body: "Your gloved hands fitting the new part, old part on a towel beside it.", where: "Repair story, step 3" },
      { title: "The finished test", codes: "P28, P40", body: "New part over a dry cabinet floor, dry paper towel under it.", where: "Repair story, step 4" },
    ],
  },
  {
    title: "The scroll story (planned, not on site yet)",
    intro: [
      "Story zooms from Hampton Roads into 1 house, through its wall to a cracked copper joint, shows the repair, pulls back out to a dry wall.",
      "Map part (all of Hampton Roads down to about a dozen blocks) is drawn from OpenStreetMap, the free public map: no photos. Everything closer in is AI drawings now.",
      "From 1 real job, minimum 6 shots of 1 leak inside a wall. Each shot centered on what the next one shows. All straight on, landscape, camera's highest resolution.",
    ],
    outro: [
      "2 limits: real photos won't line up as perfectly as drawings, so the zoom fades photo to photo instead of gliding.",
      "Map zooms to the customer's real block, so the house would be findable. See question 6 in Part 2.",
    ],
    shots: [
      { title: "The house", codes: "", body: "Outside of the house, straight on, leak wall in the middle. Straight down from above (drone) matches the map best; from the street works if the story cuts from map to it." },
      { title: "The wall before", codes: "", body: "Stained wall, straight on, stain in the center." },
      { title: "The wall opened", codes: "", body: "Same spot as 14: the opening, pipe between the studs, wet stain." },
      { title: "The failed joint", codes: "", body: "Close, joint in the center, crack or drip sharp." },
      { title: "The joint repaired", codes: "", body: "Same spot and framing as 16." },
      { title: "The wall closed and dry", codes: "", body: "Same spot as 14." },
    ],
  },
];

// ---- assembled page ----
const fg = (id: string, title: string, keys: FactKey[], intro?: string[]): Group => ({ id, title, intro, items: keys.map(factItem) });

let shotN = 0;
export const parts: Part[] = [
  {
    id: "facts",
    title: "Part 1: facts",
    intro: ["Site says this now. Right: tap Yes, right. Wrong: tap Change it, type the right one."],
    groups: [
      fg("license", "License, insurance, business", ["contractorLicense", "insurance", "bonded", "yearsInTrade", "email"]),
      fg("fees", "Prices and fees", ["calloutFee", "calloutCredited", "diagnosticFee", "afterHoursFee", "afterHoursWhen", "cancellation", "pricingModel", "permits", "serviceList"]),
      { id: "prices", title: "Price ranges", intro: ["Typical prices right for your jobs? Change any range you won't stand behind.", "Top of range: what the site says puts a job at the top."], items: priceItems() },
      fg("hours", "Hours, arrival, emergencies", ["hours", "emergency247", "afterHoursAnswer", "emergencyArrival", "valveTypes", "callback", "callbackAfterHours", "windows", "bookingConfirm", "textConsent"]),
      { id: "area", title: "Service area", intro: ["ZIP list typed from memory, not checked with the Post Office."], items: zipItems() },
      fg("promises", "Promises and warranty", ["laborWarranty", "warrantyExclusions", "partsWarranty", "workPromises", "quoting", "startsOnYes", "commercialOffer"]),
      fg("payment", "Payment", ["payment", "cardFee"]),
      fg("reviews", "Reviews", ["reviewSource", "rating", "reviewCount", "reviewPolicy", "reviewReplies"], ["6 reviews on site now are samples, marked as samples. They come off before launch. Your real ones replace them."]),
      { id: "photos", title: "Photos", intro: ["Every photo on site now is AI-made. Real ones needed before launch. Shot list in Part 3."], items: [...(["portrait", "hero", "jobs", "beforeAfter"] as const).map(photoItem), factItem("sampleJob")] },
    ],
  },
  {
    id: "questions",
    title: "Part 2: open questions",
    intro: ["Came up while building. Pick one. Add a note if you want."],
    groups: [{ id: "open", title: "Open questions", items: questions.map((q, i) => ({ ...q, id: `q.${i + 1}`, kind: "question", n: i + 1 })) }],
  },
  {
    id: "shots",
    title: "Part 3: photo shot list",
    intro: [
      "Each shot replaces an AI stand-in. Landscape unless it says otherwise. Daylight or good work light.",
      "No customer faces, house numbers or license plates in frame. Job inside a customer's home or business: their OK first.",
    ],
    groups: shotGroups.map((g, gi) => ({
      id: `shots-${gi + 1}`,
      title: g.title,
      intro: g.intro,
      outro: g.outro,
      items: g.shots.map((s) => ({ ...s, id: `shot.${++shotN}`, kind: "shot", n: shotN })),
    })),
  },
];

export const allItems: Item[] = parts.flatMap((p) => p.groups.flatMap((g) => g.items));

// Facts already confirmed from the business card, shown at the top.
export const confirmedLine = [facts.name.value, facts.phone.value, `${facts.license.label} ${facts.license.value}`, `Established ${facts.established.value}`];
