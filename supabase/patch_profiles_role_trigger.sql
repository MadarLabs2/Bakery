-- Run once on existing DBs to fix SQL Editor / JWT conflicts on profile role updates.
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
    SELECT COALESCE(
      (SELECT r.rolsuper FROM pg_catalog.pg_roles AS r WHERE r.rolname = session_user),
      false
    ) INTO privileged;
    IF privileged THEN
      RETURN NEW;
    END IF;
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only admins can change profile roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
