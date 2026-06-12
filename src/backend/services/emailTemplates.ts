/**
 * Al-Nour Bakery — HTML email templates for Resend.
 * Palette: dark green #1B4332, cream #FDFBF7, gold #D4AF37, warm brown #3C2A21.
 * Inline styles only — tested for Gmail, Outlook, and mobile clients.
 */

const BRAND = "Al-nour Gluten-free Bakery";
const BRAND_SHORT = "Al-Nour Bakery";
const TAGLINE = "Fresh · Wholesome · 100% Gluten-free";
const GREEN = "#1B4332";
const GREEN_LIGHT = "#2D6A4F";
const CREAM = "#FDFBF7";
const CREAM_DARK = "#F5F0E8";
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#E8D5A3";
const BROWN = "#3C2A21";
const MUTED = "#7A7268";
const WHITE = "#FFFFFF";
const BORDER = "#E8E4DC";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(text: string): string {
  return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br />");
}

function formatMoney(n: number): string {
  return `₪${n.toFixed(2)}`;
}

function testModeBanner(note: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:14px 18px;background:#FFFBF0;border:1px solid ${GOLD};border-radius:10px;">
      <p style="margin:0;font-size:13px;line-height:1.55;color:#6B5A1E;font-family:Arial,Helvetica,sans-serif;">
        <strong style="color:#5C4A12;">Test mode</strong> — ${escapeHtml(note.replace(/^\[Test mode\]\s*/i, ""))}
      </p>
    </td></tr>
  </table>`;
}

function emailHeader(subtitle?: string): string {
  const sub = subtitle ?? TAGLINE;
  return `<tr>
    <td style="padding:0;background:${GREEN};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:36px 32px 28px;text-align:center;background:linear-gradient(165deg,${GREEN} 0%,${GREEN_LIGHT} 55%,#1a3d2e 100%);">
            <!-- Monogram -->
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px;">
              <tr><td style="width:56px;height:56px;background:${GOLD};border-radius:50%;text-align:center;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:${GREEN};line-height:56px;">A</td></tr>
            </table>
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:${WHITE};letter-spacing:0.3px;line-height:1.25;">${BRAND}</p>
            <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${GOLD_LIGHT};letter-spacing:2px;text-transform:uppercase;">${sub}</p>
            <!-- Gold divider -->
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0;">
              <tr><td style="width:48px;height:3px;background:${GOLD};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailFooter(): string {
  return `<tr>
    <td style="padding:0;background:${CREAM_DARK};border-top:1px solid ${BORDER};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:${GREEN};">${BRAND_SHORT}</p>
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};line-height:1.5;">${TAGLINE}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 14px;">
              <tr>
                <td style="padding:0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BROWN};">
                  <a href="tel:0537636011" style="color:${GREEN};text-decoration:none;font-weight:600;">053-763-6011</a>
                </td>
                <td style="color:${GOLD};font-size:10px;">●</td>
                <td style="padding:0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BROWN};">
                  <a href="tel:0508588985" style="color:${GREEN};text-decoration:none;font-weight:600;">050-858-8985</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};">Made with care in our dedicated gluten-free kitchen.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailShell(
  content: string,
  headerSubtitle?: string,
  preheader?: string,
  options?: { locale?: "en" | "he" },
): string {
  const locale = options?.locale ?? "en";
  const lang = locale === "he" ? "he" : "en";
  const dir = locale === "he" ? "rtl" : "ltr";
  const pre = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${CREAM};">${escapeHtml(preheader)}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${pre}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};min-width:100%;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${WHITE};border-radius:16px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 4px 24px rgba(27,67,50,0.08);">
        ${emailHeader(headerSubtitle)}
        <tr>
          <td style="padding:36px 32px 32px;font-family:Arial,Helvetica,sans-serif;color:${BROWN};">
            ${content}
          </td>
        </tr>
        ${emailFooter()}
      </table>
      <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};text-align:center;">© ${new Date().getFullYear()} ${BRAND_SHORT}</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0;">
    <tr>
      <td style="border-radius:50px;background:linear-gradient(135deg,${GREEN} 0%,${GREEN_LIGHT} 100%);">
        <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${WHITE};text-decoration:none;letter-spacing:0.3px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function detailRow(label: string, value: string, rtl = false): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;${rtl ? "text-align:right;" : ""}">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${BROWN};text-align:${rtl ? "left" : "right"};font-weight:600;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(value)}</td>
  </tr>`;
}

