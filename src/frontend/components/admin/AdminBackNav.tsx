import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useI18n } from "@/frontend/lib/i18n";
import { cn } from "@/frontend/lib/utils";

export function AdminBackNav({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("mb-2", className)}>
      <Button variant="ghost" size="sm" className="gap-2 -ms-2 h-9 px-2 text-muted-foreground hover:text-foreground" asChild>
        <Link to="/admin">
          <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />
          {t("adminBackToPanel")}
        </Link>
      </Button>
    </div>
  );
}
