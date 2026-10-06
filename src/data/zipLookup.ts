// ZIP lookup and city grouping for the service-area chart (components/TidewaterChart.astro). Reads only src/data/area.ts,
// whose ZIP lists are unchecked (fact P32, zipList) and whose "sometimes" ZIPs get "Call me to check".
import { cities, zips, sometimes } from "./area";

export type City = (typeof cities)[number];
export type Answer = { kind: "bad" } | { kind: "no"; zip: string } | { kind: "yes" | "maybe"; zip: string; city: City };

export function lookup(raw: string): Answer {
  const zip = raw.trim();
  if (!/^\d{5}$/.test(zip)) return { kind: "bad" };
  const city = zips[zip];
  if (!city) return { kind: "no", zip };
  return { kind: sometimes.includes(zip) ? "maybe" : "yes", zip, city };
}

export const slug = (c: string) => c.toLowerCase().replace(/\s+/g, "-");

export const byCity = cities.map((city) => {
  const list = Object.keys(zips).filter((z) => zips[z] === city).sort();
  return {
    city,
    slug: slug(city),
    zips: list.map((z) => ({ zip: z, maybe: sometimes.includes(z) })),
    sure: list.filter((z) => !sometimes.includes(z)).length,
    maybe: list.filter((z) => sometimes.includes(z)).length,
  };
});
