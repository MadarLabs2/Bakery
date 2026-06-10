import {
  defineEventHandler,
  readMultipartFormData,
  getRequestHeader,
  createError,
} from "h3";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";
import { supabaseAdmin } from "@/backend/db/client.server";
import { resolveIsAdmin } from "@/frontend/lib/resolveIsAdmin";
import { checkRateLimit } from "@/backend/lib/rate-limit";
import { generateUUID } from "@/frontend/lib/uuid";

const MAX_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 4000;
const ACCEPTED_SHARP_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);
const SAFE_OUTPUT_PATH_RE =
  /^(categories\/)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

type ServerMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

const SERVER_MAGIC: { mime: ServerMime; match: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/webp",
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    mime: "image/avif",
    match: (b) =>
      b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
      b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 && b[11] === 0x66,
  },
];

function detectMime(buf: Buffer): ServerMime | null {
  if (buf.length < 12) return null;
  for (const { mime, match } of SERVER_MAGIC) {
    if (match(buf)) return mime;
  }
  return null;
}

function getIp(headers: { get: (k: string) => string | null | undefined }): string {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const xri = headers.get("x-real-ip")?.trim();
  if (xri) return xri;
  const xff = headers.get("x-forwarded-for")?.trim();
  if (xff) {
    const last = xff.split(",").at(-1)?.trim();
    if (last) return last;
  }
  return "local";
}

export default defineEventHandler(async (event) => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = getRequestHeader(event, "authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const token = authHeader.slice(7);

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, statusMessage: "Server misconfiguration" });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const userId = claimsData.claims.sub;

  if (!(await resolveIsAdmin(supabase, userId))) {
    return { ok: false as const, error: "forbidden" };
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = getIp(event.headers);
  if (!checkRateLimit(`upload:admin:${ip}`, 20, 15 * 60 * 1000)) {
    return { ok: false as const, error: "rate_limited" };
  }

  // ── Parse multipart ───────────────────────────────────────────────────────
  const parts = await readMultipartFormData(event);
  if (!parts) {
    return { ok: false as const, error: "invalid_file" };
  }

  const filePart = parts.find((p) => p.name === "file");
  const prefixPart = parts.find((p) => p.name === "prefix");

  if (!filePart?.data) {
    return { ok: false as const, error: "invalid_file" };
  }

  const prefix = prefixPart?.data?.toString() === "categories" ? "categories" : "products";
  const imageBuffer = Buffer.from(filePart.data);

  // ── Size check (before decoding) ──────────────────────────────────────────
  if (imageBuffer.byteLength > MAX_INPUT_BYTES) {
    return { ok: false as const, error: "file_too_large" };
  }

  // ── Magic-byte check ──────────────────────────────────────────────────────
  const detectedMime = detectMime(imageBuffer);
  if (!detectedMime) {
    return { ok: false as const, error: "invalid_type" };
  }

  // ── Sharp: decode, validate, re-encode to WebP ────────────────────────────
  let outputBuffer: Buffer;
  let width: number;
  let height: number;

  try {
    const pipeline = sharp(imageBuffer, {
      failOn: "truncated",
      limitInputPixels: MAX_DIMENSION * MAX_DIMENSION,
      sequentialRead: false,
    });

    const meta = await pipeline.metadata();

    if (!meta.format || !ACCEPTED_SHARP_FORMATS.has(meta.format)) {
      return { ok: false as const, error: "invalid_type" };
    }

    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w === 0 || h === 0 || w > MAX_DIMENSION || h > MAX_DIMENSION) {
      return { ok: false as const, error: "invalid_dimensions" };
    }

    outputBuffer = await pipeline
      .rotate()
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const outMeta = await sharp(outputBuffer).metadata();
    width = outMeta.width ?? w;
    height = outMeta.height ?? h;
  } catch {
    return { ok: false as const, error: "invalid_file" };
  }

  // ── Generate safe path ────────────────────────────────────────────────────
  const dir = prefix === "categories" ? "categories/" : "";
  const path = `${dir}${generateUUID()}.webp`;

  if (!SAFE_OUTPUT_PATH_RE.test(path)) {
    return { ok: false as const, error: "internal_error" };
  }

  // ── Upload re-encoded WebP via service role ────────────────────────────────
  const { error: storageError } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, outputBuffer, { contentType: "image/webp", upsert: false });

  if (storageError) {
    console.error("[upload-image] storage error:", storageError.message);
    return { ok: false as const, error: "upload_failed" };
  }

  const { data: urlData } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);

  return { ok: true as const, publicUrl: urlData.publicUrl, path, width, height };
});
