// Simple fixed-window in-memory rate limiter.
// Works within a single serverless instance. For multi-instance deployments,
// swap the Map for Redis/Upstash — the public interface stays the same.
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

let lastPrune = Date.now();
function maybePrune() {
  const now = Date.now();
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}

/**
 * Returns true (allowed) or false (rate-limited).
 * @param key       Stable key: `"contact:ip:<ip>"`, `"sub:email:<email>"`, etc.
 * @param limit     Max requests per window.
 * @param windowMs  Window size in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  maybePrune();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
