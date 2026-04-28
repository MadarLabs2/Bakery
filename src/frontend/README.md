# Frontend

All client-side / UI code for the Gluten-Free Bakery web app.

## What lives here (or is re-exported here)

- **Pages** → `../routes/*.tsx`
  TanStack Start requires route files to live in `src/routes/` for its
  file-based router. Each file there is a frontend page (Home, Products,
  Cart, Checkout, Login, Admin dashboard, etc.).

- **Components** → `./components/`
  Re-exports of `Header`, `Footer`, `ProductCard`, plus all shadcn UI primitives
  (`button`, `input`, `card`, ...). Original sources live in `src/components/`.

- **State / Contexts** → `./state/`
  React contexts the UI uses to manage auth session, shopping cart and i18n
  language. Re-exports from `src/lib/{auth,cart,i18n}.tsx`.

- **Assets / Styles** → `src/assets/`, `src/styles.css`

## What does NOT live here

Anything that talks to the database directly, anything that runs on the
server, or anything that holds secrets — see `src/backend/README.md`.
