// Every business fact on the site lives here. Pages read values only from this
// file. "open" facts render with a "confirm this" tag in the prototype and fail
// the public build (scripts/build-public.mjs). Codes match docs/design-brief.md
// section 7.

export type Fact = {
  code: string;
  label: string;
  value: string;
  question: string;
  status: "open" | "confirmed";
  source?: string;
  pages: string[];
};

const f = (code: string, label: string, value: string, question: string, pages: string[], status: Fact["status"] = "open", source?: string): Fact =>
  ({ code, label, value, question, pages, status, source });

const card = "Business card";

export const facts = {
  name: f("P01", "Business name", "FloMasters Plumbing and Drains", "", ["Everywhere"], "confirmed", card),
  shortName: f("P01", "Short name", "FloMasters", "", ["Everywhere"], "confirmed", card),
  established: f("P31", "Established", "2024", "", ["Footer", "About"], "confirmed", card),
  owner: f("P25", "Owner", "Antonio Spence", "", ["Everywhere"], "confirmed", card),
  ownerFirst: f("P25", "Owner first name", "Antonio", "", ["Everywhere"], "confirmed", card),
  phone: f("P03", "Phone", "(757) 277-6194", "", ["Header", "Sticky bar", "Footer"], "confirmed", card),
  phoneHref: f("P03", "Phone link", "+17572776194", "", ["Everywhere"], "confirmed", card),
  email: f("P03", "Email", "hello@example.com", "What email address should customers use?", ["Footer", "Contact"]),
  license: f("P04", "Master Plumber license", "2710081569", "", ["Header", "Footer", "About"], "confirmed", card),
  contractorLicense: f("P04", "Contractor license", "Class B contractor, license #2705-000000", "Does FloMasters hold a Virginia contractor license? Which class and number?", ["Footer", "About", "Commercial"]),
  insurance: f("P05", "Insurance", "Fully insured, $1M general liability", "Who insures you, and for how much general liability cover?", ["Trust strip", "Footer", "Commercial"]),
  bonded: f("P06", "Bonding", "Bonded", "Are you bonded? If so, for how much?", ["Trust strip", "Footer"]),
  emergency247: f("P07", "24/7 service", "24/7 emergency line", "Do you take emergency calls 24 hours a day, 7 days a week? If not, what hours?", ["Hero", "Emergency", "Footer"]),
  afterHoursAnswer: f("P08", "Who answers after hours", "You reach me directly, day or night", "Who answers the phone after hours: you, or an answering service?", ["Emergency"]),
  emergencyArrival: f("P09", "Emergency arrival time", "usually there within 60 minutes", "How fast can you usually reach an emergency in the 7 cities?", ["Emergency", "FAQ"]),
  hours: f("P10", "Working hours", "Mon to Fri 7 a.m. to 6 p.m., Sat 8 a.m. to 1 p.m.", "What are your regular working hours?", ["Footer", "Service area", "FAQ"]),
  callback: f("P11", "Callback time", "within 30 minutes during working hours", "When someone leaves their number, how fast can you call back?", ["Book", "Emergency"]),
  calloutFee: f("P12", "Call-out fee", "$89", "Do you charge a call-out or trip fee? How much?", ["Pricing", "Book", "Confirmation"]),
  calloutCredited: f("P12", "Call-out fee credited", "taken off the price if you go ahead with the job", "Is the call-out fee taken off the job price when the customer goes ahead?", ["Pricing", "Book", "Confirmation"]),
  diagnosticFee: f("P13", "Diagnostic fee", "None", "Do you charge a separate diagnostic fee?", ["Pricing"]),
  afterHoursFee: f("P14", "After-hours fee", "$150 extra", "Do you charge extra for evenings, weekends or holidays? How much?", ["Pricing", "Emergency"]),
  afterHoursWhen: f("P14", "After-hours window", "after 6 p.m., weekends and holidays", "Which hours count as after-hours?", ["Pricing", "Emergency"]),
  cancellation: f("P15", "Cancellation terms", "Free to cancel or move up to 2 hours before", "What are your cancellation terms?", ["Pricing", "Confirmation"]),
  cardFee: f("P16", "Card fee", "None", "Do you add a fee for card payments?", ["Pricing", "FAQ"]),
  priceRanges: f("P17", "Price ranges", "", "Are these typical prices right for your jobs? Change any range you would not stand behind.", ["Service pages", "Pricing", "Book"]),
  pricingModel: f("P18", "How I charge", "A flat price for the job, agreed in writing before I start. No hourly meter running.", "Do you charge a flat price per job, or time and materials?", ["Pricing"]),
  laborWarranty: f("P19", "Labor warranty", "1-year labor warranty", "How long do you guarantee your labor?", ["Pricing", "Trust strip", "Done update"]),
  warrantyExclusions: f("P19", "Warranty exclusions", "damage from freezing, misuse, or work someone else does on the same fixture after me", "What does your guarantee not cover? Are the full terms printed on your invoices?", ["Pricing"]),
  partsWarranty: f("P20", "Parts warranty", "Manufacturer's warranty on parts, and I handle the claim for you", "What warranty do parts carry, and who handles claims?", ["Pricing"]),
  reviewSource: f("P21", "Review source", "Google", "Where are your reviews (Google, Yelp, Nextdoor, Angi)?", ["Hero", "Reviews"]),
  rating: f("P22", "Rating", "4.9", "What is your current star rating?", ["Hero", "Reviews"]),
  reviewCount: f("P22", "Review count", "86", "How many reviews do you have?", ["Hero", "Reviews"]),
  reviewPolicy: f("P23", "Review policy", "Newest first, every review shown in full, good or bad, with my replies.", "Will the site show all your reviews in full, including low ratings? (Recommended: yes, pulled live from the review site.)", ["Reviews"]),
  workPromises: f("P38", "How I work", "", "Are you comfortable promising each of these on every job: you answer the phone and do the work yourself; you show the customer the old part; drop cloths down and clean-up; everything tested before you leave?", ["Home", "About"]),
  reviewReplies: f("P24", "Review replies", "I read and reply to every review myself.", "Who replies to your reviews?", ["Reviews"]),
  yearsInTrade: f("P31", "Years in the trade", "18 years", "How many years have you worked as a plumber, including before FloMasters?", ["Trust strip", "About"]),
  bookingConfirm: f("P30", "Booking confirmation", "I'll text you within an hour during working hours to confirm this time.", "Should online bookings confirm instantly, or wait for you to confirm by text? How fast can you confirm?", ["Book", "Confirmation"]),
  permits: f("P36", "Permits", "At cost, only when the city requires one, and I tell you first", "How do you charge for permits?", ["Pricing"]),
  textConsent: f("P37", "Text consent wording", "Message and data rates may apply; reply STOP to opt out.", "Consent wording for booking texts: settle it with the texting provider when the booking system is built.", ["Book"]),
  payment: f("P35", "Payment methods", "Card, check or cash, paid when the job is done", "Which payment methods do you take, and when do you take payment?", ["Pricing", "FAQ"]),
  quoting: f("P34", "Quoting promises", "", "Are you comfortable promising each line in 'How I quote' (written price first, repair options first, no cash-only, no full payment up front)?", ["Pricing", "FAQ"]),
  commercialOffer: f("P33", "Commercial offer", "", "What do you offer commercial customers (scheduling around opening hours, certificate of insurance, invoicing terms, backflow testing)?", ["Commercial"]),
  serviceList: f("P32", "Service pages", "", "Which jobs should have their own page, and which do you want fewer of?", ["Residential", "Book"]),
  windows: f("P29", "Arrival windows", "", "Which arrival windows can you commit to (for example two-hour windows, weekdays)?", ["Book"]),
  zipList: f("P32", "Service area ZIP codes", "", "Which ZIP codes do you cover fully, and which only sometimes?", ["Service area", "Book"]),
} satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

