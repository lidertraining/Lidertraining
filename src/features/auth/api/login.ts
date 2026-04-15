import { supabase } from '@lib/supabase';
import type { LoginInput } from '../schemas';

export async function login({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
