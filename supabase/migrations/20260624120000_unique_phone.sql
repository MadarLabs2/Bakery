-- Prevent duplicate phone numbers across accounts.
-- Normalize: strip spaces, enforce non-empty via NULLIF so NULL phones don't conflict.

CREATE UNIQUE INDEX idx_profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone <> '';
