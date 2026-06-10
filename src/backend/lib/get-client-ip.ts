import { getRequest } from "@tanstack/react-start/server";

/**
 * Extract the real client IP from the incoming server-function request.
 *
 * Header priority (most → least trusted):
 *   1. cf-connecting-ip  — Cloudflare Workers: single real client IP, never spoofable
 *   2. x-real-ip         — nginx / other reverse proxies
 *   3. x-forwarded-for   — standard multi-hop header; take the LAST entry, which is
 *                          written by the platform's own proxy and cannot be spoofed
 *                          by the client
 *
 * Falls back to "local" when running without a proxy (dev / test).
 */
export function getClientIp(): string {
  try {
    const req = getRequest();
    if (!req?.headers) return "local";
    const h = req.headers;

    const cf = h.get("cf-connecting-ip")?.trim();
    if (cf) return cf;

    const xri = h.get("x-real-ip")?.trim();
    if (xri) return xri;

    const xff = h.get("x-forwarded-for")?.trim();
    if (xff) {
      const last = xff.split(",").at(-1)?.trim();
      if (last) return last;
    }
  } catch {
    // getRequest() may throw outside a server-function context (e.g. tests)
  }
  return "local";
}
