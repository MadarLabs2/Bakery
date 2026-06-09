import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wheat, Clock, ShieldCheck } from "lucide-react";
import brandLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

const BADGE_LABELS: Record<string, string[]> = {
  en: ["100% Gluten-Free", "Baked Fresh Daily", "Certified Kosher"],
  he: ["100% ללא גלוטן", "אפייה טרייה יומית", "כשר למהדרין"],
  ar: ["خالٍ 100% من الغلوتين", "طازج يُخبز يومياً", "معتمد حلال"],
};

const BADGE_ICONS = [Wheat, Clock, ShieldCheck];

function LoginPage() {
  const { t, lang } = useI18n();
  const { signIn, refreshIsAdmin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const badges = BADGE_LABELS[lang] ?? BADGE_LABELS.en;

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

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("email")}</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>{t("password")}</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
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

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {t("login")}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 text-xs text-muted-foreground">{t("register")}?</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm">
          <Link
            to="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("register")}
          </Link>
        </p>
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
