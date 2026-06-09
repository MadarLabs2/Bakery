import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t } = useI18n();
  const { signIn, refreshIsAdmin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email, password);
    if (error) {
      const e = error.toLowerCase();
      const msg =
        e.includes("invalid login") || e.includes("invalid credentials")
          ? t("invalidLoginCredentials")
          : e.includes("email not confirmed")
          ? t("emailNotConfirmed")
          : e.includes("too many")
          ? t("tooManyAuthAttempts")
          : t("genericError");
      toast.error(msg);
      setBusy(false);
      return;
    }
    const isAdmin = await refreshIsAdmin();
    toast.success(t("welcomeBack"));
    nav({ to: isAdmin ? "/admin" : "/" });
    setBusy(false);
  };

  return (
    <div className="admin-page-enter container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="section-card-enter w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg" style={{ animationDelay: "40ms" }}>
        <h1 className="page-title-enter font-display text-3xl font-bold" style={{ animationDelay: "80ms" }}>{t("login")}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>{t("email")}</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <Label>{t("password")}</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("forgotPasswordLink")}
              </Link>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {t("login")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("register")}?{" "}
          <Link to="/register" className="text-primary hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
