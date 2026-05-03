-- Multilingual ingredients; keeps legacy `ingredients` in sync for fallbacks.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ingredients_en TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_he TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_ar TEXT;

UPDATE public.products
SET
  ingredients_en = COALESCE(NULLIF(TRIM(ingredients_en), ''), ingredients),
  ingredients_he = COALESCE(NULLIF(TRIM(ingredients_he), ''), ingredients),
  ingredients_ar = COALESCE(NULLIF(TRIM(ingredients_ar), ''), ingredients)
WHERE ingredients_en IS NULL OR ingredients_he IS NULL OR ingredients_ar IS NULL;
