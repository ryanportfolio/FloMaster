// Serves dist/ with `astro preview` for the length of a script, then stops it.
// Reuses a server already answering on the port (Astro allows only one).
import { spawn, spawnSync } from "node:child_process";

export async function startPreview(port = 4321) {
  const base = `http://localhost:${port}`;
  const up = async () => { try { return (await fetch(base)).ok; } catch { return false; } };
  if (await up()) return { base, stop() {} };
  const child = spawn("npx", ["astro", "preview", "--port", String(port), "--force"], { shell: process.platform === "win32", stdio: "ignore" });
  for (let i = 0; i < 80 && !(await up()); i++) await new Promise((r) => setTimeout(r, 250));
  if (!(await up())) throw new Error(`astro preview did not start on ${base}`);
  return {
    base,
    stop() {
      if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      else child.kill();
    },
  };
}
