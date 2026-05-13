-- Optional "was" / list price for sale display (must be > price in app when set).
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(12, 2) NULL;

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_compare_at_non_negative;

ALTER TABLE public.products
ADD CONSTRAINT products_compare_at_non_negative
CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
