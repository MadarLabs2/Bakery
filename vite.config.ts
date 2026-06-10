// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Vercel sets VERCEL=1 in CI. Locally and on Render the target is Node.js.
// CF Workers is not used (Sharp requires native bindings unavailable in V8 isolates).
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  cloudflare: false,
  plugins: [
    nitro({
      preset: isVercel ? "vercel" : "node",
      serverDir: "server",
    }),
  ],
  tanstackStart: {
    router: {
      entry: "frontend/router.tsx",
      routesDirectory: "frontend/routes",
      generatedRouteTree: "frontend/routeTree.gen.ts",
    },
  },
  vite: {
    build: {
      sourcemap: false,
    },
  },
});
