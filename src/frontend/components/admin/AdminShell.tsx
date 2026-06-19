import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Check,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  SlidersHorizontal,
  ShoppingCart,
  Store,
  User,
  Users,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/frontend/components/ui/sheet";
import brandLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import { useAdminPendingOrderCount } from "@/frontend/hooks/useAdminPendingOrderCount";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n, isRTL, type Lang } from "@/frontend/lib/i18n";
import { unlockOrderNotificationAudio } from "@/frontend/lib/orderNotificationSound";
import { cn } from "@/frontend/lib/utils";

type NavItem = {
  to: string;
  match: (path: string) => boolean;
  labelKey:
    | "adminNavDashboard"
    | "adminNavInventory"
    | "adminNavOrders"
    | "adminNavCustomers"
    | "adminNavSettings";
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  {
    to: "/admin",
    match: (p) => p === "/admin" || p === "/admin/",
    labelKey: "adminNavDashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/products",
    match: (p) => p.startsWith("/admin/products") || p.startsWith("/admin/categories"),
    labelKey: "adminNavInventory",
    icon: Package,
  },
  {
    to: "/admin/orders",
    match: (p) => p.startsWith("/admin/orders"),
    labelKey: "adminNavOrders",
    icon: ShoppingCart,
  },
  {
    to: "/admin/offers",
    match: (p) => p.startsWith("/admin/offers"),
    labelKey: "adminNavCustomers",
    icon: Users,
  },
  {
    to: "/admin/settings",
    match: (p) =>
      p.startsWith("/admin/settings") ||
      p.startsWith("/admin/availability") ||
      p.startsWith("/admin/rest-days"),
    labelKey: "adminNavSettings",
    icon: SlidersHorizontal,
  },
];

