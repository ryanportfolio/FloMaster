// Residential service pages (P32) and their sample price ranges (P17).
// Prices are realistic samples for the owner to correct, not research figures.
import type { ImageMetadata } from "astro";
import drains from "../assets/photos/drains.jpg";
import waterHeater from "../assets/photos/water-heater.jpg";
import leakRepair from "../assets/photos/leak-repair.jpg";
import fixtures from "../assets/photos/fixtures.jpg";
import sewer from "../assets/photos/sewer.jpg";

export type Service = {
  slug: string;
  title: string;
  short: string;
  bookLabel: string;
  photo: ImageMetadata;
  photoAlt: string;
  shot: string;
  intro: string;
  covers: string[];
  prices: { job: string; range: string }[];
  topOfRange: string;
  timeOnSite: string;
  options: string;
};

export const services: Service[] = [
  {
    slug: "drains",
    title: "Drain clearing",
    short: "Slow sinks, backed-up tubs and toilets, kitchen lines.",
    bookLabel: "Blocked drain",
    photo: drains,
    photoAlt: "Gloved hands feeding a drain snake into a kitchen sink trap, with the old trap in a bucket",
    shot: "Antonio under a kitchen sink clearing a line, trap in a bucket, drop cloth down.",
    intro: "Most blocked drains in Hampton Roads homes are grease in the kitchen line or hair in the tub. I clear them with a hand or machine snake, then run water to prove the line is flowing before I pack up.",
    covers: ["Kitchen and bathroom sinks", "Tubs and showers", "Toilets", "Laundry standpipes", "Floor drains"],
    prices: [
      { job: "Sink, tub or shower drain", range: "$150 to $275" },
      { job: "Toilet blockage", range: "$150 to $250" },
      { job: "Main line from a cleanout", range: "$275 to $450" },
    ],
    topOfRange: "No accessible cleanout, a line that needs a camera to find the problem, or roots.",
    timeOnSite: "45 minutes to 2 hours",
    options: "If a line keeps blocking, I'll show you why on camera and give you the repair and replacement prices side by side. You choose.",
  },
  {
    slug: "water-heaters",
    title: "Water heaters",
    short: "Repairs, replacements and tankless conversions.",
    bookLabel: "Water heater",
    photo: waterHeater,
    photoAlt: "A plumber tightening a connector on a newly installed tank water heater in a garage",
    shot: "Antonio finishing a tank water heater install in a garage, expansion tank and shut-off visible.",
    intro: "No hot water, a leaking tank, or rust in the water. I'll tell you honestly whether a repair makes sense on your heater's age, and if it doesn't, I'll install a replacement to code with a new expansion tank and shut-off valve.",
    covers: ["Gas and electric tank heaters", "Thermostats, elements and gas valves", "Leaking tanks and relief valves", "Tankless installs and descaling", "Permits and haul-away"],
    prices: [
      { job: "Repair (element, thermostat, valve)", range: "$175 to $425" },
      { job: "40 to 50 gallon tank, installed", range: "$1,650 to $2,400" },
      { job: "Tankless, installed", range: "$3,800 to $5,200" },
    ],
    topOfRange: "Moving the heater, venting changes for gas units, or bringing older pipework up to code.",
    timeOnSite: "1 hour for most repairs; half a day for a replacement",
    options: "Repair first if your heater is under about 10 years old and the tank is sound. I'll say so if it isn't worth it.",
  },
  {
    slug: "leaks-and-pipes",
    title: "Leaks and pipe repair",
    short: "Leaks under sinks, in walls and in the crawlspace. Repiping.",
    bookLabel: "Leak or pipe repair",
    photo: leakRepair,
    photoAlt: "Hands fitting a new copper pipe section with a press tool in a crawlspace",
    shot: "Antonio in a crawlspace fitting new copper, headlamp on, old corroded pipe beside him.",
    intro: "Older homes across the 7 cities still have galvanized or early copper lines, and crawlspaces near the water take a beating. I find the leak, fix that section properly, and tell you plainly if the rest of the line is close to failing.",
    covers: ["Visible and hidden leaks", "Crawlspace and slab lines", "Shut-off valves", "Polybutylene and galvanized replacement", "Whole-house repipes"],
    prices: [
      { job: "Accessible leak repair", range: "$175 to $450" },
      { job: "Replace a shut-off valve", range: "$150 to $300" },
      { job: "Whole-house repipe (PEX)", range: "$4,500 to $9,000" },
    ],
    topOfRange: "Leaks inside walls or under slabs, tight crawlspaces, or several leaks on the same line.",
    timeOnSite: "1 to 3 hours for a repair",
    options: "A single leak gets a single repair. I'll only suggest a repipe if the pipe itself is failing, and I'll show you the section I took out.",
  },
  {
    slug: "fixtures",
    title: "Toilets, faucets and fixtures",
    short: "Running toilets, dripping faucets, new fixtures fitted.",
    bookLabel: "Toilet or faucet",
    photo: fixtures,
    photoAlt: "Hands installing a new brushed-nickel faucet on a bathroom vanity, the old faucet set aside",
    shot: "Antonio fitting a new faucet in a bathroom, the old one set aside on a towel.",
    intro: "A running toilet can waste thousands of gallons a month. I repair what can be repaired, and if you're replacing a fixture, I'll fit the one you chose or recommend a reliable one at a fair price.",
    covers: ["Running and leaking toilets", "Dripping faucets", "Garbage disposals", "New toilets, faucets and sinks", "Outdoor spigots"],
    prices: [
      { job: "Toilet repair", range: "$125 to $250" },
      { job: "Faucet repair", range: "$125 to $225" },
      { job: "Install a fixture you supply", range: "$175 to $350" },
    ],
    topOfRange: "Seized or corroded shut-offs, damaged flanges, or a new fixture that needs pipe changes.",
    timeOnSite: "1 to 2 hours",
    options: "Most toilets and faucets can be repaired for far less than replacing them. I'll tell you which yours is.",
  },
  {
    slug: "sewer-lines",
    title: "Sewer lines and camera inspection",
    short: "Camera inspections, root problems, cleanouts and line repair.",
    bookLabel: "Sewer line",
    photo: sewer,
    photoAlt: "A plumber in a back yard feeding a sewer camera into a cleanout, watching a monitor showing a root in the pipe",
    shot: "Antonio in a back yard at a cleanout with the sewer camera, monitor showing the pipe.",
    intro: "Gurgling drains, sewage smells or a yard that's wet over the line. I put a camera down the pipe and show you exactly what's there on the screen, so you see the problem before you hear a price.",
    covers: ["Camera inspections with video", "Root cutting", "Cleanout installation", "Spot repairs", "Line replacement"],
    prices: [
      { job: "Camera inspection with video", range: "$225 to $350" },
      { job: "Root cutting from a cleanout", range: "$300 to $500" },
      { job: "Install a cleanout", range: "$650 to $1,200" },
    ],
    topOfRange: "No cleanout, deep lines, or repairs under driveways and trees.",
    timeOnSite: "1 to 3 hours",
    options: "You keep the video. If someone else has told you the whole line needs replacing, I'm glad to give a second opinion.",
  },
];
