-- =============================================================================
-- OPTIONAL CLEANUP — run only if you previously applied fulfillment time slots
-- and orders fail with ERR_MISSING_FULFILLMENT_TIME
--
-- This restores create_order_secure to date-only validation (no time required).
-- Does NOT drop fulfillment_time_slots table or selected_fulfillment_time column.
-- =============================================================================

DROP FUNCTION IF EXISTS public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INT, TEXT);
DROP FUNCTION IF EXISTS public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INT, TEXT, TEXT);

-- Re-use the date-only RPC from apply_fulfillment_available_days.sql (section 3).
-- Copy that CREATE OR REPLACE FUNCTION block here, or run:
--   supabase/apply_fulfillment_available_days.sql  (section 3 only)
--
-- After running, create_order_secure accepts:
--   p_fulfillment_date, p_fulfillment_day_of_week, p_fulfillment_label
-- and does NOT require p_fulfillment_time.

-- ── Optional: drop time slots table (only if you are sure) ───────────────────
-- DROP TABLE IF EXISTS public.fulfillment_time_slots;

-- ── Optional: drop order time column (only if you are sure) ──────────────────
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS selected_fulfillment_time;
