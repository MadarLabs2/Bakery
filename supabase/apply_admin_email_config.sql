-- =============================================================================
-- Apply configurable admin email (for databases that already ran older schema)
-- Run once in Supabase → SQL Editor. Default admin: m7md.gara.m@gmail.com
--
-- After this: change admin anytime → Table Editor → public.app_settings → row id=1
-- → edit admin_email (save). Roles sync automatically.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  admin_email TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_settings IS
  'Exactly one row (id=1). admin_email must match auth.users.email (case-insensitive).';

INSERT INTO public.app_settings (id, admin_email)
VALUES (1, 'm7md.gara.m@gmail.com')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
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

-- Re-apply roles for current settings (promotes m7md.gara.m@gmail.com if that account exists)
UPDATE public.app_settings SET admin_email = admin_email WHERE id = 1;
