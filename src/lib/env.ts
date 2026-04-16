import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  VITE_APP_NAME: z.string().default('LiderTraining'),
});

function parseEnv() {
  const parsed = EnvSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    console.error('❌ Env inválida:', parsed.error.flatten().fieldErrors);
    throw new Error('Variáveis de ambiente inválidas. Cheque .env.local');
  }
  return parsed.data;
}

export const env = parseEnv();
