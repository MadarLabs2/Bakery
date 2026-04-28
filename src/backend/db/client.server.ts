// Backend re-export — ADMIN client, service role key, SERVER ONLY.
// Never import this from frontend code.
// Real implementation: src/integrations/supabase/client.server.ts.
export { supabaseAdmin } from "@/integrations/supabase/client.server";
