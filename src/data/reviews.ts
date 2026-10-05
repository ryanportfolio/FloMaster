// Sample reviews (P23). Every one is labelled "Sample review" on the page, with
// tags on or off, and the public build fails while any remain.
export type Review = { name: string; city: string; date: string; service: string; text: string; reply?: string };

export const reviews: Review[] = [
  {
    name: "Denise R.",
    city: "Chesapeake",
    date: "2026-10-02",
    service: "Water heater",
    text: "Our water heater quit on a Sunday. Antonio called back in about ten minutes, came out that afternoon, and gave me the price for a repair and for a new tank before touching anything. We went with the repair. He showed me the old part.",
    reply: "Thank you, Denise. Glad the repair did the job. Call me if it gives you any trouble.",
  },
  {
    name: "Marcus T.",
    city: "Norfolk",
    date: "2026-09-24",
    service: "Leak repair",
    text: "Leak in the crawlspace of a 1950s house. He crawled under, found it, fixed that section and told me the rest of the copper was fine. Another company had quoted me a full repipe. Price was exactly what he said on the phone.",
  },
  {
    name: "Priya S.",
    city: "Virginia Beach",
    date: "2026-09-15",
    service: "Drain clearing",
    text: "Kitchen sink backed up the night before a party. Booked online, got a text confirming the morning slot, and he was there at the start of the window. Laid down a drop cloth and cleaned up after.",
  },
  {
    name: "James W.",
    city: "Suffolk",
    date: "2026-08-30",
    service: "Sewer camera",
    text: "He ran the camera and let me watch the screen the whole time. Roots at the joint about 40 feet out. Cut them, sent me the video, and suggested a cleanout so it's cheaper next time. No pressure to do more.",
    reply: "Thanks, James. The cleanout will save you money if the roots come back.",
  },
  {
    name: "Angela M.",
    city: "Hampton",
    date: "2026-08-12",
    service: "Toilet repair",
    text: "Running toilet I'd ignored for months. Fixed for less than I expected and he didn't try to sell me a new toilet. Fees were all on his website before I called.",
  },
  {
    name: "Robert K.",
    city: "Portsmouth",
    date: "2026-07-28",
    service: "Faucet install",
    text: "Installed two faucets I'd bought. Quick, tidy, and he pointed out a shut-off valve that was about to fail. Replaced it for the price on his list.",
  },
];

// Absolute dates only: a static build can't keep "3 days ago" true.
export function shortDate(iso: string): string {
  return new Date(iso + "T12:00:00-04:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function longDate(iso: string): string {
  return new Date(iso + "T12:00:00-04:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
