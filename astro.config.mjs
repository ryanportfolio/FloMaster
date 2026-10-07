import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://flomasters.example",
  trailingSlash: "ignore",
  build: {
    // Small static site: inlining the CSS removes the only render-blocking request.
    inlineStylesheets: "always",
  },
});
