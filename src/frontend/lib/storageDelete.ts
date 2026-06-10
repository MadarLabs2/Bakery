import type { SupabaseClient } from "@supabase/supabase-js";
import { extractStoragePath } from "@/frontend/lib/uploadValidation";

const BUCKET = "product-images";

/**
 * Returns true if the given URL is still referenced by any product or category
 * record OTHER than the ones being excluded (the record currently being edited
 * or deleted).
 *
 * Fetches all products + categories into memory — the admin dataset is small
 * so this is simpler and more reliable than constructing PostgREST array filters.
 */
async function isUrlStillReferenced(
  supabase: SupabaseClient<any>,
  url: string,
  opts: { excludeProductId?: string; excludeCategoryId?: string } = {},
): Promise<boolean> {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("id, image_url, gallery_urls"),
    supabase.from("categories").select("id, image_url"),
  ]);

  for (const p of products ?? []) {
    if (p.id === opts.excludeProductId) continue;
    if (p.image_url === url) return true;
    const gallery: unknown[] = Array.isArray(p.gallery_urls) ? p.gallery_urls : [];
    if (gallery.includes(url)) return true;
  }

  for (const c of categories ?? []) {
    if (c.id === opts.excludeCategoryId) continue;
    if (c.image_url === url) return true;
  }

  return false;
}

/**
 * Safely removes a Storage object only when:
 *  1. The URL maps to a valid, non-traversal path inside the product-images bucket.
 *  2. No other product or category record still references that URL.
 *
 * Errors from Storage are logged but never thrown — a failed delete must never
 * block the caller's success flow.
 */
export async function safeDeleteStorageFile(
  supabase: SupabaseClient<any>,
  url: string,
  opts: { excludeProductId?: string; excludeCategoryId?: string } = {},
): Promise<void> {
  const path = extractStoragePath(url);
  if (!path) return; // external URL, malformed, or traversal attempt — skip silently

  const stillReferenced = await isUrlStillReferenced(supabase, url, opts);
  if (stillReferenced) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    // Surface to console for debugging; never expose Storage internals to UI
    console.warn("[safeDeleteStorageFile] remove failed:", error.message);
  }
}

/**
 * Convenience wrapper: delete multiple URLs in sequence.
 * Failures on individual files are logged but do not abort the remaining deletes.
 */
export async function safeDeleteStorageFiles(
  supabase: SupabaseClient<any>,
  urls: string[],
  opts: { excludeProductId?: string; excludeCategoryId?: string } = {},
): Promise<void> {
  for (const url of urls) {
    await safeDeleteStorageFile(supabase, url, opts);
  }
}
