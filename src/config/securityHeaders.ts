/**
 * Security headers for every HTTP response.
 * Applied via Nitro routeRules (Vercel build output) and server middleware (runtime).
 * vercel.json mirrors these for documentation; Nitro SSR uses routeRules + middleware.
 */
const ENABLE_ORIGINS = "https://cdn.enable.co.il https://www.enable.co.il";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline' ${ENABLE_ORIGINS}`,
  `style-src 'self' 'unsafe-inline' ${ENABLE_ORIGINS}`,
  `img-src 'self' data: blob: https://*.supabase.co ${ENABLE_ORIGINS}`,
  `font-src 'self' data: ${ENABLE_ORIGINS}`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${ENABLE_ORIGINS}`,
  "media-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
] as const;

export const CONTENT_SECURITY_POLICY = CSP_DIRECTIVES.join("; ");

export const CONTENT_SECURITY_POLICY_PRODUCTION = [...CSP_DIRECTIVES, "upgrade-insecure-requests"].join("; ");

const BASE_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": CONTENT_SECURITY_POLICY_PRODUCTION,
};

/** Headers baked into Vercel production builds (routeRules). */
export const SECURITY_HEADERS: Record<string, string> = {
  ...BASE_SECURITY_HEADERS,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

/** Runtime headers — skips HSTS/CSP upgrades in local dev over HTTP. */
export function getSecurityHeaders(): Record<string, string> {
  if (isProductionRuntime()) return SECURITY_HEADERS;

  return {
    ...BASE_SECURITY_HEADERS,
    "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  };
}

export function applySecurityHeaders(setHeader: (name: string, value: string) => void): void {
  for (const [name, value] of Object.entries(getSecurityHeaders())) {
    setHeader(name, value);
  }
}
