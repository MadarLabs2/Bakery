
-- Revoke execute on SECURITY DEFINER functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict storage SELECT to direct object access (no listing)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images' AND auth.role() IS NOT NULL OR bucket_id = 'product-images');

-- Tighten email subscribers insert (basic email validation)
DROP POLICY IF EXISTS "Anyone subscribes" ON public.email_subscribers;
CREATE POLICY "Anyone subscribes" ON public.email_subscribers FOR INSERT
  WITH CHECK (email IS NOT NULL AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');
