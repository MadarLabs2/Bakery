import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Label } from "@/frontend/components/ui/label";
import { PasswordInput } from "@/frontend/components/auth/PasswordInput";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "@/frontend/lib/authPassword";

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let ready = false;

    const markReady = () => {
      if (cancelled || ready) return;
      ready = true;
      setRecoveryReady(true);
      setSessionError(false);
      setCheckingSession(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        markReady();
      } else if (session) {
        markReady();
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) console.error("getSession:", error);
      if (data.session) markReady();
    });

    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      void supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        if (data.session) {
          markReady();
          return;
        }
        if (!ready) setSessionError(true);
        setCheckingSession(false);
      });
    }, 3000);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setFormError(null);

    const validationKey = validateNewPassword(password, confirm);
    if (validationKey) {
      setFieldError(t(validationKey));
      return;
    }

    if (!recoveryReady) {
      setSessionError(true);
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      console.error("updateUser password:", error);
      const msg = error.message.toLowerCase();
      if (
        msg.includes("session") ||
        msg.includes("jwt") ||
        msg.includes("expired") ||
        msg.includes("invalid")
      ) {
        setSessionError(true);
      } else {
        setFormError(error.message || t("genericError"));
      }
      return;
    }

    setSuccess(true);
    await signOut();
    window.setTimeout(() => {
      void nav({ to: "/login" });
    }, 2200);
  };

  const showExpired = !checkingSession && (sessionError || !recoveryReady) && !success;

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-primary/15 bg-card p-8 shadow-lg">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-bold text-primary">{t("createNewPassword")}</h1>

        {checkingSession ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
        ) : null}

        {success ? (
          <div
            className="mt-6 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{t("passwordUpdatedSuccess")}</span>
          </div>
        ) : showExpired ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-destructive" role="alert">
              {t("resetLinkInvalidOrExpired")}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/forgot-password">{t("sendResetLink")}</Link>
            </Button>
          </div>
        ) : !checkingSession ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="new-password">{t("newPassword")}</Label>
              <PasswordInput
                id="new-password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={busy}
                aria-invalid={Boolean(fieldError)}
              />
              <p className="mt-1 text-xs text-muted-foreground">{t("passwordHelp")}</p>
            </div>
            <div>
              <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
              <PasswordInput
                id="confirm-password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                disabled={busy}
                aria-invalid={Boolean(fieldError)}
              />
            </div>
            {fieldError ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldError}
              </p>
            ) : null}
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? t("updatingPassword") : t("updatePassword")}
            </Button>
          </form>
        ) : null}

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
