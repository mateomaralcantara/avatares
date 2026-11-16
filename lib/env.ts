export const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };
  
  export function assertPublicEnv() {
    const missing: string[] = [];
  
    if (!env.supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!env.supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
    return {
      ok: missing.length === 0,
      missing,
    };
  }
  