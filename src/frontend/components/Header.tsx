import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Globe, ShoppingBag, User as UserIcon, Menu } from "lucide-react";
import brandLogo from "@/frontend/assets/brand-logo.png";
import { useEffect, useState } from "react";
import { useI18n, type Lang, isRTL } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/frontend/components/ui/dropdown-menu";
import { cn } from "@/frontend/lib/utils";

/** No tan accent square on tap; icon uses brand green on hover / active / open (Radix). */
const headerIconGhost =
  "hover:bg-transparent active:bg-transparent focus-visible:bg-transparent data-[state=open]:bg-transparent " +
  "hover:text-primary active:text-primary data-[state=open]:text-primary";

/** Warm cream (#FDF6EC) instead of theme accent on profile trigger + user menu rows */
const profileTouchCream =
  "hover:bg-[#FDF6EC] active:bg-[#FDF6EC] focus-visible:bg-[#FDF6EC] data-[state=open]:bg-[#FDF6EC] " +
  "hover:text-primary active:text-primary data-[state=open]:text-primary focus-visible:ring-primary/30";

const profileMenuItemCream =
  "w-full justify-start text-start focus:bg-[#FDF6EC] data-[highlighted]:bg-[#FDF6EC] hover:bg-[#FDF6EC] active:bg-[#FDF6EC] " +
  "focus:text-foreground data-[highlighted]:text-foreground hover:text-foreground";

export function Header() {
  const { t, lang, setLang } = useI18n();
  /** Popper משתמש ב־Floating UI עם יישור פיזי: `end` = קצה ימין של ההפעלה מוצמד לקצה ימין של הכפתור (גם בתפריט RTL). */
  const headerDropdownAlign = "end" as const;
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const langs: { code: Lang; label: string }[] = [
    { code: "en", label: "English" },
    { code: "he", label: "עברית" },
    { code: "ar", label: "العربية" },
  ];

  const links = (
    <>
      <Link
        to="/"
        className="hover:text-primary transition-colors"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {t("home")}
      </Link>
      <Link
        to="/products"
        className="hover:text-primary transition-colors"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {t("products")}
      </Link>
      <Link
        to="/categories"
        className="hover:text-primary transition-colors"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {t("categories")}
      </Link>
      <Link
        to="/about"
        className="hover:text-primary transition-colors"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {t("about")}
      </Link>
      <Link
        to="/contact"
        className="hover:text-primary transition-colors"
        activeProps={{ className: "text-primary font-semibold" }}
      >
        {t("contact")}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div
          className="flex min-w-0 flex-1 flex-row items-center justify-end gap-2 sm:gap-3 md:max-w-none md:flex-none"
          dir="ltr"
        >
          <Link
            to="/"
            dir={isRTL(lang) ? "rtl" : "ltr"}
            className="flex min-w-0 max-w-[min(100%,16rem)] items-center gap-2 sm:max-w-none sm:gap-3 md:max-w-none md:gap-3"
          >
            <img
              src={brandLogo}
              alt=""
              width={160}
              height={80}
              className="h-9 w-auto shrink-0 object-contain object-left md:h-11"
            />
            <span className="font-display text-sm font-bold leading-tight text-primary sm:text-base md:text-lg">
              {t("brand")}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn("shrink-0 md:hidden", headerIconGhost)}
            onClick={() => setOpen((o) => !o)}
            aria-controls="mobile-nav-menu"
            aria-expanded={open}
            aria-label={t("menu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">{links}</nav>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu dir={isRTL(lang) ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("shrink-0", headerIconGhost)}
                aria-label={t("language")}
              >
                <Globe className="h-5 w-5" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={headerDropdownAlign}
              className="min-w-[10.5rem] rounded-lg border border-border bg-popover p-0 py-1 text-popover-foreground shadow-lg"
            >
              {langs.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  dir="ltr"
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "flex w-full min-w-[10.5rem] flex-row items-center gap-2 rounded-none py-2.5 pl-3 pr-4 text-sm",
                    "focus:bg-muted/60 data-[highlighted]:bg-muted/60",
                    l.code === lang
                      ? "focus:text-primary data-[highlighted]:text-primary"
                      : "text-popover-foreground focus:text-foreground data-[highlighted]:text-foreground",
                    l.code === "ar" && "text-[15px] leading-snug",
                  )}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    {l.code === lang ? (
                      <Check className="h-4 w-4 text-primary" strokeWidth={2.5} aria-hidden />
                    ) : null}
                  </span>
                  <span
                    dir={l.code === "en" ? "ltr" : "rtl"}
                    className={cn(
                      "min-w-0 flex-1 text-right font-normal",
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
            variant="ghost"
            size="icon"
            onClick={() => nav({ to: "/cart" })}
            className={cn("relative", headerIconGhost)}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>

          <DropdownMenu dir={isRTL(lang) ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={profileTouchCream}>
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={headerDropdownAlign}>
              <div
                dir={isRTL(lang) ? "rtl" : "ltr"}
                className="flex min-w-[10rem] flex-col"
              >
                {user ? (
                  <>
                    <DropdownMenuItem
                      className={profileMenuItemCream}
                      onClick={() => nav({ to: "/orders" })}
                    >
                      {t("myOrders")}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        className={profileMenuItemCream}
                        onClick={() => nav({ to: "/admin" })}
                      >
                        {t("admin")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={profileMenuItemCream}
                      onClick={async () => {
                        await signOut();
                        nav({ to: "/" });
                      }}
                    >
                      {t("logout")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className={profileMenuItemCream}
                      onClick={() => nav({ to: "/login" })}
                    >
                      {t("login")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={profileMenuItemCream}
                      onClick={() => nav({ to: "/register" })}
                    >
                      {t("register")}
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200 md:hidden"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav-menu"
            role="navigation"
            aria-label={t("menu")}
            className="fixed left-0 right-0 top-16 z-[61] flex max-h-[min(75dvh,520px)] flex-col gap-3 overflow-y-auto border-b border-border/80 bg-background/98 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 zoom-in-[0.99] duration-300 ease-out md:hidden"
            onClick={() => setOpen(false)}
          >
            {links}
          </nav>
        </>
      )}
    </header>
  );
}
