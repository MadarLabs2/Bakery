# Project Structure

```
src/
├── frontend/          ← all UI / client-side code (entry points & re-exports)
│   ├── README.md
│   ├── components/    ← Header, Footer, ProductCard, shadcn UI
│   ├── state/         ← auth, cart, i18n React contexts
│   └── lib/           ← image helpers etc.
│
├── backend/           ← all server / data layer code
│   ├── README.md
│   ├── db/            ← Supabase clients (browser, admin, auth middleware, types)
│   └── server/        ← custom TanStack server functions (createServerFn)
│
├── routes/            ← TanStack Start file-based routes (= frontend pages)
│                        Required to live here by the framework.
├── components/        ← Source of UI components (re-exported via frontend/)
├── lib/               ← Source of shared client logic (re-exported via frontend/)
├── integrations/      ← Auto-generated Supabase clients (re-exported via backend/db/)
├── assets/            ← Images
└── styles.css         ← Tailwind & design tokens

supabase/
└── migrations/        ← SQL schema, RLS policies, triggers (the database itself)
```

## Why some files stay in their original folders

- `src/routes/` — TanStack Start's file-based router auto-generates `routeTree.gen.ts` from this exact folder. Moving it would break routing.
- `src/integrations/supabase/` — these files are auto-managed by Lovable Cloud and regenerate on schema changes. Moving them would cause them to be re-created in the original location.
- `src/components/` & `src/lib/` — kept as the canonical source so that auto-generated routes can keep importing from `@/components/...` and `@/lib/...` without churn.

The `src/frontend/` and `src/backend/` folders give you a clean conceptual split via thin re-export modules with READMEs that explain the boundary.
