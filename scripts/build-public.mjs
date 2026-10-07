// Public build gate. Refuses to build while any business fact is unconfirmed,
// while sample reviews or AI stand-in photos remain, then builds with
// PUBLIC_BUILD=1 (no tags, no review bar, no noindex) and removes /review.
// Usage: npm run build:public
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const problems = [];
const facts = fs.readFileSync("src/data/facts.ts", "utf8");
const open = [...facts.matchAll(/f\("(P\d+)", "([^"]+)"[^\n]*?\)(?:,|$)/gm)].filter((m) => !m[0].includes('"confirmed"'));
if (open.length) problems.push(`${open.length} unconfirmed facts: ${[...new Set(open.map((m) => m[1]))].join(", ")}`);
if (fs.readFileSync("src/data/reviews.ts", "utf8").includes("Sample reviews")) problems.push("sample reviews in src/data/reviews.ts");
if (fs.readFileSync("src/data/facts.ts", "utf8").includes("AI-generated stand-in")) problems.push("AI-generated stand-in photos still listed in photoFacts");
if (fs.readFileSync("src/data/area.ts", "utf8").includes("NOT been checked")) problems.push("ZIP lists not checked (src/data/area.ts)");

if (problems.length) {
  console.error("Public build refused:\n- " + problems.join("\n- "));
  process.exit(1);
}
const r = spawnSync("npx", ["astro", "build"], { stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, PUBLIC_BUILD: "1" } });
if (r.status !== 0) process.exit(r.status ?? 1);
fs.rmSync("dist/review", { recursive: true, force: true });
console.log("Public build done; /review removed.");
