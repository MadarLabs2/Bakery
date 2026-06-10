-- Sprint 5: Upload Security — Storage RLS hardening
--
-- Drops ALL existing storage.objects policies for the product-images bucket
-- and recreates them with:
--   • Admin-only INSERT/UPDATE/DELETE via public.is_admin() (SECURITY DEFINER,
--     checks user_roles + profiles.role — defined in sprint2_rls_hardening).
--   • Path format enforcement: only UUID.ext or categories/UUID.ext where ext
--     is one of jpg, jpeg, png, webp, avif.  Rejects SVG and any other type.
--   • Public SELECT kept for the whole bucket (images are publicly served).
--   • Anonymous and customer users cannot INSERT, UPDATE, or DELETE.

-- ── Step 1: drop every existing policy on storage.objects for this bucket ────
-- We iterate pg_policies rather than hardcoding names because earlier migrations
-- may have used different naming conventions.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM   pg_policies
    WHERE  schemaname = 'storage'
      AND  tablename  = 'objects'
      AND  (
        policyname LIKE '%product_image%'
        OR policyname LIKE '%product-image%'
        OR policyname LIKE '%sprint5%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Dropped storage policy: %', pol.policyname;
  END LOOP;
END;
$$;

-- ── Step 2: public read ───────────────────────────────────────────────────────
-- Product and category images are publicly served; anyone can SELECT.

CREATE POLICY "sprint5_product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- ── Step 3: admin INSERT ──────────────────────────────────────────────────────
-- Authenticated admin only.
-- Path must be UUID.ext (products) or categories/UUID.ext (categories).
-- Accepted extensions: jpg, jpeg, png, webp, avif — SVG and others are rejected.

CREATE POLICY "sprint5_product_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (
      -- Product images: {uuid}.{ext}
      name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
      OR
      -- Category images: categories/{uuid}.{ext}
      name ~ '^categories/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
    )
  );

-- ── Step 4: admin UPDATE ──────────────────────────────────────────────────────

CREATE POLICY "sprint5_product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (
      name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
      OR
      name ~ '^categories/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
    )
  );

-- ── Step 5: admin DELETE ──────────────────────────────────────────────────────

CREATE POLICY "sprint5_product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- ── Step 6: self-verification ─────────────────────────────────────────────────

DO $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM   pg_policies
  WHERE  schemaname = 'storage'
    AND  tablename  = 'objects'
    AND  policyname LIKE 'sprint5_product_images%';

  IF cnt <> 4 THEN
    RAISE EXCEPTION
      'Sprint5 storage migration invariant violated: expected 4 sprint5 policies, found %', cnt;
  END IF;

  RAISE NOTICE 'Sprint 5 storage security migration applied successfully (% policies).', cnt;
END;
$$;