function heDeliveryLabel(method: string): string {
  const k = method.toLowerCase();
  if (k === "pickup" || k === "איסוף") return "איסוף";
  if (k === "delivery" || k === "משלוח") return "משלוח";
  return method;
}

function hePaymentLabel(method: string): string {
  const k = method.toLowerCase().replace(/\s+/g, "_");
  if (k === "cash" || k === "מזומן") return "מזומן";
  if (k === "card" || k === "credit_card" || k === "creditcard") return "כרטיס אשראי";
  return method;
}

function shopUrl(): string {
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    "http://localhost:8080"
  );
}

function adminPanelUrl(): string {
  return `${shopUrl()}/admin/orders`;
}

function statusBadge(text: string): string {
  return `<span style="display:inline-block;padding:6px 14px;background:#E8F5EE;color:${GREEN};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;border-radius:20px;">${escapeHtml(text)}</span>`;
}

// ─── Order Confirmation ───────────────────────────────────────────────────────

export type OrderItemLine = {
  product_name: string;
  quantity: number;
  product_price: number;
  total_price: number;
};

export type OrderConfirmationData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItemLine[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  couponCode?: string | null;
  testModeNote?: string;
};

export function orderConfirmationTemplate(data: OrderConfirmationData): { subject: string; html: string } {
  const shortId = data.orderNumber || data.orderId.slice(0, 8).toUpperCase();
  const firstName = data.customerName.split(" ")[0] ?? data.customerName;
  const deliveryHe = heDeliveryLabel(data.deliveryMethod);
  const paymentHe = hePaymentLabel(data.paymentMethod);
  const subject = `אישור הזמנה #${shortId} — ${BRAND_SHORT}`;

  const itemRows = data.items
    .map(
      (item, i) => `
    <tr style="background:${i % 2 === 0 ? WHITE : CREAM};">
      <td style="padding:14px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};border-bottom:1px solid ${BORDER};text-align:right;">${escapeHtml(item.product_name)}</td>
      <td style="padding:14px 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};text-align:center;border-bottom:1px solid ${BORDER};">${item.quantity}</td>
      <td style="padding:14px 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};text-align:left;border-bottom:1px solid ${BORDER};">${formatMoney(item.product_price)}</td>
      <td style="padding:14px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${GREEN};text-align:left;border-bottom:1px solid ${BORDER};">${formatMoney(item.total_price)}</td>
    </tr>`,
    )
    .join("");

  const discountRow =
    data.discountAmount > 0
      ? `<tr><td colspan="3" style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${GREEN};text-align:right;">הנחה${data.couponCode ? ` (${escapeHtml(data.couponCode)})` : ""}</td><td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${GREEN};text-align:left;font-weight:600;">−${formatMoney(data.discountAmount)}</td></tr>`
      : "";

  const testBanner = data.testModeNote ? testModeBanner(data.testModeNote) : "";

  const content = `
    ${testBanner}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding-bottom:8px;">${statusBadge("ההזמנה אושרה")}</td></tr>
    </table>
    <h1 style="margin:12px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:${GREEN};text-align:center;line-height:1.3;">תודה, ${escapeHtml(firstName)}!</h1>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${MUTED};text-align:center;line-height:1.7;">קיבלנו את ההזמנה שלך והאופים שלנו כבר מתחילים לעבוד.<br/>מעדנים ללא גלוטן טריים — בדרך אליך.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:${CREAM};border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
      <tr><td style="padding:14px 20px;background:${GREEN};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${GOLD_LIGHT};letter-spacing:1px;font-weight:bold;text-align:right;">פרטי הזמנה</p>
      </td></tr>
      <tr><td style="padding:8px 20px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("מס׳ הזמנה", shortId, true)}
          ${detailRow('דוא"ל', data.customerEmail, true)}
          ${detailRow("טלפון", data.customerPhone, true)}
          ${detailRow("משלוח / איסוף", deliveryHe, true)}
          ${detailRow("תשלום", paymentHe, true)}
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:${GREEN};text-align:right;">ההזמנה שלך</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin-bottom:8px;">
      <tr style="background:${GREEN};">
        <th style="padding:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:right;letter-spacing:0.5px;font-weight:bold;">פריט</th>
        <th style="padding:12px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:center;letter-spacing:0.5px;font-weight:bold;">כמות</th>
        <th style="padding:12px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:left;letter-spacing:0.5px;font-weight:bold;">מחיר</th>
        <th style="padding:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:left;letter-spacing:0.5px;font-weight:bold;">סה״כ</th>
      </tr>
      ${itemRows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};text-align:right;">סכום ביניים</td><td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};text-align:left;">${formatMoney(data.subtotal)}</td></tr>
      ${discountRow}
      <tr><td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};text-align:right;">דמי משלוח</td><td style="padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};text-align:left;">${formatMoney(data.deliveryFee)}</td></tr>
      <tr><td colspan="2" style="padding:16px 12px 0;border-top:2px solid ${GREEN};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:${GREEN};text-align:right;">סה״כ לתשלום</td>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:${GREEN};text-align:left;">${formatMoney(data.totalAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:20px 22px;background:linear-gradient(135deg,${CREAM} 0%,${CREAM_DARK} 100%);border-radius:12px;border:1px solid ${BORDER};text-align:center;">
        <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:bold;color:${GREEN};">צריכים עזרה עם ההזמנה?</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};line-height:1.7;">התקשרו אלינו: <strong style="color:${BROWN};">053-763-6011</strong> או <strong style="color:${BROWN};">050-858-8985</strong></p>
      </td></tr>
    </table>`;

  return {
    subject,
    html: emailShell(content, "אישור הזמנה", `ההזמנה #${shortId} אושרה — ${BRAND_SHORT}`, { locale: "he" }),
  };
}

