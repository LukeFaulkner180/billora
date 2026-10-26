import {createClient, type SupabaseClient} from '@supabase/supabase-js';

/** The public Vite build contains only the Supabase URL and PUBLISHABLE key.
 * Never place a service-role or provider client secret in this application. */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const accountsConfigured = Boolean(url && publishableKey && /^https:\/\/[a-z\d.-]+\.supabase\.co\/?$/i.test(url));
export const supabase: SupabaseClient | null = accountsConfigured
  ? createClient(url!, publishableKey!, {
      auth: {autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce'},
    })
  : null;
