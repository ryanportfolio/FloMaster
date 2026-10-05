// Serves dist/ with `astro preview` for the length of a script, then stops it.
// Astro 7 allows one preview server at a time, so an already-running preview
// (on any port) is reused. A dev server is never accepted: checks must run on
// the production build.
import { spawn, spawnSync } from "node:child_process";

const isDev = (html) => html.includes("/@vite/client");

async function probe(base) {
  try {
    const res = await fetch(base);
    if (!res.ok) return null;
    return isDev(await res.text()) ? "dev" : "preview";
  } catch {
    return null;
  }
}

export async function startPreview(port = 4321) {
  const base = `http://localhost:${port}`;
  const found = await probe(base);
  if (found === "dev") throw new Error(`${base} is an Astro dev server; stop it or pick another port. Checks need the production build (astro preview).`);
  if (found === "preview") return { base, stop() {} };

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
      throw new Error(`another astro preview server is running at ${url} but did not answer as a preview server`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`astro preview did not start on ${base}:\n${out}`);
}
