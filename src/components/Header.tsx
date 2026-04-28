import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, User as UserIcon, Menu, Wheat } from "lucide-react";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "EN" }, { code: "he", label: "עב" }, { code: "ar", label: "ع" },
  ];

  const links = (
    <>
      <Link to="/" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{t("home")}</Link>
      <Link to="/products" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{t("products")}</Link>
      <Link to="/categories" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{t("categories")}</Link>
      <Link to="/about" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{t("about")}</Link>
      <Link to="/contact" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary font-semibold" }}>{t("contact")}</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <Wheat className="h-6 w-6" />
          <span className="hidden sm:inline">{t("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">{links}</nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-medium">
                {langs.find(l => l.code === lang)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {langs.map(l => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>{l.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => nav({ to: "/cart" })} className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><UserIcon className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem onClick={() => nav({ to: "/orders" })}>{t("myOrders")}</DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem onClick={() => nav({ to: "/admin" })}>{t("admin")}</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); nav({ to: "/" }); }}>{t("logout")}</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => nav({ to: "/login" })}>{t("login")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav({ to: "/register" })}>{t("register")}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(o => !o)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-3 text-sm" onClick={() => setOpen(false)}>
          {links}
        </nav>
      )}
    </header>
  );
}
