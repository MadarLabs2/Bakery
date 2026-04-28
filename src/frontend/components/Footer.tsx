import { useI18n } from "@/frontend/lib/i18n";
import { Wheat, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t bg-secondary/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <Wheat className="h-5 w-5" /> {t("brand")}
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("tagline")}</p>
        </div>
        <div className="text-sm space-y-2">
          <h4 className="font-semibold mb-3">{t("contact")}</h4>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> 050-8588985
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> hello@alnour-bakery.com
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Israel
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3">{t("about1")}</h4>
          <p className="text-muted-foreground">{t("aboutBody")}</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("brand")}
      </div>
    </footer>
  );
}
