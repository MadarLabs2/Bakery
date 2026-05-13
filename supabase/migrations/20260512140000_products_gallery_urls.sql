-- Extra product photos (cover remains `image_url` for shop cards and primary hero).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}';

-- Refresh PostgREST so the API sees the new column immediately.
NOTIFY pgrst, 'reload schema';
