// The stamped valve tags hung in the header of /pricing and the service pages (ValveTagHero.astro).
// A valve tag carries a stamped mark and is fixed to the exact valve or line it identifies; here
// each tag names one thing further down the page, carries its value, and links to it, and the same
// letter is stamped on that thing (ValveStamp.astro). Values are read from facts.ts and services.ts
// in this one place: the tag and its target both render from the same fact, so they cannot drift.
// Letters, not numbers: on /pricing the numbers 1 to 4 belong to the steps of a job (and the parts
// under the sink carry their names), so a header tag never repeats one of them.
import { facts, type FactKey } from "../data/facts";
import { services, type Service } from "../data/services";

export type ValveTag = { mark: string; id: string; label: string; k: FactKey; value: string };

// "$150 to $275" -> 150.
const low = (range: string) => Number(range.replace(/^\$/, "").split(" ")[0].replace(/,/g, ""));
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
// "$150 extra" -> "+$150"; a value with no dollar amount stays as it is.
const extra = (v: string) => { const m = v.match(/\$[\d,]+/); return m ? `+${m[0]}` : v; };
// "1-year labor warranty" -> "1 year"; a value in another form stays as it is.
const years = (v: string) => { const m = v.match(/^(\d+)-year\b/); return m ? `${m[1]} year${m[1] === "1" ? "" : "s"}` : v; };

const marks = "ABCDEFGH";

// The price row with the lowest price in services.ts: the "Typical prices from" tag names it and
// lands on that row. On a tie the first row in services.ts order wins.
export const lowestPrice = services
  .flatMap((s) => s.prices.map((p, i) => ({ slug: s.slug, i, low: low(p.range) })))
  .reduce((a, b) => (b.low < a.low ? b : a));

export const pricingTags: ValveTag[] = [
  { id: "tag-callout", label: "Call-out", k: "calloutFee", value: facts.calloutFee.value },
  { id: "tag-after-hours", label: "After hours", k: "afterHoursFee", value: extra(facts.afterHoursFee.value) },
  { id: "tag-typical", label: "Typical prices", k: "priceRanges", value: `from ${money(lowestPrice.low)}` },
  { id: "tag-guarantee", label: "Labor guarantee", k: "laborWarranty", value: years(facts.laborWarranty.value) },
].map((t, i) => ({ ...t, mark: marks[i] }) as ValveTag);

export const serviceTags = (s: Service): ValveTag[] => [
  ...s.prices.map((p, i) => ({ id: `tag-price-${i}`, label: p.job, k: "priceRanges" as FactKey, value: p.range })),
  { id: "tag-callout", label: "Call-out", k: "calloutFee" as FactKey, value: facts.calloutFee.value },
].map((t, i) => ({ ...t, mark: marks[i] }));

// The letter stamped on the thing a tag identifies.
export const markOf = (tags: ValveTag[], id: string) => {
  const t = tags.find((x) => x.id === id);
  if (!t) throw new Error(`valve-tags: no tag with id ${id}`);
  return t.mark;
};
