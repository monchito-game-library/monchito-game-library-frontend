/**
 * EXAMPLE FILE
 * Copy this file to environment.ts and fill in your real credentials.
 * Do NOT use this file directly — the compiler reads environment.ts.
 *
 * Required credentials:
 *
 * SUPABASE
 *   1. Go to https://supabase.com and open your project
 *   2. Settings > API
 *   3. Copy the "Project URL" and "anon / public key"
 *
 * RAWG (game catalogue)
 *   1. Go to https://rawg.io/apidocs
 *   2. Sign up and get your free API key
 */
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxxxxxxxxxx.supabase.co',
    anonKey: 'TU_SUPABASE_ANON_KEY'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: 'TU_RAWG_API_KEY'
  },
  sentry: {
    dsn: '',
    enabled: false
  }
};