// Photo stand-ins: AI-generated, replaced by real photos before launch.
export const photoFacts = {
  portrait: f("P25", "Owner portrait", "AI-generated stand-in", "Can we take a portrait of you in work clothes, outside, in morning light?", ["Hero", "About", "Confirmation"]),
  hero: f("P26", "Owner with van", "AI-generated stand-in", "Can we photograph you beside your van on a residential street?", ["Home", "About"]),
  jobs: f("P27", "Job photos", "AI-generated stand-ins", "Can we photograph real jobs (drain, water heater, repipe, fixture, sewer camera, commercial)?", ["Service pages", "Home"]),
  beforeAfter: f("P28", "Before and after", "AI-generated stand-in", "Do you have before/after photos, and will those customers agree to them being shown?", ["Home", "Service pages"]),
};

export const allFacts: Fact[] = (() => {
  const seen = new Set<string>();
  return [...Object.values(facts), ...Object.values(photoFacts)].filter(x => {
    const k = x.code + x.label;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();

// Machine-readable version of the hours fact (P10), in Virginia time. Keep in step with facts.hours.
export const workingHours = { weekday: [7, 18], saturday: [8, 13], sunday: null as null | number[] };

export const isPublicBuild = import.meta.env.PUBLIC_BUILD === "1";