// ─── Marketing / Offer ────────────────────────────────────────────────────────

export type OfferEmailData = {
  subject: string;
  message: string;
  couponCode?: string | null;
  discountPercent?: number | null;
  testModeNote?: string;
};

function couponTicket(code: string | null | undefined, percent: number | null | undefined): string {
  if (!code && !percent) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
    <tr><td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:14px;overflow:hidden;border:2px dashed ${GOLD};">
        <tr>
          <td style="padding:28px 24px;background:linear-gradient(145deg,#FFFBF5 0%,${CREAM} 50%,#FFF8E7 100%);text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Special Offer</p>
            ${percent ? `<p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:bold;color:${GREEN};line-height:1;">${percent}<span style="font-size:22px;">%</span></p><p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};font-weight:600;">OFF your next order</p>` : ""}
            ${code ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="padding:12px 28px;background:${WHITE};border:2px solid ${GOLD};border-radius:8px;">
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${MUTED};letter-spacing:1.5px;text-transform:uppercase;">Your code</p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:24px;font-weight:bold;color:${GREEN};letter-spacing:4px;">${escapeHtml(code)}</p>
            </td></tr></table>` : ""}
            <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">Apply at checkout · Limited time</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

export function offerEmailTemplate(data: OfferEmailData): { subject: string; html: string } {
  const testBanner = data.testModeNote ? testModeBanner(data.testModeNote) : "";

  const content = `
    ${testBanner}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding-bottom:4px;">${statusBadge("Exclusive Offer")}</td></tr>
    </table>
    <h1 style="margin:12px 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:${GREEN};text-align:center;line-height:1.3;">${escapeHtml(data.subject)}</h1>

    <!-- Message body -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td style="padding:24px 26px;background:${CREAM};border-radius:12px;border-left:4px solid ${GOLD};">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:${BROWN};line-height:1.75;">${plainTextToHtml(data.message)}</div>
      </td></tr>
    </table>

    ${couponTicket(data.couponCode, data.discountPercent ?? null)}

    ${ctaButton("Shop Now →", shopUrl())}

    <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};text-align:center;line-height:1.6;">Fresh gluten-free breads, pastries &amp; cakes — baked with love.</p>`;

  return {
    subject: data.subject,
    html: emailShell(content, "Special Offer", data.subject),
  };
}

