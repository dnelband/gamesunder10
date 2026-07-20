import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseUrl } from "./env";

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client for cron / server jobs (e.g. resolve auth user emails).
 * Never import this from Client Components or expose the key to the browser.
 */
export function createAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
