import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-5xl font-bold">{t("contact")}</h1>
      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-8">
        <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /> 050-8588985</p>
        <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /> hello@alnour-bakery.com</p>
        <p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary" /> Israel</p>
      </div>
    </div>
  );
}
