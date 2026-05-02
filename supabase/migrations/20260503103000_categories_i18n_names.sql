-- Multilingual category display names (keeps legacy `name` populated for backwards compatibility).

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_he TEXT,
  ADD COLUMN IF NOT EXISTS name_ar TEXT;

UPDATE public.categories
SET
  name_en = COALESCE(NULLIF(TRIM(name_en), ''), name),
  name_he = COALESCE(NULLIF(TRIM(name_he), ''), name),
  name_ar = COALESCE(NULLIF(TRIM(name_ar), ''), name);
