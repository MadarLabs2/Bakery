import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Tag,
  Mail,
  LogOut,
  Wheat,
} from "lucide-react";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) {
      nav({ to: "/login" });
    }
  }, [user, isAdmin, loading, nav]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/coupons", label: "Coupons", icon: Tag },
    { to: "/admin/offers", label: "Email Offers", icon: Mail },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <Link
          to="/"
          className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-primary"
        >
          <Wheat className="h-5 w-5" /> Admin
        </Link>
        <nav className="flex-1 space-y-1">
          {links.map((l) => {
            const active = l.exact ? path === l.to : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to as any}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            nav({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </aside>
      <main className="flex-1 overflow-auto bg-background">
        <div className="md:hidden border-b bg-card p-3 overflow-x-auto">
          <div className="flex gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to as any}
                className="whitespace-nowrap rounded-md border px-3 py-1.5 text-xs"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
