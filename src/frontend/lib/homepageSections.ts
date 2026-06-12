import { pickName, type Lang } from "@/frontend/lib/i18n";

export type CategoryRow = {
  id: string;
  name: string;
  name_en?: string | null;
  name_he?: string | null;
  name_ar?: string | null;
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  [key: string]: unknown;
};

/** Merge saved admin order with categories that have products; append new categories at end. */
export function resolveHomepageCategorySections(
  categories: CategoryRow[],
  products: ProductRow[],
  savedOrder: string[] | null,
  lang: Lang,
): CategoryRow[] {
  const countByCategory = new Map<string, number>();
  for (const p of products) {
    if (!p.category_id) continue;
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  }

  const withProducts = categories.filter((c) => (countByCategory.get(c.id) ?? 0) > 0);

  if (!savedOrder?.length) {
    return [...withProducts].sort((a, b) =>
      pickName(a, lang).localeCompare(pickName(b, lang), lang === "en" ? "en" : lang),
    );
  }

  const rank = new Map(savedOrder.map((id, i) => [id, i]));
  const ordered = withProducts
    .filter((c) => rank.has(c.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  const appended = withProducts
    .filter((c) => !rank.has(c.id))
    .sort((a, b) => pickName(a, lang).localeCompare(pickName(b, lang), lang === "en" ? "en" : lang));

  return [...ordered, ...appended];
}

export function productsForCategory(products: ProductRow[], categoryId: string): ProductRow[] {
  return products.filter((p) => p.category_id === categoryId);
}

export function parseHomepageCategoryOrder(raw: string | null | undefined): string[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return null;
  }
}
