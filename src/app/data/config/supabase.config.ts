import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@/env';

/** Singleton instance — created once and reused across the entire app. */
let supabaseClient: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, creating it on first call.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(environment.supabase.url, environment.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        lock: (name, acquireTimeout, fn) => fn()
      }
    });
  }
  return supabaseClient;
}
