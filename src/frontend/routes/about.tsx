import { createFileRoute } from "@tanstack/react-router";
import { Wheat, Heart, Award } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-5xl font-bold">{t("about1")}</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("aboutBody")}</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[Wheat, Heart, Award].map((Icon, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 text-center">
            <Icon className="mx-auto h-8 w-8 text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}
