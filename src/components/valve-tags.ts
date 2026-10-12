// The stamped valve tags hung in the header of the service pages (ValveTagHero.astro).
// A valve tag carries a stamped mark and is fixed to the exact valve or line it identifies; here
// each tag names one thing further down the page, carries its value, and links to it, and the same
// letter is stamped on that thing (ValveStamp.astro). Values are read from facts.ts and services.ts
// in this one place: the tag and its target both render from the same fact, so they cannot drift.
import { facts, type FactKey } from "../data/facts";
import type { Service } from "../data/services";

export type ValveTag = { mark: string; id: string; label: string; k: FactKey; value: string };

const marks = "ABCDEFGH";

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
