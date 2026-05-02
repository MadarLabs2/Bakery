import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout: child routes render here — `/products/` (list) and `/products/$id` (detail). */
export const Route = createFileRoute("/products")({
  component: ProductsLayout,
});

function ProductsLayout() {
  return <Outlet />;
}
