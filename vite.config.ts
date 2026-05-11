import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Vercel deployment build.
// - tanstackStart generates SSR bundle at dist/server/server-entry.js
// - Static client assets emitted to dist/client/
// - api/index.ts is a Vercel Node serverless function that adapts Node req/res
//   to a Web Request and forwards to the SSR fetch handler.
// - vercel.json wires routing: /assets/* -> static, everything else -> api/index.
// Triggering fresh Vercel build with environment variables
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  resolve: {
    alias: { "@": "/src" },
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
    ],
  },
});
