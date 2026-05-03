-- Multilingual product descriptions; keeps legacy `description` in sync for fallbacks and old queries.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_he TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

UPDATE public.products
SET
  description_en = COALESCE(NULLIF(TRIM(description_en), ''), description),
  description_he = COALESCE(NULLIF(TRIM(description_he), ''), description),
  description_ar = COALESCE(NULLIF(TRIM(description_ar), ''), description)
WHERE description_en IS NULL OR description_he IS NULL OR description_ar IS NULL;
