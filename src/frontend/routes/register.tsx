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

export const Route = createFileRoute("/register")({ component: RegisterPage });

const BADGE_LABELS: Record<string, string[]> = {
  en: ["100% Gluten-Free", "Baked Fresh Daily", "Certified Kosher"],
  he: ["100% ללא גלוטן", "אפייה טרייה יומית", "כשר למהדרין"],
  ar: ["خالٍ 100% من الغلوتين", "طازج يُخبز يومياً", "معتمد حلال"],
};

const BADGE_ICONS = [Wheat, Clock, ShieldCheck];

function RegisterPage() {
  const { t, lang } = useI18n();
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const badges = BADGE_LABELS[lang] ?? BADGE_LABELS.en;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signUp(form.email, form.password, form.name, form.phone);
    setBusy(false);
    if (error) {
      const e = error.toLowerCase();
      const msg =
        e.includes("already registered") || e.includes("already exists")
          ? t("emailAlreadyRegistered")
          : e.includes("too many")
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

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("fullName")}</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("phone")}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("email")}</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("password")}</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {t("register")}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 text-xs text-muted-foreground">{t("login")}?</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm">
          <Link
            to="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("login")}
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
