import {
  getCardcomConfig,
  isCardcomEnabled,
  toCardcomLanguage,
  type CardcomLanguage,
} from "@/backend/config/cardcom";

export type CreateLowProfileInput = {
  amount: number;
  returnValue: string;
  language: CardcomLanguage;
  customerEmail: string;
  customerName: string;
  productName: string;
  webhookUrl: string;
  successRedirectUrl: string;
  failedRedirectUrl: string;
};

export type CreateLowProfileResult =
  | { ok: true; lowProfileId: string; url: string }
  | { ok: false; message: string };

export type GetLpResultPayload = {
  ResponseCode?: number;
  Description?: string;
  LowProfileId?: string;
  ReturnValue?: string;
  TranzactionId?: number;
  TransactionId?: number;
  OperationResponse?: number;
  [key: string]: unknown;
};

function readResponseCode(payload: GetLpResultPayload | null | undefined): number | null {
  if (!payload || typeof payload.ResponseCode !== "number") return null;
  return payload.ResponseCode;
}

export async function createCardcomLowProfile(
  input: CreateLowProfileInput,
): Promise<CreateLowProfileResult> {
  if (!isCardcomEnabled()) {
    return { ok: false, message: "CardCom is not enabled" };
  }

  const { terminalNumber, apiUsername, apiBase } = getCardcomConfig();
  const body: Record<string, unknown> = {
    TerminalNumber: terminalNumber,
    ApiName: apiUsername,
    Operation: "ChargeOnly",
    ReturnValue: input.returnValue,
    Amount: Math.round(input.amount * 100) / 100,
    SuccessRedirectUrl: input.successRedirectUrl,
    FailedRedirectUrl: input.failedRedirectUrl,
    WebHookUrl: input.webhookUrl,
    ProductName: input.productName.slice(0, 50),
    Language: input.language,
    ISOCoinId: 1,
  };

  try {
    const res = await fetch(`${apiBase}/LowProfile/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    let payload: {
      ResponseCode?: number;
      Description?: string;
      LowProfileId?: string;
      Url?: string;
    };
    try {
      payload = JSON.parse(rawText) as typeof payload;
    } catch {
      console.error("[cardcom] Create non-JSON response:", rawText.slice(0, 500));
      return { ok: false, message: `CardCom invalid response (HTTP ${res.status})` };
    }

    if (!res.ok || payload.ResponseCode !== 0 || !payload.Url || !payload.LowProfileId) {
      const msg = payload.Description ?? `CardCom HTTP ${res.status}`;
      console.error("[cardcom] Create failed:", msg, payload);
      return { ok: false, message: msg };
    }

    return { ok: true, lowProfileId: payload.LowProfileId, url: payload.Url };
  } catch (e) {
    console.error("[cardcom] Create error:", e);
    return { ok: false, message: e instanceof Error ? e.message : "CardCom request failed" };
  }
}

export async function getCardcomLpResult(lowProfileId: string): Promise<GetLpResultPayload | null> {
  if (!isCardcomEnabled()) return null;

  const { terminalNumber, apiUsername, apiBase } = getCardcomConfig();
  const url = new URL(`${apiBase}/LowProfile/GetLpResult`);
  url.searchParams.set("TerminalNumber", String(terminalNumber));
  url.searchParams.set("ApiName", apiUsername);
  url.searchParams.set("LowProfileId", lowProfileId);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[cardcom] GetLpResult HTTP", res.status);
      return null;
    }
    return (await res.json()) as GetLpResultPayload;
  } catch (e) {
    console.error("[cardcom] GetLpResult error:", e);
    return null;
  }
}

export function isCardcomChargeSuccessful(payload: GetLpResultPayload | null): boolean {
  return readResponseCode(payload) === 0;
}

export { toCardcomLanguage };
