import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n } from "@/frontend/lib/i18n";

import { AdminShell } from "@/frontend/components/admin/AdminShell";
import { AdminPendingOrdersProvider } from "@/frontend/lib/AdminPendingOrdersContext";

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
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F9F9F7] px-4 text-muted-foreground dark:bg-background">
        {t("adminLoading")}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F9F9F7] px-4 text-muted-foreground dark:bg-background">
        {t("adminRedirecting")}
      </div>
    );
  }

  return (
    <AdminPendingOrdersProvider>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminPendingOrdersProvider>
  );
}
