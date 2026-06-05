import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/frontend/lib/cookieConsentContext";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";
import { CookiePreferenceSwitch } from "@/frontend/components/cookies/CookiePreferenceSwitch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";

type CategoryRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  alwaysOn?: boolean;
  alwaysOnLabel?: string;
};

function CategoryRow({
  title,
  description,
  checked,
  onCheckedChange,
  alwaysOn,
  alwaysOnLabel,
}: CategoryRowProps) {
  return (
    <div className="flex gap-3 border-b border-primary/10 py-3 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center pt-0.5">
        {alwaysOn ? (
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {alwaysOnLabel}
          </span>
        ) : (
          <CookiePreferenceSwitch
            checked={checked ?? false}
            onCheckedChange={onCheckedChange!}
            aria-label={title}
          />
        )}
      </div>
    </div>
  );
}

export function CookiePreferencesModal() {
  const { t } = useI18n();
  const {
    consent,
    modalOpen,
    closePreferences,
    savePreferences,
    acceptAll,
    rejectNonEssential,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    setPreferences(consent?.preferences ?? true);
    setAnalytics(consent?.analytics ?? false);
    setMarketing(consent?.marketing ?? false);
  }, [modalOpen, consent]);

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent
        className="gap-0 w-[min(calc(100%-2rem),22rem)] max-w-[22rem] overflow-hidden rounded-xl border-primary/15 p-0 shadow-2xl"
        aria-describedby="cookie-preferences-desc"
      >
        <div className="border-b border-primary/10 bg-primary/[0.04] px-4 py-3.5">
          <DialogHeader className="space-y-1 text-start">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Cookie className="h-4 w-4" aria-hidden />
              </span>
              <DialogTitle className="font-display text-base font-bold text-primary">
                {t("cookiePreferencesTitle")}
              </DialogTitle>
            </div>
            <DialogDescription
              id="cookie-preferences-desc"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {t("cookiePreferencesIntro")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[min(50vh,16rem)] overflow-y-auto px-4 py-2">
          <CategoryRow
            title={t("cookieEssentialTitle")}
            description={t("cookieEssentialDesc")}
            alwaysOn
            alwaysOnLabel={t("cookieAlwaysOn")}
          />
          <CategoryRow
            title={t("cookiePreferencesTitleCat")}
            description={t("cookiePreferencesDesc")}
            checked={preferences}
            onCheckedChange={setPreferences}
          />
          <CategoryRow
            title={t("cookieAnalyticsTitle")}
            description={t("cookieAnalyticsDesc")}
            checked={analytics}
            onCheckedChange={setAnalytics}
          />
          <CategoryRow
            title={t("cookieMarketingTitle")}
            description={t("cookieMarketingDesc")}
            checked={marketing}
            onCheckedChange={setMarketing}
          />
        </div>

        <DialogFooter className="gap-2 border-t border-primary/10 bg-secondary/20 px-4 py-3 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            size="sm"
            className="h-9 w-full rounded-lg"
            onClick={() => savePreferences({ preferences, analytics, marketing })}
          >
            {t("cookieSavePreferences")}
          </Button>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-lg border-primary/25 text-xs"
              onClick={acceptAll}
            >
              {t("cookieAcceptAll")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground"
              onClick={rejectNonEssential}
            >
              {t("cookieRejectNonEssential")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