// ─── Admin: New Order Notification ───────────────────────────────────────────

export type AdminOrderEmailData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItemLine[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  paymentMethod: string;
  notes?: string | null;
};

export function adminNewOrderTemplate(data: AdminOrderEmailData): { subject: string; html: string } {
  const shortId = data.orderNumber || data.orderId.slice(0, 8).toUpperCase();
  const subject = `הזמנה חדשה #${shortId} — ${BRAND_SHORT}`;

  const itemRows = data.items
    .map(
      (item, i) => `
    <tr style="background:${i % 2 === 0 ? WHITE : CREAM};">
      <td style="padding:10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BROWN};border-bottom:1px solid ${BORDER};text-align:right;">${escapeHtml(item.product_name)}</td>
      <td style="padding:10px 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};text-align:center;border-bottom:1px solid ${BORDER};">${item.quantity}</td>
      <td style="padding:10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:${GREEN};text-align:left;border-bottom:1px solid ${BORDER};">${formatMoney(item.total_price)}</td>
    </tr>`,
    )
    .join("");

  const discountRow =
    data.discountAmount > 0
      ? `<tr><td colspan="2" style="padding:6px 12px;font-size:13px;color:${GREEN};font-family:Arial,Helvetica,sans-serif;text-align:right;">הנחה</td><td style="padding:6px 12px;font-size:13px;color:${GREEN};text-align:left;font-weight:600;font-family:Arial,Helvetica,sans-serif;">−${formatMoney(data.discountAmount)}</td></tr>`
      : "";

  const deliveryRow =
    data.deliveryFee > 0
      ? `<tr><td colspan="2" style="padding:6px 12px;font-size:13px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;text-align:right;">דמי משלוח</td><td style="padding:6px 12px;font-size:13px;color:${BROWN};text-align:left;font-family:Arial,Helvetica,sans-serif;">${formatMoney(data.deliveryFee)}</td></tr>`
      : "";

  const addressNote = data.deliveryMethod.toLowerCase() === "delivery" && data.deliveryAddress
    ? `<tr><td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;text-align:right;">כתובת</td><td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${BROWN};text-align:left;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(data.deliveryAddress)}</td></tr>`
    : "";

  const notesNote = data.notes
    ? `<tr><td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;text-align:right;">הערות</td><td style="padding:8px 0;border-bottom:1px solid ${BORDER};font-size:13px;color:${BROWN};text-align:left;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(data.notes)}</td></tr>`
    : "";

  const deliveryHe = heDeliveryLabel(data.deliveryMethod);
  const paymentHe = hePaymentLabel(data.paymentMethod);

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding-bottom:8px;">${statusBadge("הזמנה חדשה")}</td></tr>
    </table>
    <h1 style="margin:12px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:${GREEN};text-align:center;line-height:1.2;">הזמנה #${escapeHtml(shortId)}</h1>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};text-align:center;">התקבלה הזמנה חדשה באתר ${BRAND_SHORT}.</p>

    <!-- Customer card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:${CREAM};border-radius:10px;border:1px solid ${BORDER};overflow:hidden;">
      <tr><td style="padding:10px 16px;background:${GREEN};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};letter-spacing:1px;font-weight:bold;text-align:right;">לקוח</p>
      </td></tr>
      <tr><td style="padding:6px 16px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("שם", data.customerName, true)}
          ${detailRow("טלפון", data.customerPhone, true)}
          ${detailRow('דוא"ל', data.customerEmail, true)}
          ${detailRow("משלוח / איסוף", deliveryHe, true)}
          ${detailRow("תשלום", paymentHe, true)}
          ${addressNote}
          ${notesNote}
        </table>
      </td></tr>
    </table>

    <!-- Items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;margin-bottom:8px;">
      <tr style="background:${GREEN};">
        <th style="padding:10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:right;letter-spacing:0.5px;font-weight:bold;">פריט</th>
        <th style="padding:10px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:center;letter-spacing:0.5px;font-weight:bold;">כמות</th>
        <th style="padding:10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};text-align:left;letter-spacing:0.5px;font-weight:bold;">סה״כ</th>
      </tr>
      ${itemRows}
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${discountRow}
      ${deliveryRow}
      <tr><td colspan="3" style="padding:12px 12px 0;border-top:2px solid ${GREEN};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:${GREEN};text-align:right;">סה״כ</td>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:${GREEN};text-align:left;">${formatMoney(data.totalAmount)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${ctaButton("צפייה בניהול הזמנות ←", adminPanelUrl())}`;

  return {
    subject,
    html: emailShell(content, "הזמנה חדשה", `הזמנה חדשה #${shortId} מ${data.customerName}`, { locale: "he" }),
  };
}

