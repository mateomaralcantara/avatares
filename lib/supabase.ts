import { createClient } from '@supabase/supabase-js';
  import { env } from '@/lib/env';
  
  export function createBrowserSupabaseClient() {
    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      throw new Error('Faltan variables públicas de Supabase.');
    }
  
    return createClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  