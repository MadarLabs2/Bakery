import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/frontend/lib/cookieConsentContext";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";
import { CookiePreferencesModal } from "@/frontend/components/cookies/CookiePreferencesModal";

const policyLinkClass =
  "font-medium text-primary underline decoration-primary/35 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary";

export function CookieConsentBanner() {
  const { t } = useI18n();
  const { bannerVisible, acceptAll, rejectNonEssential, openPreferences } = useCookieConsent();

  if (!bannerVisible) return <CookiePreferencesModal />;

  return (
    <>
      <div
        role="dialog"
        aria-labelledby="cookie-notice-title"
        aria-describedby="cookie-notice-desc"
        className="fixed bottom-3 start-0 end-0 z-40 mx-auto w-[min(calc(100%-2rem),25rem)] max-w-[25rem] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-card to-secondary/50 shadow-[0_8px_32px_rgba(27,67,50,0.14)] backdrop-blur-md sm:bottom-4 md:bottom-6 md:w-full md:max-w-[36rem] md:rounded-2xl lg:max-w-[40rem]"
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:h-1" aria-hidden />

        <div className="flex gap-3 px-3.5 py-3 md:gap-4 md:px-5 md:py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15 md:h-12 md:w-12"
            aria-hidden
          >
            <Cookie className="h-5 w-5 text-primary md:h-6 md:w-6" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="cookie-notice-title"
              className="font-display text-sm font-bold leading-tight tracking-tight text-primary md:text-lg"
            >
              {t("cookieNoticeTitle")}
            </h2>
            <p
              id="cookie-notice-desc"
              className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs md:mt-1.5 md:text-sm md:leading-relaxed"
            >
              {t("cookieNoticeMessageShort")}{" "}
              {t("cookieNoticeReadMore")}{" "}
              <Link to="/privacy" className={policyLinkClass}>
                {t("privacyPolicy")}
              </Link>
              <span className="text-primary/40"> · </span>
              <Link to="/privacy" hash="data-security" className={policyLinkClass}>
                {t("cookieNoticeSecurity")}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t border-primary/10 bg-background/40 px-3 py-2.5 md:gap-2.5 md:px-5 md:py-3.5">
          <Button
            type="button"
            size="sm"
            className="h-8 flex-1 rounded-lg text-xs font-semibold shadow-sm md:h-10 md:flex-none md:px-6 md:text-sm"
            onClick={acceptAll}
          >
            {t("cookieAccept")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 rounded-lg border-primary/25 bg-card/80 text-xs font-medium md:h-10 md:flex-none md:px-5 md:text-sm"
            onClick={openPreferences}
          >
            <span className="md:hidden">{t("cookieManageShort")}</span>
            <span className="hidden md:inline">{t("cookieManagePreferences")}</span>
          </Button>
          <button
            type="button"
            className="h-8 shrink-0 rounded-lg px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:h-10 md:px-4 md:text-sm"
            onClick={rejectNonEssential}
          >
            <span className="md:hidden">{t("cookieRejectShort")}</span>
            <span className="hidden md:inline">{t("cookieRejectNonEssential")}</span>
          </button>
        </div>
      </div>
      <CookiePreferencesModal />
    </>
  );
}
