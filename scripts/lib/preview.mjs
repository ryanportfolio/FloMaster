// Serves dist/ with `astro preview` for the length of a script, then stops it.
// Astro 7 allows one preview server at a time, so an already-running preview
// (on any port) is reused, but only when its home page is byte for byte this
// checkout's dist/index.html: another worktree's preview, or any other server on
// the port, is refused. A dev server is never accepted: checks must run on the
// production build.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";

const isDev = (html) => html.includes("/@vite/client");
let built = null;
const ours = (html) => html === (built ??= fs.readFileSync("dist/index.html", "utf8"));

async function probe(base) {
  try {
    const res = await fetch(base);
    if (!res.ok) return null;
    const html = await res.text();
    return isDev(html) ? "dev" : ours(html) ? "preview" : "other";
  } catch {
    return null;
  }
}

export async function startPreview(port = 4321) {
  const base = `http://localhost:${port}`;
  const found = await probe(base);
  if (found === "dev") throw new Error(`${base} is an Astro dev server; stop it or pick another port. Checks need the production build (astro preview).`);
  if (found === "preview") return { base, stop() {} };
  if (found === "other") throw new Error(`${base} serves a different site or build than this checkout's dist/; stop it or pick another port.`);

  const child = spawn("npx", ["astro", "preview", "--port", String(port)], { shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  child.stderr.on("data", (d) => (out += d));
  for (let i = 0; i < 80; i++) {
    if ((await probe(base)) === "preview") {
      return {
        base,
        stop() {
          if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
          else child.kill();
        },
      };
    }
    const other = out.match(/already running[\s\S]*?URL:\s*(http:\/\/\S+?)\/?\s/);
    if (other) {
      const url = other[1].replace(/\/$/, "");
      if ((await probe(url)) === "preview") return { base: url, stop() {} };
      throw new Error(`another astro preview server is running at ${url} but does not serve this checkout's dist/; stop it first`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`astro preview did not start on ${base}:\n${out}`);
}
