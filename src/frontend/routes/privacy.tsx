import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LEGAL_PLACEHOLDERS } from "@/config/legalPlaceholders";
import {
  LegalDocumentLayout,
  PolicyList,
  PolicySection,
  PolicySubheading,
} from "@/frontend/components/legal/LegalDocumentLayout";
import { useI18n } from "@/frontend/lib/i18n";
import { legalSharedT } from "@/frontend/lib/legalShared.i18n";
import {
  privacyList,
  privacyT,
  type PrivacyDictKey,
} from "@/frontend/lib/privacyPolicy.i18n";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Al-Nour Gluten-Free Bakery" },
      {
        name: "description",
        content:
          "Learn how we collect, use, and protect your personal information when you order, create an account, or subscribe to our bakery.",
      },
    ],
  }),
});

const TOC: { id: string; key: PrivacyDictKey }[] = [
  { id: "introduction", key: "privacyToc1" },
  { id: "information-we-collect", key: "privacyToc2" },
  { id: "how-we-use-information", key: "privacyToc3" },
  { id: "cookies", key: "privacyToc4" },
  { id: "data-security", key: "privacyToc5" },
  { id: "third-party-services", key: "privacyToc6" },
  { id: "payment-processing", key: "privacyToc7" },
  { id: "user-rights", key: "privacyToc8" },
  { id: "account-deletion", key: "privacyToc9" },
  { id: "children", key: "privacyToc10" },
  { id: "data-retention", key: "privacyToc11" },
  { id: "changes", key: "privacyToc12" },
  { id: "contact", key: "privacyToc13" },
];

