import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";

type UntypedClient = SupabaseClient<Database> & {
  from: (relation: string) => ReturnType<SupabaseClient<Database>["from"]>;
};

/**
 * True if the current session user is an admin. Supports:
 * - `public.is_admin()` RPC (profiles.role–based schema)
 * - `user_roles` row with role `admin` (migration schema)
 * - `profiles.role === 'admin'` when present
 */
export async function resolveIsAdmin(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data: rpcResult, error: rpcError } = await client.rpc("is_admin");
  if (!rpcError && typeof rpcResult === "boolean") {
    return rpcResult;
  }

  // `user_roles` may exist at runtime but not in generated Database types.
  const { data: userRoleRow, error: userRolesError } = await (client as UntypedClient)
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!userRolesError && userRoleRow) {
    return true;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profile?.role === "admin") {
    return true;
  }

  return false;
}
