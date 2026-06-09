import { createFileRoute } from "@tanstack/react-router";
import { Wheat, Heart, Award } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/about")({ component: AboutPage });

const ICONS = [Wheat, Heart, Award];
const DELAYS = ["0.22s", "0.32s", "0.42s"];

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="page-title-enter font-display text-5xl font-bold">{t("about1")}</h1>
      <p
        className="page-section-enter mt-6 text-lg text-muted-foreground leading-relaxed"
        style={{ animationDelay: "0.12s" }}
      >
        {t("aboutBody")}
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            className="about-icon-card about-icon-card-enter rounded-2xl border bg-card p-6 text-center"
            style={{ animationDelay: DELAYS[i] }}
          >
            <Icon className="mx-auto h-8 w-8 text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}
