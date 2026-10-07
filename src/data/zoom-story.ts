// The home page's zoom story (ZoomStory.astro, src/scripts/zoom-story.js): one sample job in
// Norfolk, from the Hampton Roads chart down to a failed copper joint in a wall, the repair, and
// the pull-back to the closed, dry house. Built and approved as the scroll-zoom specimen (v3).
//
// Pictures live in public/zoom/ as `<key>-<size>.webp`: d2000, d2700 and d3300 for desktops
// (picked by the device pixels the stage needs), p2 and p3 for phones (by pixel ratio). Each level
// shows the centre 1/S of the level before at S times the detail (S = square root of 5). A state
// with `box` is a patch drawn over its level's main picture (x, y, w, h in 1500 x 1000 units).
import { services } from "./services";

export type ZoomLayer = { key: string; level: number; alt: string; whole?: boolean; patchOf?: string; box?: [number, number, number, number] };

// In story order: screen readers read the alt texts in this order. Paint order comes from the
// level and the order within it (a state above its level's main picture).
export const zoomLayers: ZoomLayer[] = [
  { key: "L0", level: 0, whole: true, alt: "A chart of Hampton Roads from above: the harbor and its rivers dividing Newport News and Hampton to the north from Norfolk, Portsmouth, Chesapeake, Virginia Beach and Suffolk to the south" },
  { key: "L0h", level: 1, alt: "Closer in on the harbor: Norfolk on its peninsula between the rivers" },
  { key: "L1", level: 2, alt: "Norfolk: the Elizabeth and Lafayette rivers winding between the neighborhoods" },
  { key: "L1h", level: 3, alt: "The neighborhoods north of downtown Norfolk, streets and houses from above" },
  { key: "L2", level: 4, alt: "A Norfolk neighborhood from above, its street grid running to the river" },
  { key: "L2h", level: 5, alt: "A dozen blocks of the neighborhood from above" },
  { key: "L3", level: 6, alt: "A few blocks of frame houses, lawns and street trees from above" },
  { key: "L3h", level: 7, alt: "Two streets of frame houses from above" },
  { key: "L4", level: 8, alt: "One Norfolk street from above: frame houses with porches, lawns and street trees" },
  { key: "L4h", level: 9, alt: "A few houses on the street, one with a small opening in its gable wall" },
  { key: "L5", level: 10, alt: "One two-storey frame house, cut open in the gable wall between the upper windows: a copper pipe inside, a damp brown stain running down from it" },
  { key: "L5h", level: 11, alt: "The gable wall: the cutaway between the windows, a copper pipe and a stain running down to the siding" },
  { key: "L6", level: 12, alt: "Inside the wall: wood studs, the back of the lath and plaster, a copper water line across, its coupling leaking: a jet of water, a drop under it and a brown stain spreading below" },
  { key: "L6h", level: 13, alt: "The copper line between two studs: water jets from the coupling's corroded joint and drips from under it" },
  { key: "L7", level: 14, alt: "The failed joint close up: blue-green corrosion has eaten through the solder at one end of the coupling, water jets from a pinhole and a drop hangs underneath" },
  { key: "L7cut", level: 14, patchOf: "L7", box: [103.7, 332.59, 1250.37, 667.41], alt: "The water shut off and the failed joint cut out: a gap in the line between two square-cut, cleaned pipe ends, one last drop hanging from the left end" },
  { key: "L7r", level: 14, patchOf: "L7", box: [0, 0, 1433.33, 1000], alt: "The repair close up: the corroded joint cut out, a new piece of bright copper sweated in with two new couplings, clean silver solder rings, the lath dry" },
  { key: "L6hr", level: 13, patchOf: "L6h", box: [0, 231.11, 1500, 768.89], alt: "The line between the studs with a new piece of copper and two new couplings sweated in, nothing dripping" },
  { key: "L6r", level: 12, patchOf: "L6", box: [363.7, 209.63, 1136.3, 755.56], alt: "The same wall after the repair: two new copper couplings in the line, nothing leaking, the stain dried to a faint mark" },
  { key: "L6c", level: 12, patchOf: "L6", box: [319.26, 176.3, 838.52, 806.67], alt: "The same wall closed again: the lap siding runs straight across, clean and dry" },
  { key: "L5hc", level: 11, patchOf: "L5h", box: [540.74, 338.52, 408.15, 396.3], alt: "The gable wall closed again, clean and dry" },
  { key: "L5c", level: 10, patchOf: "L5", box: [638.52, 410.37, 218.52, 211.85], alt: "The same house afterwards: the gable wall closed, the siding clean and dry" },
];

