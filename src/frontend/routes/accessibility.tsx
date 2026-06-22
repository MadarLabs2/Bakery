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
  accessibilityList,
  accessibilityT,
  type AccessibilityDictKey,
} from "@/frontend/lib/accessibilityPolicy.i18n";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityStatementPage,
  head: () => ({
    meta: [
      { title: "Accessibility Statement | Al-Nour Gluten-Free Bakery" },
      {
        name: "description",
        content:
          "Accessibility statement for Al-Nour Gluten-Free Bakery — how we make our website and bakery services accessible.",
      },
    ],
  }),
});

const TOC: { id: string; key: AccessibilityDictKey }[] = [
  { id: "introduction", key: "a11yToc1" },
  { id: "website", key: "a11yToc2" },
  { id: "service", key: "a11yToc3" },
  { id: "customer-service", key: "a11yToc4" },
  { id: "exceptions", key: "a11yToc5" },
  { id: "coordinator", key: "a11yToc6" },
];

function AccessibilityStatementPage() {
  const { lang, t } = useI18n();
  const { bakeryName, email, websiteUrl, phone, address, accessibilityEffectiveDate } =
    LEGAL_PLACEHOLDERS;
  const vars = { bakeryName, email, websiteUrl, phone };
  const at = (key: AccessibilityDictKey) => accessibilityT(key, lang, vars);
  const al = (...keys: AccessibilityDictKey[]) => accessibilityList(keys, lang, vars);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${accessibilityT("a11yTitle", lang)} | ${t("brand")}`;
    }
  }, [lang, t]);

  const shell = {
    legalBadge: at("a11yLegalBadge"),
    questionsTitle: at("a11yQuestionsTitle"),
    questionsBody: at("a11yQuestionsBody"),
  };

  return (
    <LegalDocumentLayout
      title={at("a11yTitle")}
      subtitle={at("a11ySubtitle")}
      shell={shell}
      effectiveDate={accessibilityEffectiveDate}
    >
      <nav
        aria-label={legalSharedT("legalTocAria", lang)}
        className="rounded-xl border bg-secondary/40 p-6 not-prose"
      >
        <p className="text-sm font-semibold text-foreground">
          {legalSharedT("legalOnThisPage", lang)}
        </p>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {TOC.map(({ id, key }) => (
            <li key={id}>
              <a href={`#${id}`} className="text-primary hover:underline">
                {at(key)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <PolicySection id="introduction" title={at("a11ySec1Title")}>
        <p>{at("a11ySec1P1")}</p>
        <p>{at("a11ySec1P2")}</p>
      </PolicySection>

      <PolicySection id="website" title={at("a11ySec2Title")}>
        <p>{at("a11ySec2P1")}</p>
        <p>{at("a11ySec2P2")}</p>
        <PolicyList
          items={al(
            "a11ySec2L0",
            "a11ySec2L1",
            "a11ySec2L2",
            "a11ySec2L3",
            "a11ySec2L4",
            "a11ySec2L5",
            "a11ySec2L6",
            "a11ySec2L7",
          )}
        />
        <p>{at("a11ySec2P3")}</p>
      </PolicySection>

      <PolicySection id="service" title={at("a11ySec3Title")}>
        <p>{at("a11ySec3P1")}</p>
        <PolicyList items={al("a11ySec3L1", "a11ySec3L2", "a11ySec3L3")} />
      </PolicySection>

      <PolicySection id="customer-service" title={at("a11ySec4Title")}>
        <p>{at("a11ySec4P1")}</p>
        <ul className="list-none space-y-2 ps-0">
          <li>{at("a11ySec4Phone")}</li>
          <li>{at("a11ySec4WhatsApp")}</li>
          <li>
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {at("a11ySec4Email")}
            </a>
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="exceptions" title={at("a11ySec5Title")}>
        <p>{at("a11ySec5P1")}</p>
        <p>{at("a11ySec5P2")}</p>
        <PolicyList items={al("a11ySec5L1", "a11ySec5L2", "a11ySec5L3")} />
        <p>{at("a11ySec5P3")}</p>
      </PolicySection>

      <PolicySection id="coordinator" title={at("a11ySec6Title")}>
        <p>{at("a11ySec6P1")}</p>
        <p className="font-semibold text-foreground">{bakeryName}</p>
        <ul className="list-none space-y-2 ps-0">
          <li>
            {legalSharedT("legalContactPhone", lang)} {phone}
          </li>
          <li>
            WhatsApp / SMS: {phone}
          </li>
          <li>
            {legalSharedT("legalContactEmail", lang)}{" "}
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </li>
          <li>
            {legalSharedT("legalContactAddress", lang)} {address}
          </li>
          <li>
            {legalSharedT("legalContactWebsite", lang)} {websiteUrl}
          </li>
        </ul>
        <p>{at("a11ySec6P2")}</p>
        <p className="text-sm">{at("a11ySec6P3")}</p>
        <p className="text-sm">
          <Link to="/accessibility-guide" className="text-primary font-medium hover:underline">
            {lang === "he"
              ? "מדריך נגישות מלא (עברית ואנגלית)"
              : lang === "ar"
                ? "دليل إمكانية الوصول الكامل (عبري وإنجليزي)"
                : "Full accessibility guide (Hebrew & English)"}
          </Link>
        </p>
      </PolicySection>
    </LegalDocumentLayout>
  );
}