function AdminSidebarBody({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const { t, dir } = useI18n();
  const { user, signOut } = useAuth();

  const meta = user?.user_metadata as { full_name?: string } | undefined;
  const displayName =
    (meta?.full_name && String(meta.full_name).trim()) ||
    user?.email?.split("@")[0] ||
    t("admin");

  return (
    <div className={cn("flex h-full flex-col", className)} dir={dir}>
      <div className="flex items-center gap-3 px-1 pb-8 pt-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] font-display text-lg font-bold text-white shadow-sm"
          aria-hidden
        >
          A
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-[#1B4332]">
            {t("adminAppName")}
          </p>
          <p className="truncate font-sans text-xs text-muted-foreground">{t("brand")}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label={t("admin")}>
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#1B4332] text-white shadow-sm"
                  : "text-[#3C2A21]/70 hover:bg-[#F9F9F7] hover:text-[#1B4332]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/60 pt-5">
        <div className="rounded-2xl border border-border/80 bg-[#F9F9F7] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1B4332]/15 bg-white text-[#1B4332] shadow-sm">
              <User className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-[#3C2A21]">{displayName}</p>
              <p className="font-sans text-xs text-muted-foreground">{t("adminRoleShopManager")}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-8 w-full justify-start gap-2 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => void signOut()}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            {t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminNavbarLangAndShop({ onShopNavigate }: { onShopNavigate?: () => void }) {
  const { t, lang, setLang, dir } = useI18n();
  const pendingOrderCount = useAdminPendingOrderCount();
  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "he", label: "עברית" },
    { code: "ar", label: "العربية" },
  ];

  const bellLabel =
    pendingOrderCount > 0
      ? t("adminOrdersBellAriaWithPending").replace("{{n}}", String(pendingOrderCount))
      : t("adminOrdersBellAriaClear");

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" dir={dir}>
      <DropdownMenu dir={dir}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg border-[#3C2A21]/15 text-[#1B4332] hover:bg-[#1B4332]/[0.06]"
            aria-label={t("language")}
            aria-haspopup="menu"
          >
            <Globe className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={dir === "rtl" ? "start" : "end"}
          className="min-w-[10.5rem] rounded-lg border border-border bg-popover p-0 py-1 text-popover-foreground shadow-lg"
        >
          {langs.map((l) => (
            <DropdownMenuItem
              key={l.code}
              dir={l.code === "en" ? "ltr" : "rtl"}
              onClick={() => setLang(l.code)}
              className={cn(
                "flex w-full min-w-[10.5rem] cursor-pointer flex-row items-center gap-2 rounded-none py-2.5 ps-3 pe-4 text-sm",
                "focus:bg-muted/60 data-[highlighted]:bg-muted/60",
                l.code === lang
                  ? "focus:text-primary data-[highlighted]:text-primary"
                  : "text-popover-foreground focus:text-foreground data-[highlighted]:text-foreground",
                l.code === "ar" && "text-[15px] leading-snug",
              )}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                {l.code === lang ? <Check className="h-4 w-4 text-primary" strokeWidth={2.5} /> : null}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-start font-normal",
                  l.code === lang ? "font-semibold text-primary" : "text-popover-foreground",
                )}
              >
                {l.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        className="relative h-8 w-8 shrink-0 rounded-lg border-[#3C2A21]/15 text-[#1B4332] hover:bg-[#1B4332]/[0.06]"
        asChild
      >
        <Link
          to="/admin/orders"
          onClick={onShopNavigate}
          aria-label={bellLabel}
          title={t("adminOrdersBellOpen")}
        >
          <Bell className="h-4 w-4" strokeWidth={2} aria-hidden />
          {pendingOrderCount > 0 ? (
            <Badge
              variant="destructive"
              className="pointer-events-none absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 py-0 text-[10px] leading-none tabular-nums"
            >
              {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
            </Badge>
          ) : null}
        </Link>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg border-[#3C2A21]/15 text-[#1B4332] hover:bg-[#1B4332]/[0.06]"
        asChild
      >
        <Link to="/" onClick={onShopNavigate} aria-label={t("adminBackToShop")} title={t("adminBackToShop")}>
          <Store className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, lang, dir } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  /** `sheet.tsx` only supports left/right/top/bottom — not "start", which broke the drawer. */
  const sheetSide = isRTL(lang) ? "right" : "left";

  useEffect(() => {
    const unlock = () => unlockOrderNotificationAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F9F9F7] text-foreground">
      <aside
        dir={dir}
        className="sticky top-0 hidden h-screen w-[17.5rem] shrink-0 flex-col border-e border-[#3C2A21]/10 bg-white/95 px-5 py-8 shadow-[4px_0_24px_-12px_rgba(60,42,33,0.15)] lg:flex"
        aria-label={t("admin")}
      >
        <AdminSidebarBody pathname={pathname} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          dir={dir}
          className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#3C2A21]/10 bg-white/95 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4 lg:px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" dir="ltr">
                <div className="lg:hidden">
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg border-[#3C2A21]/15 text-[#1B4332] hover:bg-[#1B4332]/[0.06]"
                      aria-label={t("adminOpenMenu")}
                      aria-expanded={mobileOpen}
                    >
                      <Menu className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </Button>
                  </SheetTrigger>
                </div>
                <Link
                  to="/admin"
                  className="flex shrink-0 rounded-full ring-1 ring-[#1B4332]/12 transition-opacity hover:opacity-90"
                  aria-label={t("adminAppName")}
                >
                  <img
                    src={brandLogo}
                    alt=""
                    width={80}
                    height={80}
                    className="h-8 w-8 rounded-full object-contain sm:h-9 sm:w-9"
                  />
                </Link>
              </div>
              <SheetContent
                dir={dir}
                side={sheetSide}
                className="flex h-full max-h-[100dvh] w-[min(100%,20rem)] max-w-[20rem] flex-col overflow-y-auto overscroll-contain border-[#3C2A21]/10 p-5 pt-12 data-[state=open]:shadow-xl"
              >
                <AdminSidebarBody pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1 text-start leading-tight">
              <p className="truncate font-display text-sm font-semibold text-[#1B4332] sm:text-base">
                {t("adminAppName")}
              </p>
              <p className="truncate font-sans text-[10px] text-muted-foreground sm:text-[11px]">
                {t("brand")}
              </p>
            </div>
          </div>

          <AdminNavbarLangAndShop onShopNavigate={() => setMobileOpen(false)} />
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
