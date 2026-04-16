import { createClient } from '@supabase/supabase-js';
import { env } from './env';
// import type { Database } from '@ltypes/database';

/**
 * Client do Supabase.
 *
 * A tipagem genérica `createClient<Database>(...)` está desativada enquanto
 * `src/types/database.ts` é um stub. Para habilitar tipos fortes:
 *
 *   1. pnpm setup                  (sobe Supabase local + aplica migrations)
 *   2. pnpm supabase:types         (gera src/types/database.ts real)
 *   3. Descomente o import e troque createClient() por createClient<Database>()
 *
 * Com o generic ativo, todas as queries, mutations e RPCs passam a ser
 * fortemente tipadas automaticamente, sem alterar mais nada.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
