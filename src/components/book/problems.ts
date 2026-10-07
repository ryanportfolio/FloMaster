// Booking question 1, in the customer's words. Each problem maps to exactly one service in
// src/data/services.ts, so the radio's value is that service's slug (?job=<slug> links keep
// working). Every price shown comes from that service's `prices` (the P17 sample ranges), picked
// by row, so a leak shows the leak repairs and not a whole-house repipe.
// The detail lines are taken from the same service's copy.
import { services, type Service } from "../../data/services";
import { facts } from "../../data/facts";

type Def = { slug: string; words: string; detail: string; rows: number[]; urgent?: string };

const defs: Def[] = [
  { slug: "drains", words: "Water won't go down", detail: "A slow sink, a backed-up tub, a toilet that won't clear", rows: [0, 1, 2] },
  { slug: "water-heaters", words: "No hot water", detail: "Or a leaking tank, or rust in the water", rows: [0, 1, 2] },
  { slug: "leaks-and-pipes", words: "Something's leaking", detail: "Under a sink, in a wall, in the crawlspace", rows: [0, 1], urgent: "Water running and you can't stop it? Turn off the main and call." },
  { slug: "fixtures", words: "Toilet keeps running", detail: "Or a faucet that drips", rows: [0, 1] },
  { slug: "sewer-lines", words: "Sewage smell or backup", detail: "Gurgling drains, a wet patch in the yard over the line", rows: [0, 1, 2], urgent: "Sewage coming up into the house? Call, don't book." },
];

export type Problem = Def & { service: Service; prices: { job: string; range: string }[] };

export const problems: Problem[] = defs.map((d) => {
  const service = services.find((s) => s.slug === d.slug);
  if (!service) throw new Error(`problems.ts: no service "${d.slug}"`);
  return { ...d, service, prices: d.rows.map((i) => service.prices[i]) };
});

// What the status line announces when a problem is picked (screen readers).
export const sayFor = (p: Problem | null) =>
  p
    ? `${p.words}. Typical price for ${p.prices[0].job.toLowerCase()}: ${p.prices[0].range}. Call-out fee ${facts.calloutFee.value}, ${facts.calloutCredited.value}.`
    : `Something else. Call-out fee ${facts.calloutFee.value}. I'll write you a price after I look.`;
