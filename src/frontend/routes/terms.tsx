import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LEGAL_PLACEHOLDERS } from "@/config/legalPlaceholders";
import {
  LegalDocumentLayout,
  PolicyList,
  PolicySection,
} from "@/frontend/components/legal/LegalDocumentLayout";
import { useI18n } from "@/frontend/lib/i18n";
import { legalSharedT } from "@/frontend/lib/legalShared.i18n";
import {
  termsList,
  termsT,
  type TermsDictKey,
} from "@/frontend/lib/termsPolicy.i18n";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Al-Nour Gluten-Free Bakery" },
      {
        name: "description",
        content:
          "Terms and conditions for using our gluten-free bakery website, placing orders, and creating an account.",
      },
    ],
  }),
});

const TOC: { id: string; key: TermsDictKey }[] = [
  { id: "acceptance", key: "termsToc1" },
  { id: "eligibility", key: "termsToc2" },
  { id: "accounts", key: "termsToc3" },
  { id: "orders-payments", key: "termsToc4" },
  { id: "delivery-pickup", key: "termsToc5" },
  { id: "cancellation-refunds", key: "termsToc6" },
  { id: "availability", key: "termsToc7" },
  { id: "allergens", key: "termsToc8" },
  { id: "responsibilities", key: "termsToc9" },
  { id: "intellectual-property", key: "termsToc10" },
  { id: "prohibited", key: "termsToc11" },
  { id: "liability", key: "termsToc12" },
  { id: "third-party", key: "termsToc13" },
  { id: "privacy", key: "termsToc14" },
  { id: "termination", key: "termsToc15" },
  { id: "changes", key: "termsToc16" },
  { id: "governing-law", key: "termsToc17" },
  { id: "contact", key: "termsToc18" },
];

function TermsPage() {
  const { lang, t } = useI18n();
  const { bakeryName, email, websiteUrl, phone, address, jurisdiction } = LEGAL_PLACEHOLDERS;
  const vars = { bakeryName, email, websiteUrl, jurisdiction };
  const tt = (key: TermsDictKey) => termsT(key, lang, vars);
  const tl = (...keys: TermsDictKey[]) => termsList(keys, lang, vars);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${termsT("termsTitle", lang)} | ${t("brand")}`;
    }
  }, [lang, t]);

  const shell = {
    legalBadge: tt("termsLegalBadge"),
    questionsTitle: tt("termsQuestionsTitle"),
    questionsBody: tt("termsQuestionsBody"),
  };

  return (
    <LegalDocumentLayout title={tt("termsTitle")} subtitle={tt("termsSubtitle")} shell={shell}>
      <nav
        aria-label={legalSharedT("legalTocAria", lang)}
        className="rounded-xl border bg-secondary/40 p-6 not-prose"
      >
        <p className="text-sm font-semibold text-foreground">
          {legalSharedT("legalOnThisPage", lang)}
        </p>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {TOC.map((item, i) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-primary hover:underline">
                {i + 1}. {tt(item.key)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <PolicySection id="acceptance" title={tt("termsSec1Title")}>
        <p>{tt("termsSec1P1")}</p>
        <p>{tt("termsSec1P2")}</p>
      </PolicySection>

      <PolicySection id="eligibility" title={tt("termsSec2Title")}>
        <p>{tt("termsSec2P1")}</p>
        <p>{tt("termsSec2P2")}</p>
      </PolicySection>

      <PolicySection id="accounts" title={tt("termsSec3Title")}>
        <p>{tt("termsSec3P1")}</p>
        <PolicyList items={tl("termsSec3L1", "termsSec3L2", "termsSec3L3")} />
      </PolicySection>

      <PolicySection id="orders-payments" title={tt("termsSec4Title")}>
        <p>{tt("termsSec4P1")}</p>
        <p>{tt("termsSec4P2")}</p>
        <p>{tt("termsSec4P3")}</p>
      </PolicySection>

      <PolicySection id="delivery-pickup" title={tt("termsSec5Title")}>
        <p>{tt("termsSec5P1")}</p>
        <PolicyList items={tl("termsSec5L1", "termsSec5L2")} />
        <p>{tt("termsSec5P2")}</p>
      </PolicySection>

      <PolicySection id="cancellation-refunds" title={tt("termsSec6Title")}>
        <p>{tt("termsSec6P1")}</p>
        <p>{tt("termsSec6P2")}</p>
      </PolicySection>

      <PolicySection id="availability" title={tt("termsSec7Title")}>
        <p>{tt("termsSec7P1")}</p>
        <p>{tt("termsSec7P2")}</p>
      </PolicySection>

      <PolicySection id="allergens" title={tt("termsSec8Title")}>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-foreground dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm leading-relaxed">{tt("termsSec8P1")}</p>
        </div>
        <p>{tt("termsSec8P2")}</p>
      </PolicySection>

      <PolicySection id="responsibilities" title={tt("termsSec9Title")}>
        <p>{tt("termsSec9P1")}</p>
        <PolicyList
          items={tl("termsSec9L1", "termsSec9L2", "termsSec9L3", "termsSec9L4")}
        />
      </PolicySection>

      <PolicySection id="intellectual-property" title={tt("termsSec10Title")}>
        <p>{tt("termsSec10P1")}</p>
      </PolicySection>

      <PolicySection id="prohibited" title={tt("termsSec11Title")}>
        <p>{tt("termsSec11P1")}</p>
        <PolicyList
          items={tl("termsSec11L1", "termsSec11L2", "termsSec11L3", "termsSec11L4")}
        />
        <p className="font-medium text-foreground">{tt("termsSec11P2")}</p>
      </PolicySection>

      <PolicySection id="liability" title={tt("termsSec12Title")}>
        <p>{tt("termsSec12P1")}</p>
        <p>{tt("termsSec12P2")}</p>
      </PolicySection>

      <PolicySection id="third-party" title={tt("termsSec13Title")}>
        <p>{tt("termsSec13P1")}</p>
      </PolicySection>

      <PolicySection id="privacy" title={tt("termsSec14Title")}>
        <p>{tt("termsSec14P1")}</p>
        <p>
          <Link to="/privacy" className="text-primary font-medium hover:underline">
            {tt("termsSec14Link")}
          </Link>
        </p>
      </PolicySection>

      <PolicySection id="termination" title={tt("termsSec15Title")}>
        <p>{tt("termsSec15P1")}</p>
        <p>{tt("termsSec15P2")}</p>
      </PolicySection>

      <PolicySection id="changes" title={tt("termsSec16Title")}>
        <p>{tt("termsSec16P1")}</p>
      </PolicySection>

      <PolicySection id="governing-law" title={tt("termsSec17Title")}>
        <p>{tt("termsSec17P1")}</p>
      </PolicySection>

      <PolicySection id="contact" title={tt("termsSec18Title")}>
        <p>{tt("termsSec18P1")}</p>
        <div className="rounded-xl border bg-secondary/30 p-5 text-sm text-foreground not-prose">
          <p className="font-semibold">{bakeryName}</p>
          <p className="mt-2">
            {legalSharedT("legalContactEmail", lang)} {email}
          </p>
          <p>
            {legalSharedT("legalContactPhone", lang)} {phone}
          </p>
          <p>
            {legalSharedT("legalContactAddress", lang)} {address}
          </p>
          <p>
            {legalSharedT("legalContactWebsite", lang)} {websiteUrl}
          </p>
        </div>
        <p className="text-sm">{tt("termsSec18Disclaimer")}</p>
      </PolicySection>
    </LegalDocumentLayout>
  );
}
