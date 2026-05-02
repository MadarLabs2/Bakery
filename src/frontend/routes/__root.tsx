import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { I18nProvider } from "@/frontend/lib/i18n";
import { AuthProvider } from "@/frontend/lib/auth";
import { CartProvider } from "@/frontend/lib/cart";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { FloatingSocialLinks } from "@/frontend/components/FloatingSocialLinks";
import { Toaster } from "@/frontend/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Al-Nour Gluten-Free Bakery" },
      {
        name: "description",
        content: "Wholesome gluten-free breads, pastries, cakes and cookies — baked with love.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  return (
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          {!isAdmin && <Header />}
          <main className={isAdmin ? "" : "min-h-[60vh] pb-28 sm:pb-24"}>
            <Outlet />
          </main>
          {!isAdmin && <Footer />}
          {!isAdmin && <FloatingSocialLinks />}
          <Toaster richColors position="top-center" />
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
