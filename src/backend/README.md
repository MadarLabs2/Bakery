# Backend

Server-side and data-layer code for the Gluten-Free Bakery web app.

This project does **not** ship a separate Express server. The backend is:

1. **Supabase** (Postgres + Auth + Storage + RLS) — migrations live in `supabase/migrations/`.
2. **TanStack Start server functions** — add under `server/` using `createServerFn` when you need custom server logic.

## Layout

- **`supabase/typescript/`** — browser `client.ts`, server `client.server.ts`, `types.ts`, `auth-middleware.ts`. Import via `@supabase/...` or re-exports in `./db/`.
- **`./db/`** — thin re-exports so routes can import `@/backend/db/client` without coupling to folder names.

## Security

- Never import `./db/client.server` (service role) from route components that run as untrusted client code.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` variable.
- Browser access must respect RLS.
