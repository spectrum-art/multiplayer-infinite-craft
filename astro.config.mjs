import { defineConfig } from "astro/config";
import deno from "freestyle-deno-astro-adapter";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  adapter: deno(),
  integrations: [react()],
  output: "server",
  vite: {
    esbuild: {
      target: "esnext",
      format: "esm",
      platform: "node",
      keepNames: true
    }
  }
});