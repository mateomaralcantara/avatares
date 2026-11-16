export type AppModule = 'landing' | 'dashboard' | 'supabase-ready' | 'auth-shell' | 'admin' | 'health-api';
  
  export interface AppHealth {
    ok: boolean;
    service: string;
    timestamp: string;
  }
  