// Rebuilds the FloMasters logo SVGs from the business card design.
// The wordmark letters are outlined from Cinzel (closest match to the card's
// Roman capitals) so the site never loads that font. Run: npm run logo
import fs from "node:fs";
import opentype from "opentype.js";

const font = opentype.parse(
  fs.readFileSync("node_modules/@fontsource/cinzel/files/cinzel-latin-500-normal.woff").buffer,
);

const SIZE = 100; // font size in SVG units
const CAP = font.tables.os2.sCapHeight * (SIZE / font.unitsPerEm);
const BASE = 100; // baseline y

// Cinzel's "M" has a horizontal segment whose x opentype.js leaves undefined;
// carry the previous point's x/y forward instead of writing NaN.
function serialize(commands) {
  let px = 0, py = 0;
  const n = v => (+v).toFixed(2);
  return commands.map(c => {
    const x = Number.isFinite(c.x) ? c.x : px, y = Number.isFinite(c.y) ? c.y : py;
    let s;
    if (c.type === "M" || c.type === "L") s = `${c.type}${n(x)} ${n(y)}`;
    else if (c.type === "Q") s = `Q${n(c.x1)} ${n(c.y1)} ${n(x)} ${n(y)}`;
    else if (c.type === "C") s = `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(x)} ${n(y)}`;
    else return "Z";
    px = x; py = y;
    return s;
  }).join("");
}

// Letter by letter: whole-string layout runs Cinzel's ligature substitution,
// which gives NaN coordinates in opentype.js 2.0.
function word(text, x) {
  const scale = SIZE / font.unitsPerEm;
  let d = "", cursor = x;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    d += serialize(glyph.getPath(cursor, BASE, SIZE).commands);
    cursor += glyph.advanceWidth * scale;
  }
  return { d, width: cursor - x };
}

// The "O" as the business card draws it (read the right way up, 2026-10-07): a ring of four
// quarter arcs, light top right and bottom left, dark the other two, with a short gap at
// 12, 3 and 6 o'clock where each light arc ends in a flared collar. The bottom-left light arc
// runs into a tap that comes in from the left side of the ring: a level pipe with a T handle on
// top and the spout turning down at the right, and a drop falling under the spout.
// Measured from the card photo with the ring's centre line radius as r.
function mark(cx, cy, r) {
  const L = "var(--logo-light, #7db4d8)", D = "var(--logo-dark, #4f6d98)";
  const sw = r * 0.13;
  const f = (v) => +v.toFixed(2);
  const pt = (deg, rad = r) => { const a = (deg * Math.PI) / 180; return [f(cx + rad * Math.cos(a)), f(cy + rad * Math.sin(a))]; };
  const arc = (from, to, color, w = sw) => {
    const [x1, y1] = pt(from), [x2, y2] = pt(to);
    return `<path d="M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${f(w)}"/>`;
  };
  // a collar: the arc's end widened, one short block across the ring
  const collar = (deg, side) => {
    const span = 7, [a, b] = side > 0 ? [deg, deg + span] : [deg - span, deg];
    return arc(a, b, L, sw * 1.55);
  };
  const gap = 3; // degrees each side of a gap
  const py = cy - r * 0.035, pw = r * 0.165; // pipe centre line and thickness
  const sx = cx + r * 0.16, sw2 = r * 0.145; // spout centre x and thickness
  const tap = [
    // pipe from the ring wall to the spout, turning down
    `<path d="M${f(cx - r)} ${f(py)}H${f(cx + r * 0.02)}Q${f(sx)} ${f(py)} ${f(sx)} ${f(py + r * 0.12)}V${f(cy + r * 0.205)}" fill="none" stroke="${L}" stroke-width="${f(pw)}" stroke-linejoin="round"/>`,
    // spout end, a touch wider than the bend
    `<rect x="${f(sx - sw2 * 0.62)}" y="${f(cy + r * 0.13)}" width="${f(sw2 * 1.24)}" height="${f(r * 0.085)}" rx="${f(r * 0.02)}" fill="${L}"/>`,
    // handle stem and bar
    `<rect x="${f(cx - r * 0.2)}" y="${f(cy - r * 0.31)}" width="${f(r * 0.13)}" height="${f(r * 0.22)}" fill="${L}"/>`,
    `<rect x="${f(cx - r * 0.34)}" y="${f(cy - r * 0.375)}" width="${f(r * 0.42)}" height="${f(r * 0.085)}" rx="${f(r * 0.03)}" fill="${L}"/>`,
  ].join("");
  // drop under the spout
  const ds = r * 0.135, dx = sx + r * 0.02, dy = cy + r * 0.41;
  const drop = `<path d="M${f(dx)} ${f(dy - ds)}C${f(dx + ds * 0.15)} ${f(dy - ds * 0.5)} ${f(dx + ds * 0.72)} ${f(dy + ds * 0.05)} ${f(dx + ds * 0.72)} ${f(dy + ds * 0.45)}A${f(ds * 0.72)} ${f(ds * 0.72)} 0 0 1 ${f(dx - ds * 0.72)} ${f(dy + ds * 0.45)}C${f(dx - ds * 0.72)} ${f(dy + ds * 0.05)} ${f(dx - ds * 0.15)} ${f(dy - ds * 0.5)} ${f(dx)} ${f(dy - ds)}Z" fill="${L}"/>`;
  return [
    arc(-90 + gap, 0 - gap, L), collar(-90 + gap, 1), collar(0 - gap, -1), // top right, light
    arc(0 + gap, 90 - gap, D), // bottom right, dark
    arc(90 + gap, 180, L), collar(90 + gap, 1), // bottom left, light, into the pipe
    arc(180 + 8, 270 - gap, D), // top left, dark, starting above the pipe
    tap, drop,
  ].join("");
}

// Proportions from the card: the ring's centre line radius is 0.66 of the capital height, its
// centre sits 0.04 of a capital below the letters' middle, and it nearly touches the L.
const gap = SIZE * 0.03;
const fl = word("FL", 0);
const r = CAP * 0.66;
const ringOut = r * 1.1; // centre line radius plus half the widest collar
const ringX = fl.width + gap + ringOut;
const ringY = BASE - CAP / 2 + CAP * 0.04;
const masters = word("MASTERS", ringX + ringOut + gap * 2.5);
const width = Math.ceil(ringX + ringOut + gap * 2.5 + masters.width);
const top = Math.floor(Math.min(BASE - CAP - 2, ringY - ringOut - 1));
const height = Math.ceil(Math.max(BASE + 2, ringY + ringOut + 1) - top);

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top} ${width} ${height}" role="img" aria-label="FloMasters">
<path d="${fl.d}${masters.d}" fill="var(--logo-text, #ffffff)"/>
${mark(ringX, ringY, r)}
</svg>
`;
const m = 64, mr = 24;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m} ${m}"><rect width="${m}" height="${m}" rx="12" fill="#1b3556"/>${mark(m / 2, m / 2, mr)}</svg>
`;

fs.mkdirSync("src/assets", { recursive: true });
fs.writeFileSync("src/assets/logo-static.svg", wordmark);
fs.writeFileSync("public/favicon.svg", favicon.replaceAll(/var\(--logo-[a-z]+, (#[0-9a-f]+)\)/g, "$1"));
console.log(`logo ${width}x${height}, cap ${CAP.toFixed(1)}`);
