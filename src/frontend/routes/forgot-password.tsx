import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  getPasswordResetRedirectUrl,
  validateResetEmail,
} from "@/frontend/lib/authPassword";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setFormError(null);

    const validationKey = validateResetEmail(email);
    if (validationKey) {
      setFieldError(t(validationKey));
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    setBusy(false);

    if (error) {
      console.error("resetPasswordForEmail:", error);
      const msg = error.message.toLowerCase();
      if (msg.includes("redirect") || msg.includes("url")) {
        setFormError(t("passwordResetRedirectNotConfigured"));
      } else {
        setFormError(t("passwordResetRequestFailed"));
      }
      return;
    }

    setSent(true);
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-primary/15 bg-card p-8 shadow-lg">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-bold text-primary">{t("forgotPassword")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("forgotPasswordSubtitle")}</p>

        {sent ? (
          <div
            className="mt-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            {t("passwordResetLinkSent")}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="forgot-email">{t("email")}</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError(null);
                  setFormError(null);
                }}
                disabled={busy}
                aria-invalid={Boolean(fieldError)}
                className="mt-1"
              />
              {fieldError ? (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {fieldError}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? t("sendingResetLink") : t("sendResetLink")}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
