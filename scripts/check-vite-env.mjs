/**
 * Ensures Vite-inlined Supabase vars exist before `vite build`.
 * Loads `.env` from repo root when present (local); CI should set env in the shell.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function loadEnvFile() {
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // no .env — rely on process.env only (CI / hosting)
  }
}

loadEnvFile();

const url = process.env.VITE_SUPABASE_URL?.trim();
const key =
  process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!url || !key) {
  console.error(`
[check-vite-env] Missing required variables for production build.

  Set in .env (local) or in your host / GitHub Actions secrets:

    VITE_SUPABASE_URL              = your project URL (Settings → API)
    VITE_SUPABASE_ANON_KEY         = anon public key (or use VITE_SUPABASE_PUBLISHABLE_KEY)

  Copy .env.example → .env and fill values. Never commit .env.

  Hosting: add the same names in Cloudflare Pages / Vercel / Netlify environment
  settings and redeploy — Vite bakes them in at build time.
`);
  process.exit(1);
}

console.log("[check-vite-env] VITE_SUPABASE_URL and publishable key are set.");
