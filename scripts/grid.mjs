// Grid of screenshots. Usage: node scripts/grid.mjs <out.jpg> <tileWidth> <cols> <file...>
import sharp from "sharp";
const [out, tw, c, ...files] = process.argv.slice(2);
const W = +tw, cols = +c, pad = 8;
const tiles = await Promise.all(files.map(async (f) => {
  const buf = await sharp(f).resize({ width: W }).toBuffer();
  return { buf, h: (await sharp(buf).metadata()).height };
}));
const rows = Math.ceil(tiles.length / cols);
const rowH = [...Array(rows)].map((_, r) => Math.max(...tiles.slice(r * cols, r * cols + cols).map((t) => t.h)));
const top = (r) => rowH.slice(0, r).reduce((a, b) => a + b + pad, 0);
await sharp({ create: { width: cols * (W + pad), height: top(rows), channels: 3, background: "#777" } })
  .composite(tiles.map((t, i) => ({ input: t.buf, left: (i % cols) * (W + pad), top: top(Math.floor(i / cols)) })))
  .jpeg({ quality: 75 }).toFile(out);
console.log("ok", out);
