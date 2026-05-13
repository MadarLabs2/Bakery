/**
 * Strikethrough "was" price only when it is strictly greater than the selling price.
 * `price` is always what the customer pays (cart / checkout).
 */
export function resolveCompareAtPrice(
  sellingPrice: number,
  compareAt: number | string | null | undefined,
): number | null {
  const sell = Number(sellingPrice);
  if (!Number.isFinite(sell)) return null;
  if (compareAt == null || compareAt === "") return null;
  const c = Number(compareAt);
  if (!Number.isFinite(c) || c <= sell) return null;
  return c;
}