function PrivacyPolicyPage() {
  const { lang, t } = useI18n();
  const { bakeryName, email, websiteUrl, phone, address } = LEGAL_PLACEHOLDERS;
  const vars = { bakeryName, email, websiteUrl };
  const pt = (key: PrivacyDictKey) => privacyT(key, lang, vars);
  const pl = (...keys: PrivacyDictKey[]) => privacyList(keys, lang, vars);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${privacyT("privacyTitle", lang)} | ${t("brand")}`;
    }
  }, [lang, t]);

  const shell = {
    legalBadge: pt("privacyLegalBadge"),
    questionsTitle: pt("privacyQuestionsTitle"),
    questionsBody: pt("privacyQuestionsBody"),
  };

  return (
    <LegalDocumentLayout
      title={pt("privacyTitle")}
      subtitle={pt("privacySubtitle")}
      shell={shell}
    >
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
                {i + 1}. {pt(item.key)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <PolicySection id="introduction" title={pt("privacySec1Title")}>
        <p>{pt("privacySec1P1")}</p>
        <p>{pt("privacySec1P2")}</p>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-foreground dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold">{pt("privacyAllergenTitle")}</p>
          <p className="mt-2 text-sm leading-relaxed">{pt("privacyAllergenBody")}</p>
        </div>
      </PolicySection>

      <PolicySection id="information-we-collect" title={pt("privacySec2Title")}>
        <p>{pt("privacySec2Intro")}</p>
        <PolicySubheading>{pt("privacySec2PersonalH")}</PolicySubheading>
        <PolicyList
          items={pl("privacySec2Personal1", "privacySec2Personal2", "privacySec2Personal3")}
        />
        <PolicySubheading>{pt("privacySec2ContactH")}</PolicySubheading>
        <PolicyList
          items={pl("privacySec2Contact1", "privacySec2Contact2", "privacySec2Contact3")}
        />
        <PolicySubheading>{pt("privacySec2AccountH")}</PolicySubheading>
        <PolicyList
          items={pl("privacySec2Account1", "privacySec2Account2", "privacySec2Account3")}
        />
        <PolicySubheading>{pt("privacySec2OrderH")}</PolicySubheading>
        <PolicyList items={pl("privacySec2Order1", "privacySec2Order2", "privacySec2Order3")} />
        <PolicySubheading>{pt("privacySec2PaymentH")}</PolicySubheading>
        <PolicyList
          items={pl("privacySec2Payment1", "privacySec2Payment2", "privacySec2Payment3")}
        />
        <p>{pt("privacySec2Tech")}</p>
      </PolicySection>

      <PolicySection id="how-we-use-information" title={pt("privacySec3Title")}>
        <p>{pt("privacySec3Intro")}</p>
        <PolicyList
          items={pl(
            "privacySec3U1",
            "privacySec3U2",
            "privacySec3U3",
            "privacySec3U4",
            "privacySec3U5",
            "privacySec3U6",
            "privacySec3U7",
            "privacySec3U8",
          )}
        />
        <p>{pt("privacySec3Outro")}</p>
      </PolicySection>

      <PolicySection id="cookies" title={pt("privacySec4Title")}>
        <p>{pt("privacySec4P1")}</p>
        <PolicyList
          items={pl("privacySec4C1", "privacySec4C2", "privacySec4C3", "privacySec4C4")}
        />
        <p>{pt("privacySec4P2")}</p>
      </PolicySection>

      <PolicySection id="data-security" title={pt("privacySec5Title")}>
        <p>{pt("privacySec5P1")}</p>
        <PolicyList
          items={pl(
            "privacySec5L1",
            "privacySec5L2",
            "privacySec5L3",
            "privacySec5L4",
            "privacySec5L5",
          )}
        />
        <p>{pt("privacySec5P2")}</p>
      </PolicySection>

      <PolicySection id="third-party-services" title={pt("privacySec6Title")}>
        <p>{pt("privacySec6P1")}</p>
        <PolicyList
          items={pl(
            "privacySec6L1",
            "privacySec6L2",
            "privacySec6L3",
            "privacySec6L4",
            "privacySec6L5",
          )}
        />
        <p>{pt("privacySec6P2")}</p>
      </PolicySection>

      <PolicySection id="payment-processing" title={pt("privacySec7Title")}>
        <p>{pt("privacySec7P1")}</p>
        <PolicyList items={pl("privacySec7L1", "privacySec7L2", "privacySec7L3")} />
        <p>{pt("privacySec7P2")}</p>
      </PolicySection>

      <PolicySection id="user-rights" title={pt("privacySec8Title")}>
        <p>{pt("privacySec8P1")}</p>
        <PolicyList
          items={pl(
            "privacySec8L1",
            "privacySec8L2",
            "privacySec8L3",
            "privacySec8L4",
            "privacySec8L5",
            "privacySec8L6",
            "privacySec8L7",
          )}
        />
        <p>{pt("privacySec8P2")}</p>
      </PolicySection>

      <PolicySection id="account-deletion" title={pt("privacySec9Title")}>
        <p>{pt("privacySec9P1")}</p>
        <PolicyList items={pl("privacySec9L1", "privacySec9L2", "privacySec9L3")} />
        <p>{pt("privacySec9P2")}</p>
      </PolicySection>

      <PolicySection id="children" title={pt("privacySec10Title")}>
        <p>{pt("privacySec10P1")}</p>
        <p>{pt("privacySec10P2")}</p>
      </PolicySection>

      <PolicySection id="data-retention" title={pt("privacySec11Title")}>
        <p>{pt("privacySec11P1")}</p>
        <PolicyList
          items={pl(
            "privacySec11L1",
            "privacySec11L2",
            "privacySec11L3",
            "privacySec11L4",
            "privacySec11L5",
          )}
        />
        <p>{pt("privacySec11P2")}</p>
      </PolicySection>

      <PolicySection id="changes" title={pt("privacySec12Title")}>
        <p>{pt("privacySec12P1")}</p>
        <p>{pt("privacySec12P2")}</p>
      </PolicySection>

      <PolicySection id="contact" title={pt("privacySec13Title")}>
        <p>{pt("privacySec13P1")}</p>
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
        <p className="text-sm">{pt("privacySec13Disclaimer")}</p>
      </PolicySection>
    </LegalDocumentLayout>
  );
}
