import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

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
    }
    else {
      toast.success(t("accountCreatedSuccess"));
      nav({ to: "/login" });
    }
  };

  return (
    <div className="admin-page-enter container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="section-card-enter w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg" style={{ animationDelay: "40ms" }}>
        <h1 className="page-title-enter font-display text-3xl font-bold" style={{ animationDelay: "80ms" }}>{t("register")}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>{t("fullName")}</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>{t("email")}</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>{t("password")}</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {t("register")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("login")}?{" "}
          <Link to="/login" className="text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
