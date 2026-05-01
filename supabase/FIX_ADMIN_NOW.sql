-- =============================================================================
-- FORCE ADMIN — always works (temporarily disables the role guard trigger)
-- Run in: Supabase → SQL Editor → paste → Run
--
-- If your Auth email is not m7md.gara.m@gmail.com, change it to match
-- Authentication → Users → exact email.
-- =============================================================================

BEGIN;

ALTER TABLE public.profiles DISABLE TRIGGER trg_profiles_role_guard;

UPDATE public.profiles AS p
SET role = 'admin',
    updated_at = now()
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(trim(u.email)) = lower(trim('m7md.gara.m@gmail.com'));

ALTER TABLE public.profiles ENABLE TRIGGER trg_profiles_role_guard;

COMMIT;

-- Optional: confirm
-- SELECT u.email, p.role
-- FROM auth.users u
-- JOIN public.profiles p ON p.id = u.id
-- WHERE lower(trim(u.email)) = lower(trim('m7md.gara.m@gmail.com'));
