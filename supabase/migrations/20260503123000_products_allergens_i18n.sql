-- Multilingual allergens; keeps legacy `allergens` in sync for fallbacks.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS allergens_en TEXT,
  ADD COLUMN IF NOT EXISTS allergens_he TEXT,
  ADD COLUMN IF NOT EXISTS allergens_ar TEXT;

UPDATE public.products
SET
  allergens_en = COALESCE(NULLIF(TRIM(allergens_en), ''), allergens),
  allergens_he = COALESCE(NULLIF(TRIM(allergens_he), ''), allergens),
  allergens_ar = COALESCE(NULLIF(TRIM(allergens_ar), ''), allergens)
WHERE allergens_en IS NULL OR allergens_he IS NULL OR allergens_ar IS NULL;
