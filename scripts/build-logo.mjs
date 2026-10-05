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

// The "O": a pipe ring in two blues with a tap and a drop inside.
function mark(cx, cy, r) {
  const sw = r * 0.2;
  const pt = (deg, rad = r) => {
    const a = (deg * Math.PI) / 180;
    return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
  };
  const arc = (from, to, color) => {
    const [x1, y1] = pt(from), [x2, y2] = pt(to);
    const large = ((to - from + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M${x1} ${y1}A${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="butt"/>`;
  };
  const collar = deg => {
    const [x, y] = pt(deg);
    const w = sw * 1.5, h = sw * 0.55;
    return `<rect x="${(x - w / 2).toFixed(2)}" y="${(y - h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${(h / 3).toFixed(2)}" fill="var(--logo-light, #6aaed6)" transform="rotate(${deg + 90} ${x} ${y})"/>`;
  };
  // Tap: a pipe dropping from the top of the ring, an elbow to the left, a spout down.
  const t = sw * 0.75;
  const top = cy - r + sw / 2;
  const tap = [
    `<path d="M${cx} ${top} V${(cy - r * 0.18).toFixed(2)} Q${cx} ${(cy + r * 0.02).toFixed(2)} ${(cx - r * 0.2).toFixed(2)} ${(cy + r * 0.02).toFixed(2)} H${(cx - r * 0.34).toFixed(2)} V${(cy + r * 0.16).toFixed(2)}" fill="none" stroke="var(--logo-light, #6aaed6)" stroke-width="${t.toFixed(2)}" stroke-linejoin="round"/>`,
    // handle
    `<path d="M${(cx - r * 0.16).toFixed(2)} ${(cy - r * 0.3).toFixed(2)} H${(cx + r * 0.16).toFixed(2)} M${cx} ${(cy - r * 0.3).toFixed(2)} V${(cy - r * 0.18).toFixed(2)}" fill="none" stroke="var(--logo-light, #6aaed6)" stroke-width="${(t * 0.7).toFixed(2)}" stroke-linecap="round"/>`,
  ].join("");
  // Drop under the spout.
  const dx = cx - r * 0.34, dy = cy + r * 0.32, ds = r * 0.2;
  const drop = `<path d="M${dx} ${(dy - ds).toFixed(2)} C${(dx + ds * 0.15).toFixed(2)} ${(dy - ds * 0.5).toFixed(2)} ${(dx + ds * 0.7).toFixed(2)} ${(dy + ds * 0.05).toFixed(2)} ${(dx + ds * 0.7).toFixed(2)} ${(dy + ds * 0.45).toFixed(2)} A${(ds * 0.7).toFixed(2)} ${(ds * 0.7).toFixed(2)} 0 0 1 ${(dx - ds * 0.7).toFixed(2)} ${(dy + ds * 0.45).toFixed(2)} C${(dx - ds * 0.7).toFixed(2)} ${(dy + ds * 0.05).toFixed(2)} ${(dx - ds * 0.15).toFixed(2)} ${(dy - ds * 0.5).toFixed(2)} ${dx} ${(dy - ds).toFixed(2)}Z" fill="var(--logo-light, #6aaed6)"/>`;
  return [
    arc(-80, 85, "var(--logo-dark, #5b7fae)"),
    arc(95, 260, "var(--logo-light, #6aaed6)"),
    collar(-90), collar(90),
    tap, drop,
  ].join("");
}

const gap = SIZE * 0.06;
const fl = word("FL", 0);
const r = CAP * 0.62;
const ringX = fl.width + gap + r;
const masters = word("MASTERS", ringX + r + gap);
const width = Math.ceil(ringX + r + gap + masters.width);
const top = BASE - CAP - 6, height = Math.ceil(CAP + 12);

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${top.toFixed(1)} ${width} ${height}" role="img" aria-label="FloMasters">
<path d="${fl.d}${masters.d}" fill="var(--logo-text, #ffffff)"/>
${mark(ringX, BASE - CAP / 2, r)}
</svg>
`;
const m = 64, mr = 26;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m} ${m}"><rect width="${m}" height="${m}" rx="12" fill="#1b3556"/>${mark(m / 2, m / 2, mr)}</svg>
`;

fs.mkdirSync("src/assets", { recursive: true });
fs.writeFileSync("src/assets/logo.svg", wordmark);
fs.writeFileSync("public/favicon.svg", favicon.replaceAll(/var\(--logo-[a-z]+, (#[0-9a-f]+)\)/g, "$1"));
console.log(`logo ${width}x${height}, cap ${CAP.toFixed(1)}`);