// ─── Customer: Order Status Update ───────────────────────────────────────────

export type OrderStatusEmailData = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  status: string; // internal status key
  testModeNote?: string;
};

type StatusMeta = {
  badgeText: string;
  heading: string;
  body: string;
  headerSubtitle: string;
  preheader: string;
};

function statusMeta(status: string, firstName: string, deliveryMethod: string): StatusMeta {
  const f = escapeHtml(firstName);
  const isDelivery = deliveryMethod === "delivery";
  switch (status) {
    case "confirmed":
      return {
        badgeText: "Order Confirmed",
        heading: `Your order is confirmed, ${f}!`,
        body: "We've confirmed your order and our team will start preparing it soon. You'll hear from us again as it progresses.",
        headerSubtitle: "Order Confirmed",
        preheader: `Your order is confirmed — ${BRAND_SHORT}`,
      };
    case "preparing":
      return {
        badgeText: "Preparing Your Order",
        heading: `We're baking for you, ${f}!`,
        body: "Our bakers have started preparing your fresh gluten-free order. We'll let you know when it's ready.",
        headerSubtitle: "Baking in Progress",
        preheader: `Your order is being prepared — ${BRAND_SHORT}`,
      };
    case "ready":
    case "out_for_delivery":
      return {
        badgeText: isDelivery ? "Out for Delivery" : "Ready for Pickup",
        heading: isDelivery ? `Your order is on its way, ${f}!` : `Your order is ready, ${f}!`,
        body: isDelivery
          ? "Your order has been handed to our delivery team and is on its way to you. Thank you for your patience!"
          : "Your gluten-free order is freshly packed and ready for pickup. We look forward to seeing you!",
        headerSubtitle: isDelivery ? "On the Way" : "Ready for Pickup",
        preheader: isDelivery ? `Your order is on its way — ${BRAND_SHORT}` : `Your order is ready for pickup — ${BRAND_SHORT}`,
      };
    case "completed":
      return {
        badgeText: "Order Delivered",
        heading: `Enjoy every bite, ${f}!`,
        body: "Your order has been delivered. We hope you love it! Thank you for choosing Al-Nour Gluten-Free Bakery.",
        headerSubtitle: "Order Complete",
        preheader: `Your order has been delivered — ${BRAND_SHORT}`,
      };
    case "cancelled":
      return {
        badgeText: "Order Cancelled",
        heading: `Your order has been cancelled, ${f}`,
        body: "Your order has been cancelled. If you have any questions or this was unexpected, please don't hesitate to reach out to us.",
        headerSubtitle: "Order Cancelled",
        preheader: `Your order has been cancelled — ${BRAND_SHORT}`,
      };
    default:
      return {
        badgeText: "Order Update",
        heading: `Order update for ${f}`,
        body: "There has been an update to your order. Please contact us if you have any questions.",
        headerSubtitle: "Order Update",
        preheader: `Order update — ${BRAND_SHORT}`,
      };
  }
}

