import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BarChart3, FolderTree, Mail, Package, ShoppingCart, Tag } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

type TileKeyPair = {
  titleKey:
    | "adminDashReportsTitle"
    | "products"
    | "categories"
    | "adminDashOrdersTitle"
    | "adminDashCouponsTitle"
    | "adminDashEmailOffersTitle";
  descKey:
    | "adminDashReportsDesc"
    | "adminDashProductsDesc"
    | "adminDashCategoriesDesc"
    | "adminDashOrdersDesc"
    | "adminDashCouponsDesc"
    | "adminDashEmailOffersDesc";
};

type LaunchTile = {
  to: string;
  icon: LucideIcon;
} & TileKeyPair;

function AdminDashboard() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const launchTiles: LaunchTile[] = [
    { to: "/admin/products", icon: Package, titleKey: "products", descKey: "adminDashProductsDesc" },
    { to: "/admin/categories", icon: FolderTree, titleKey: "categories", descKey: "adminDashCategoriesDesc" },
    {
      to: "/admin/orders",
      icon: ShoppingCart,
      titleKey: "adminDashOrdersTitle",
      descKey: "adminDashOrdersDesc",
    },
    { to: "/admin/coupons", icon: Tag, titleKey: "adminDashCouponsTitle", descKey: "adminDashCouponsDesc" },
    {
      to: "/admin/offers",
      icon: Mail,
      titleKey: "adminDashEmailOffersTitle",
      descKey: "adminDashEmailOffersDesc",
    },
    { to: "/admin/reports", icon: BarChart3, titleKey: "adminDashReportsTitle", descKey: "adminDashReportsDesc" },
  ];

  const isTileActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="space-y-10 p-6 md:p-8">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("adminPanelTitle")}
        </h1>
      </header>

      <section aria-label={t("adminPanelTitle")}>
        <h2 className="sr-only">{t("adminPanelTitle")}</h2>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,13.5rem),1fr))]">
          {launchTiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className={cn(
                "group flex min-h-[7.75rem] flex-col rounded-xl border border-border bg-muted/35 p-4 text-start shadow-sm transition-all",
                "hover:-translate-y-0.5 hover:border-primary/45 hover:bg-muted/55 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isTileActive(tile.to) &&
                  "border-primary/60 bg-primary/[0.08] shadow-md ring-1 ring-primary/15",
              )}
            >
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 font-display text-[15px] font-semibold leading-snug text-foreground">
                    {t(tile.titleKey)}
                  </span>
                  <tile.icon
                    className="h-[1.125rem] w-[1.125rem] shrink-0 text-primary opacity-85 transition-opacity group-hover:opacity-100"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(tile.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
