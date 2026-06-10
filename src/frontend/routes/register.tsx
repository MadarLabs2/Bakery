import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wheat, Clock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import brandLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { cn } from "@/frontend/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

// Israeli mobile/VoIP numbers: exactly 10 digits, starting with 05X or 07X-09X
const ISRAEL_PHONE_RE = /^0[5-9]\d{8}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const REGISTER_FOOTER: Record<string, { question: string; cta: string }> = {
  en: { question: "Already have an account?", cta: "Sign in to your account" },
  he: { question: "כבר יש לך חשבון?", cta: "כניסה לחשבון קיים" },
  ar: { question: "هل لديك حساب بالفعل؟", cta: "تسجيل الدخول إلى حسابك" },
};

const BADGE_LABELS: Record<string, string[]> = {
  en: ["100% Gluten-Free", "Baked Fresh Daily", "Certified Kosher"],
  he: ["100% ללא גלוטן", "אפייה טרייה יומית", "כשר למהדרין"],
  ar: ["خالٍ 100% من الغلوتين", "طازج يُخبز يومياً", "معتمد حلال"],
};

const BADGE_ICONS = [Wheat, Clock, ShieldCheck];

type FormErrors = Partial<Record<"name" | "phone" | "email" | "password", string>>;

function RegisterPage() {
  const { t, lang } = useI18n();
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const badges = BADGE_LABELS[lang] ?? BADGE_LABELS.en;
  const registerFooter = REGISTER_FOOTER[lang] ?? REGISTER_FOOTER.en;

  function validate(fields: typeof form): FormErrors {
    const errs: FormErrors = {};

    if (!fields.name.trim()) errs.name = t("fieldRequired");
    else if (fields.name.trim().length < 2) errs.name = t("nameMinLength");

    if (!fields.phone) errs.phone = t("fieldRequired");
    else if (!ISRAEL_PHONE_RE.test(fields.phone)) errs.phone = t("phoneInvalidIsrael");

    if (!fields.email.trim()) errs.email = t("fieldRequired");
    else if (!EMAIL_RE.test(fields.email.trim())) errs.email = t("invalidEmail");

    if (!fields.password) errs.password = t("fieldRequired");
    else if (fields.password.length < 8) errs.password = t("passwordMinLength");

    return errs;
  }

  function handleBlur(field: keyof typeof form) {
    const fieldErrs = validate(form);
    setErrors((prev) => {
      if (fieldErrs[field]) return { ...prev, [field]: fieldErrs[field] };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
    if (errors.phone && ISRAEL_PHONE_RE.test(digits)) {
      setErrors((prev) => { const next = { ...prev }; delete next.phone; return next; });
    }
  }

  function handleEmailChange(value: string) {
    setForm((prev) => ({ ...prev, email: value }));
    if (errors.email && EMAIL_RE.test(value.trim())) {
      setErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
    }
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({ ...prev, name: value }));
    if (errors.name && value.trim().length >= 2) {
      setErrors((prev) => { const next = { ...prev }; delete next.name; return next; });
    }
  }

  function handlePasswordChange(value: string) {
    setForm((prev) => ({ ...prev, password: value }));
    if (errors.password && value.length >= 8) {
      setErrors((prev) => { const next = { ...prev }; delete next.password; return next; });
    }
  }

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setBusy(true);
    const { error } = await signUp(form.email.trim(), form.password, form.name.trim(), form.phone);
    setBusy(false);
    if (error) {
      const msg =
        error.toLowerCase().includes("already registered") || error.toLowerCase().includes("already exists")
          ? t("emailAlreadyRegistered")
          : error.toLowerCase().includes("too many")
          ? t("tooManyAuthAttempts")
          : t("genericError");
      toast.error(msg);
    } else {
      toast.success(t("accountCreatedSuccess"));
      nav({ to: "/login" });
    }
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
          {t("register")}
        </h1>

        <form onSubmit={submit} noValidate className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">{t("fullName")}</Label>
            <Input
              id="reg-name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-phone">{t("phone")}</Label>
            <Input
              id="reg-phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur("phone")}
              maxLength={10}
              aria-invalid={!!errors.phone}
              className={cn("tracking-wider", errors.phone && "border-destructive focus-visible:ring-destructive")}
              dir="ltr"
            />
            {errors.phone && (
              <p className="text-xs text-destructive" role="alert">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">{t("email")}</Label>
            <Input
              id="reg-email"
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.email && (
              <p className="text-xs text-destructive" role="alert">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!errors.password}
                className={cn("pe-10", errors.password && "border-destructive focus-visible:ring-destructive")}
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
            {errors.password ? (
              <p className="text-xs text-destructive" role="alert">{errors.password}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("passwordHelp")}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {t("register")}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-sm text-muted-foreground">{registerFooter.question}</p>
          <Button asChild variant="outline" className="mt-3 h-10 w-full font-semibold">
            <Link to="/login">{registerFooter.cta}</Link>
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