export function orderStatusTemplate(data: OrderStatusEmailData): { subject: string; html: string } {
  const shortId = data.orderNumber || data.orderId.slice(0, 8).toUpperCase();
  const firstName = data.customerName.split(" ")[0] ?? data.customerName;
  const meta = statusMeta(data.status, firstName, data.deliveryMethod);
  const subject = `${meta.badgeText} #${shortId} — ${BRAND_SHORT}`;

  const testBanner = data.testModeNote ? testModeBanner(data.testModeNote) : "";

  const isCancelled = data.status === "cancelled";
  const badgeBg = isCancelled ? "#FEF2F2" : "#E8F5EE";
  const badgeColor = isCancelled ? "#991B1B" : GREEN;

  const locationBox =
    data.deliveryMethod !== "delivery" && data.status === "ready"
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
           <tr><td style="padding:16px 20px;background:${CREAM};border-radius:10px;border-left:4px solid ${GOLD};">
             <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">Pickup location</p>
             <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};line-height:1.6;">Al-Nour Gluten-Free Bakery</p>
           </td></tr>
         </table>`
      : data.deliveryMethod === "delivery" && data.deliveryAddress && (data.status === "ready" || data.status === "out_for_delivery")
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
           <tr><td style="padding:16px 20px;background:${CREAM};border-radius:10px;border-left:4px solid ${GOLD};">
             <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${MUTED};letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">Delivery address</p>
             <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${BROWN};line-height:1.6;">${escapeHtml(data.deliveryAddress)}</p>
           </td></tr>
         </table>`
      : "";

  const content = `
    ${testBanner}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;padding-bottom:8px;">
        <span style="display:inline-block;padding:6px 14px;background:${badgeBg};color:${badgeColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;border-radius:20px;">${escapeHtml(meta.badgeText)}</span>
      </td></tr>
    </table>
    <h1 style="margin:12px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:${isCancelled ? "#991B1B" : GREEN};text-align:center;line-height:1.25;">${meta.heading}</h1>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${MUTED};text-align:center;line-height:1.65;">${escapeHtml(meta.body)}</p>

    <!-- Order reference card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:${CREAM};border-radius:10px;border:1px solid ${BORDER};overflow:hidden;">
      <tr><td style="padding:10px 16px;background:${GREEN};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${GOLD_LIGHT};letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">Order Reference</p>
      </td></tr>
      <tr><td style="padding:6px 16px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Order #", shortId)}
          ${detailRow("Name", data.customerName)}
          ${detailRow("Delivery", data.deliveryMethod.charAt(0).toUpperCase() + data.deliveryMethod.slice(1))}
        </table>
      </td></tr>
    </table>

    ${locationBox}

    <!-- Help -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td style="padding:16px 20px;background:${CREAM_DARK};border-radius:10px;text-align:center;">
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:${GREEN};">Questions? We're here.</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};line-height:1.6;">Call us at <strong style="color:${BROWN};">053-763-6011</strong> or <strong style="color:${BROWN};">050-858-8985</strong></p>
      </td></tr>
    </table>`;

  return {
    subject,
    html: emailShell(content, meta.headerSubtitle, meta.preheader),
  };
}
