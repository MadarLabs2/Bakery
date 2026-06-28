import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wheat, Clock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import brandLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/frontend/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const LOGIN_FOOTER: Record<string, { question: string; cta: string }> = {
  en: { question: "Don't have an account yet?", cta: "Create a free account" },
  he: { question: "עדיין אין לך חשבון?", cta: "יצירת חשבון חינמי" },
  ar: { question: "ليس لديك حساب بعد؟", cta: "إنشاء حساب مجاني" },
};

const BADGE_LABELS: Record<string, string[]> = {
  en: ["100% Gluten-Free", "Baked Fresh Daily", "Certified Kosher"],
  he: ["100% ללא גלוטן", "אפייה טרייה יומית", "כשר למהדרין"],
  ar: ["خالٍ 100% من الغلوتين", "طازج يُخبز يومياً", "معتمد حلال"],
};

const BADGE_ICONS = [Wheat, Clock, ShieldCheck];

function LoginPage() {
  const { t, lang } = useI18n();
  const { signIn, refreshIsAdmin, user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const badges = BADGE_LABELS[lang] ?? BADGE_LABELS.en;
  const loginFooter = LOGIN_FOOTER[lang] ?? LOGIN_FOOTER.en;

  useEffect(() => {
    if (authLoading || !user) return;
    void refreshIsAdmin().then((isAdmin) => {
      nav({ to: isAdmin ? "/admin" : "/orders", replace: true });
    });
  }, [authLoading, user, refreshIsAdmin, nav]);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError && EMAIL_RE.test(value.trim())) setEmailError("");
  }

  function handleEmailBlur() {
    if (!email.trim()) setEmailError(t("fieldRequired"));
    else if (!EMAIL_RE.test(email.trim())) setEmailError(t("invalidEmail"));
    else setEmailError("");
  }

  function handlePasswordBlur() {
    if (!password) setPasswordError(t("fieldRequired"));
    else setPasswordError("");
  }

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();

    let hasError = false;
    if (!email.trim()) { setEmailError(t("fieldRequired")); hasError = true; }
    else if (!EMAIL_RE.test(email.trim())) { setEmailError(t("invalidEmail")); hasError = true; }
    if (!password) { setPasswordError(t("fieldRequired")); hasError = true; }
    if (hasError) return;

    setBusy(true);
    const { error } = await signIn(email.trim(), password);
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
    setBusy(false);
    toast.success(t("welcomeBack"));
    nav({ to: isAdmin ? "/admin" : "/" });
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-background px-4 py-12">

      {/* Brand header */}
      <div className="admin-header-enter mb-8 flex flex-col items-center gap-3 text-center">
        <img
          src={brandLogo}
          alt=""
          className="h-20 w-20 rounded-full object-contain shadow-sm ring-2 ring-[#c9a962]/50"
        />
        <div>
          <p className="font-display text-2xl font-bold text-foreground">{t("brand")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="admin-section-enter w-full max-w-sm rounded-2xl border border-border bg-card px-8 py-8 shadow-lg shadow-stone-200/60"
        style={{ animationDelay: "80ms" }}
      >
        <h1
          className="page-title-enter mb-6 text-center font-display text-xl font-bold text-foreground"
          style={{ animationDelay: "140ms" }}
        >
          {t("login")}
        </h1>

        <form onSubmit={submit} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email">{t("email")}</Label>
            <Input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              aria-invalid={!!emailError}
              className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
            />
            {emailError && (
              <p className="text-xs text-destructive" role="alert">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="login-password">{t("password")}</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("forgotPasswordLink")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                onBlur={handlePasswordBlur}
                aria-invalid={!!passwordError}
                className={cn("pe-10", passwordError && "border-destructive focus-visible:ring-destructive")}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive" role="alert">{passwordError}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {t("login")}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-sm text-muted-foreground">{loginFooter.question}</p>
          <Button asChild variant="outline" className="mt-3 h-10 w-full font-semibold">
            <Link to="/register">{loginFooter.cta}</Link>
          </Button>
        </div>
      </div>

      {/* Trust badges */}
      <div
        className="admin-section-enter mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        style={{ animationDelay: "200ms" }}
      >
        {BADGE_ICONS.map((Icon, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-[#1B4332]" strokeWidth={1.75} />
            <span>{badges[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
