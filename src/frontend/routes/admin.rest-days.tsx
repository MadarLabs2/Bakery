import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/rest-days")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/availability" });
  },
});
