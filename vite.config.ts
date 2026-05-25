// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

/** Vercel sets VERCEL=1 during CI builds; Nitro + vercel preset is required for SSR there. */
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  plugins: isVercel
    ? [
        nitro({
          preset: "vercel",
        }),
      ]
    : undefined,
  tanstackStart: {
    router: {
      entry: "frontend/router.tsx",
      routesDirectory: "frontend/routes",
      generatedRouteTree: "frontend/routeTree.gen.ts",
    },
  },
});
