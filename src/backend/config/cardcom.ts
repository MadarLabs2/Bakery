export type CardcomLanguage = "he" | "en" | "ar" | "ru";

export function getCardcomConfig() {
  const terminalNumber = Number.parseInt(String(process.env.CARDCOM_TERMINAL_NUMBER ?? "").trim(), 10);
  const apiUsername = String(process.env.CARDCOM_API_USERNAME ?? "").trim();
  const apiPassword = String(process.env.CARDCOM_API_PASSWORD ?? "").trim();
  const apiBase = String(process.env.CARDCOM_API_BASE ?? "https://secure.cardcom.solutions/api/v11").replace(/\/$/, "");
  const appBaseUrl = String(process.env.APP_BASE_URL ?? "").trim().replace(/\/$/, "");

  return { terminalNumber, apiUsername, apiPassword, apiBase, appBaseUrl };
}

export function isCardcomConfigured(): boolean {
  const { terminalNumber, apiUsername, apiPassword, appBaseUrl } = getCardcomConfig();
  return (
    Number.isFinite(terminalNumber) &&
    terminalNumber > 0 &&
    apiUsername.length > 0 &&
    apiPassword.length > 0 &&
    appBaseUrl.length > 0 &&
    !appBaseUrl.includes("localhost") &&
    !appBaseUrl.includes("127.0.0.1")
  );
}

/** CardCom requires a public HTTPS URL — disabled until creds + APP_BASE_URL are set. */
export function isCardcomEnabled(): boolean {
  if (process.env.CARDCOM_ENABLED === "false") return false;
  return isCardcomConfigured();
}

export function toCardcomLanguage(locale: string): CardcomLanguage {
  if (locale === "en" || locale === "ar" || locale === "ru") return locale;
  return "he";
}
