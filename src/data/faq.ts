// FAQ groups and questions for the FAQ page (components/FaqTerms.astro). Answers render in FaqAnswer.astro;
// each group's key number is worked out from its fact (FaqKey.astro), so a changed fact changes
// the large number too.
import { facts, type FactKey } from "./facts";

export type Group = {
  id: string;
  n: number;
  title: string;
  key: FactKey;
  big: string;
  unit: string;
  tag: string;
  qs: { id: string; q: string }[];
};

// "within 30 minutes during working hours" -> 30, "min"; "1-year labor warranty" -> 1, "year".
const mins = (v: string) => v.match(/(\d+)\s*minutes?/)?.[1];
const years = (v: string) => v.match(/(\d+)-year/)?.[1];

export const groups: Group[] = [
  {
    id: "fees", n: 1, title: "Fees and prices", key: "calloutFee", big: facts.calloutFee.value, unit: "", tag: "Call-out",
    qs: [
      { id: "q-callout", q: "Do you charge just to come out?" },
      { id: "q-hourly", q: "Do you charge by the hour?" },
      { id: "q-card", q: "Do you add a fee for paying by card?" },
      { id: "q-change", q: "Will the price change once you start?" },
    ],
  },
  {
    id: "booking", n: 2, title: "Booking and callbacks", key: "callback", big: mins(facts.callback.value) ?? facts.callback.value, unit: mins(facts.callback.value) ? "min" : "", tag: "Callback",
    qs: [
      { id: "q-callback", q: "I left my number. When do you call back?" },
      { id: "q-windows", q: "How do arrival windows work?" },
      { id: "q-late", q: "What if you can't make my window?" },
      { id: "q-cancel", q: "Can I cancel or move a visit?" },
    ],
  },
  {
    id: "emergencies", n: 3, title: "Emergencies", key: "emergencyArrival", big: mins(facts.emergencyArrival.value) ?? facts.emergencyArrival.value, unit: mins(facts.emergencyArrival.value) ? "min" : "", tag: "Emergency",
    qs: [
      { id: "q-night", q: "Do you really answer at night?" },
      { id: "q-afterhours", q: "What does a night or weekend visit cost?" },
      { id: "q-wait", q: "What should I do while I wait?" },
    ],
  },
  {
    id: "guarantee", n: 4, title: "Guarantee and license", key: "laborWarranty", big: years(facts.laborWarranty.value) ?? facts.laborWarranty.value, unit: years(facts.laborWarranty.value) ? (years(facts.laborWarranty.value) === "1" ? "year" : "years") : "", tag: "Labor warranty",
    qs: [
      { id: "q-fail", q: "What if the repair fails?" },
      { id: "q-exclusions", q: "What doesn't the guarantee cover?" },
      { id: "q-licensed", q: "Are you licensed and insured?" },
    ],
  },
];

export const dpor = "https://www.dpor.virginia.gov/LicenseLookup";
