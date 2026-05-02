import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { t } = useI18n();
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      nav({ to: "/login" });
    }
  }, [user, isAdmin, loading, nav]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t("adminLoading")}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {t("adminRedirecting")}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <Outlet />
    </div>
  );
}
