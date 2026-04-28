# Backend

All server-side / data layer code for the Gluten-Free Bakery web app.

This project does **not** ship a separate Node.js/Express server. Instead the
backend is composed of two layers, both deployed automatically:

1. **Lovable Cloud (Postgres + Auth + Storage + Row Level Security)**
   The actual database & auth provider. Schema, RLS policies, triggers and
   storage buckets are defined as SQL migrations in `supabase/migrations/`.

2. **TanStack Start server functions** (when custom server logic is needed)
   Live under `./server/` as `*.functions.ts` files using `createServerFn`.
   These run only on the server and can safely use service-role keys.

## What lives here (or is re-exported here)

- **Database client** → `./db/`
  - `client.ts` → browser-safe Supabase client (uses publishable key, RLS on)
  - `client.server.ts` → admin client, service role key, **server only**
  - `auth-middleware.ts` → middleware that authenticates server functions as the current user
  - `types.ts` → auto-generated database types
  Original sources live in `src/integrations/supabase/` (auto-managed by Lovable).

- **Database schema** → `supabase/migrations/*.sql`
  All tables (products, categories, orders, carts, coupons, profiles,
  user_roles, ...), RLS policies and triggers.

- **Server functions** → `./server/`
  Add custom server-side logic here as `*.functions.ts` files.

## Security rules

- Never import `./db/client.server` from frontend code.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` variable.
- All data access from the browser must respect RLS — that's the security model.