// Place names on the opening chart: x, y in the 84 km chart's 1500 x 1000 units (Web Mercator).
// `side` is where the label sits next to its dot; Norfolk, where the job is, fades last.
export const zoomPlaces = [
  { name: "Norfolk", x: 836, y: 488.2, side: "r", late: true },
  { name: "Portsmouth", x: 637.2, y: 617.3, side: "l" },
  { name: "Chesapeake", x: 828, y: 855.5, side: "r" },
  { name: "Virginia Beach", x: 1161.9, y: 617.3, side: "r" },
  { name: "Suffolk", x: 287.4, y: 796, side: "r" },
  { name: "Hampton", x: 637.2, y: 189.7, side: "r" },
  { name: "Newport News", x: 462.3, y: 259.4, side: "l" },
];

// The timeline the story plays on its own clock (29.5 s). Depth z: level i fills the stage at
// z = i; "start" is the opening framing (the whole chart). Beats: when each entry of the work
// order arrives (segment, ms into it). Drip: the drop falling from the failed joint.
export const zoomStory = {
  timeline: [
    { type: "hold", z: "start", dur: 1500, note: "the chart; where" },
    { type: "zoom", from: "start", to: 10, dur: 8100, note: "chart to the house, one move: about 1.5 s per five-fold step, eased start and stop" },
    { type: "hold", z: 10, dur: 1800, note: "the house, its wall cut open; found" },
    { type: "zoom", from: 10, to: 13.7, toPhone: 13.4, dur: 3400, note: "house to the cracked joint" },
    { type: "hold", z: 13.7, zPhone: 13.4, dur: 3600, note: "the failed joint, the drip falling; failed" },
    { type: "fade", z: 13.7, zPhone: 13.4, dur: 700, use: { 14: "L7cut" }, fade: [{ level: 14, from: "L7", to: "L7cut" }], note: "the water off, the failed section cut out" },
    { type: "hold", z: 13.7, zPhone: 13.4, dur: 900, use: { 14: "L7cut" }, note: "the cut ends, cleaned" },
    { type: "fade", z: 13.7, zPhone: 13.4, dur: 1000, use: { 13: "L6hr", 14: "L7r" }, fade: [{ level: 14, from: "L7cut", to: "L7r" }, { level: 13, from: "L6h", to: "L6hr" }], note: "the joint remade; new copper sweated in" },
    { type: "hold", z: 13.7, zPhone: 13.4, dur: 1800, use: { 13: "L6hr", 14: "L7r" }, note: "the repair" },
    { type: "zoom", from: 13.7, fromPhone: 13.4, to: 10, dur: 4200, use: { 10: "L5c", 11: "L5hc", 12: "L6r", 13: "L6hr", 14: "L7r" }, zfade: { level: 12, from: "L6r", to: "L6c", z0: 11.7, z1: 11.1, hideChild: true, child: "L6hr" }, note: "one pull-back to the house; the wall closes once the gable is in view" },
    { type: "hold", z: 10, dur: 2500, use: { 10: "L5c", 11: "L5hc", 12: "L6c", 13: "none", 14: "none" }, note: "the closed, dry house; tested" },
  ],
  beats: [{ seg: 0, at: 250 }, { seg: 2, at: 150 }, { seg: 4, at: 250 }, { seg: 7, at: 200 }, { seg: 10, at: 150 }],
  drip: { level: 14, at: [697, 762], w: 40, fall: 330, period: 1150, grow: 0.55, segs: [3, 4] },
};

// The work order beside the stage. Each row arrives at its beat (index into zoomStory.beats).
export const zoomRows = [
  { key: "where", label: "Where", value: "Norfolk", beat: 0 },
  { key: "found", label: "Found", value: "In the gable wall", beat: 1 },
  { key: "failed", label: "Failed", value: "Pinhole at a corroded joint", beat: 2 },
  { key: "fixed", label: "Fixed", value: "New copper sweated in", beat: 3 },
  { key: "tested", label: "Tested", value: "Dry, under pressure", beat: 4 },
];

// The two notes are the leak page's own promises (services.ts, leaks-and-pipes "options").
const options = services.find((s) => s.slug === "leaks-and-pipes")?.options ?? "";
const sentence = (start: string) => options.match(new RegExp(`${start}[^.,]*`))?.[0] ?? "";
export const zoomNotes = [
  { text: sentence("A single leak"), beat: 3 },
  { text: sentence("I'll show you"), beat: 4 },
];

// Where the leak sits in the failed-joint snapshot (% of its square): the pen ring goes round it.
export const zoomSnapLeak = [55, 51];

// The no-script fallback: five stills with the work order's entries as captions.
export const zoomStills = [
  { src: "L0", whole: true, alt: zoomLayers[0].alt, row: 0 },
  { src: "L5", alt: zoomLayers[10].alt, row: 1 },
  { src: "L7", alt: zoomLayers[14].alt, row: 2 },
  { src: "L7", patch: "L7r", style: "left:0.000%;top:0.000%;width:95.555%;height:100.000%", alt: zoomLayers[16].alt, row: 3, note: 0 },
  { src: "L5", patch: "L5c", style: "left:42.568%;top:41.037%;width:14.568%;height:21.185%", alt: zoomLayers[21].alt, row: 4, note: 1 },
];
