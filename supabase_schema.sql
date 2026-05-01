-- =============================================================================
-- Gluten-free bakery e-commerce — full PostgreSQL schema for Supabase
-- =============================================================================
-- WHERE TO RUN THIS
--   1. Open https://supabase.com/dashboard → your project
--   2. Left sidebar: SQL Editor → New query
--   3. Paste this entire file → Run (or Ctrl+Enter)
--
-- WHEN TO USE
--   • Best for a NEW project or empty `public` schema.
--   • If you already have tables from older migrations, back up data first,
--     then drop conflicting tables or use a fresh Supabase project.
--
-- After running: change admin anytime in public.app_settings row id=1 (admin_email),
--   or edit the seed below before first install. Triggers sync profiles.role for that Auth email.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helper: updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 1. profiles (table must exist before is_admin(), which PostgreSQL validates at CREATE time)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles (role) WHERE role = 'admin';

-- -----------------------------------------------------------------------------
-- Helper: admin check (SECURITY DEFINER — depends on public.profiles)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- profiles: prevent non-admins from escalating role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_enforce_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
DECLARE
  privileged boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow when session is a DB superuser (typical Supabase SQL Editor as postgres).
    SELECT COALESCE(
      (SELECT r.rolsuper FROM pg_catalog.pg_roles AS r WHERE r.rolname = session_user),
      false
    ) INTO privileged;
    IF privileged THEN
      RETURN NEW;
    END IF;

    -- Logged-in API users: only existing admins may change roles.
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only admins can change profile roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_role_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_enforce_role_change();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. categories
-- -----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_name ON public.categories (name);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_read_all"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_write_admin"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. products (stock_quantity is internal only — omit from customer SELECT via view or API)
-- -----------------------------------------------------------------------------
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT,
  allergens TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products (category_id);
CREATE INDEX idx_products_available ON public.products (is_available) WHERE is_available = true;
CREATE INDEX idx_products_best_seller ON public.products (is_best_seller) WHERE is_best_seller = true;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_read_available_or_admin"
  ON public.products FOR SELECT
  USING (is_available = true OR public.is_admin());

CREATE POLICY "products_write_admin"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. carts
-- -----------------------------------------------------------------------------
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ordered', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_carts_one_active_per_user
  ON public.carts (user_id)
  WHERE status = 'active';

CREATE INDEX idx_carts_user_status ON public.carts (user_id, status);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_own_all"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. cart_items
-- -----------------------------------------------------------------------------
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON public.cart_items (cart_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_own_cart"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. coupons
-- -----------------------------------------------------------------------------
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_active ON public.coupons (is_active) WHERE is_active = true;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_read_active"
  ON public.coupons FOR SELECT
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses)
  );

CREATE POLICY "coupons_read_admin"
  ON public.coupons FOR SELECT
  USING (public.is_admin());

CREATE POLICY "coupons_write_admin"
  ON public.coupons FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons_update_admin"
  ON public.coupons FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "coupons_delete_admin"
  ON public.coupons FOR DELETE
  USING (public.is_admin());

CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. orders
-- -----------------------------------------------------------------------------
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES public.coupons (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    order_status IN (
      'pending', 'confirmed', 'preparing', 'ready',
      'out_for_delivery', 'completed', 'cancelled'
    )
  ),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_created ON public.orders (user_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.orders (order_status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own_or_admin"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. order_items (snapshot product name & price)
-- -----------------------------------------------------------------------------
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(12, 2) NOT NULL CHECK (product_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_visible"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "order_items_insert_own_order"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 9. email_subscribers
-- -----------------------------------------------------------------------------
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_subscribers_insert_public"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

CREATE POLICY "email_subscribers_select_admin"
  ON public.email_subscribers FOR SELECT
  USING (public.is_admin());

CREATE POLICY "email_subscribers_update_admin"
  ON public.email_subscribers FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "email_subscribers_delete_admin"
  ON public.email_subscribers FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 10. email_campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  discount_code TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_campaigns_created ON public.email_campaigns (created_at DESC);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_campaigns_admin_all"
  ON public.email_campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 11. contact_messages
-- -----------------------------------------------------------------------------
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_messages_status ON public.contact_messages (status);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_insert_public"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(message) <= 10000
  );

CREATE POLICY "contact_messages_select_admin"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "contact_messages_update_admin"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- App settings: which Auth email is always admin (edit admin_email in Table Editor)
-- -----------------------------------------------------------------------------
CREATE TABLE public.app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  admin_email TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_settings IS
  'Exactly one row (id=1). Change admin_email here to switch the built-in admin account. Case-insensitive match to auth.users.email.';

INSERT INTO public.app_settings (id, admin_email)
VALUES (1, 'm7md.gara.m@gmail.com')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
-- No policies: table is not exposed via PostgREST to anon/authenticated; edit in Dashboard SQL/Table Editor.

CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.apply_admin_email_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  em TEXT := lower(trim(COALESCE(NEW.admin_email, '')));
BEGIN
  IF em = '' THEN
    RETURN NEW;
  END IF;
  UPDATE public.profiles p
  SET role = 'customer', updated_at = now()
  FROM auth.users u
  WHERE p.id = u.id AND p.role = 'admin' AND lower(trim(u.email)) <> em;
  UPDATE public.profiles p
  SET role = 'admin', updated_at = now()
  FROM auth.users u
  WHERE p.id = u.id AND lower(trim(u.email)) = em;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_admin_email_role() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_app_settings_promote_admin ON public.app_settings;
CREATE TRIGGER trg_app_settings_promote_admin
  AFTER INSERT OR UPDATE OF admin_email ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_admin_email_role();

-- -----------------------------------------------------------------------------
-- Auth: new user → profile + active cart
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_em TEXT;
  new_role TEXT;
BEGIN
  SELECT lower(trim(admin_email)) INTO admin_em FROM public.app_settings WHERE id = 1;
  IF admin_em IS NULL OR admin_em = '' THEN
    new_role := 'customer';
  ELSIF lower(trim(NEW.email)) = admin_em THEN
    new_role := 'admin';
  ELSE
    new_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    new_role
  );
  INSERT INTO public.carts (user_id, status)
  VALUES (NEW.id, 'active');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- After order: bump coupon usage (when coupon_id set)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.orders_increment_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.orders_increment_coupon_usage() FROM PUBLIC;

CREATE TRIGGER trg_orders_coupon_usage
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.orders_increment_coupon_usage();

-- -----------------------------------------------------------------------------
-- Storage: product images (same bucket id as existing app code)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;

CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- -----------------------------------------------------------------------------
-- Sample data: categories & products
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, description, image_url)
VALUES
  (
    'a0000001-0000-4000-8000-000000000001',
    'Breads',
    'Artisan gluten-free loaves baked daily.',
    NULL
  ),
  (
    'a0000001-0000-4000-8000-000000000002',
    'Pastries',
    'Croissants, muffins, and morning treats — all gluten-free.',
    NULL
  ),
  (
    'a0000001-0000-4000-8000-000000000003',
    'Cakes',
    'Celebration cakes and slices without gluten.',
    NULL
  ),
  (
    'a0000001-0000-4000-8000-000000000004',
    'Cookies',
    'Crisp and chewy cookies from dedicated gluten-free ingredients.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (
  id, category_id, name, description, ingredients, allergens, price,
  image_url, stock_quantity, is_best_seller, is_available
)
VALUES
  (
    'b0000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'Seeded Sourdough Loaf',
    'Slow-fermented gluten-free sourdough with toasted seeds.',
    'Brown rice flour, buckwheat flour, psyllium husk, sunflower seeds, flax, sea salt, water, olive oil.',
    'Sesame (seeds). Made in a gluten-free facility.',
    28.00,
    NULL,
    40,
    true,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'Classic White Sandwich Bread',
    'Soft slices perfect for sandwiches and toast.',
    'Tapioca starch, potato starch, egg white powder, honey, yeast, xanthan gum, water.',
    'Eggs.',
    22.00,
    NULL,
    30,
    false,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000003',
    'a0000001-0000-4000-8000-000000000002',
    'Almond Croissant',
    'Buttery layers with almond cream — gluten-free laminated dough.',
    'Almond meal, butter, rice flour, cornstarch, eggs, sugar.',
    'Tree nuts (almond), milk, eggs.',
    16.50,
    NULL,
    24,
    true,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000004',
    'a0000001-0000-4000-8000-000000000002',
    'Blueberry Muffin',
    'Bursting with wild blueberries.',
    'Rice flour, blueberries, cane sugar, eggs, buttermilk, baking powder.',
    'Eggs, milk.',
    12.00,
    NULL,
    36,
    true,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000005',
    'a0000001-0000-4000-8000-000000000003',
    'Chocolate Ganache Cake (6")',
    'Rich dark chocolate layers with silky ganache.',
    'Cocoa, heavy cream, sugar, eggs, gluten-free flour blend (rice, potato, tapioca).',
    'Milk, eggs.',
    145.00,
    NULL,
    8,
    true,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000006',
    'a0000001-0000-4000-8000-000000000003',
    'Carrot Walnut Slice',
    'Spiced carrot cake with cream cheese frosting.',
    'Carrots, walnuts, cinnamon, eggs, cream cheese, gluten-free flour blend.',
    'Tree nuts (walnut), milk, eggs.',
    18.00,
    NULL,
    16,
    false,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000007',
    'a0000001-0000-4000-8000-000000000004',
    'Double Chocolate Cookie',
    'Chewy center, crisp edge, extra chocolate chunks.',
    'Cocoa, chocolate chunks, brown sugar, butter, rice flour, egg.',
    'Milk, eggs, soy (chocolate).',
    8.00,
    NULL,
    60,
    true,
    true
  ),
  (
    'b0000001-0000-4000-8000-000000000008',
    'a0000001-0000-4000-8000-000000000004',
    'Lemon Shortbread',
    'Bright lemon zest in a buttery shortbread.',
    'Butter, rice flour, cornstarch, lemon zest, powdered sugar.',
    'Milk.',
    7.50,
    NULL,
    48,
    false,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Optional welcome coupon (10% off)
INSERT INTO public.coupons (
  code, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active
)
VALUES (
  'WELCOME10',
  'percentage',
  10,
  30,
  500,
  0,
  now() + interval '365 days',
  true
)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- Done. Next: promote your user to admin (SQL editor), then test the app.
-- =============================================================================
