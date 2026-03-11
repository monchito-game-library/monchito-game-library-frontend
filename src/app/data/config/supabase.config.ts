import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Cliente singleton de Supabase
 * Se inicializa una sola vez y se reutiliza en toda la aplicación
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Obtiene o crea el cliente de Supabase
 * @returns Cliente de Supabase configurado
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
