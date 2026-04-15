import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Client do Supabase sem tipagem gen\u00e9rica por enquanto.
 *
 * Para habilitar tipos fortes em queries/mutations/RPCs:
 *   1. pnpm supabase:types  (sobrescreve src/types/database.ts)
 *   2. Adicione: import type { Database } from '@ltypes/database';
 *   3. Mude para: createClient<Database>(...)
 */
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
