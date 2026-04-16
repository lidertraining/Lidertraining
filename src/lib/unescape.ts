/**
 * Decodifica escapes \uXXXX que ficaram literais em strings
 * (bug antigo: seed SQL com 'Sua Hist\u00f3ria' gravou o texto literal
 * porque Postgres não interpreta \u fora de E-strings).
 *
 * Self-healing: aplicado no cliente sobre qualquer texto vindo do banco.
 */
export function unescapeUnicode(text: string | null | undefined): string {
  if (!text) return '';
  if (!text.includes('\\u')) return text;
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

/**
 * Aplica unescapeUnicode em todos os campos string de um objeto
 * (1 nível de profundidade). Ideal para rows retornadas do Supabase.
 */
export function unescapeRow<T>(row: T): T {
  if (!row || typeof row !== 'object') return row;
  const out: Record<string, unknown> = { ...(row as Record<string, unknown>) };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (typeof v === 'string') out[k] = unescapeUnicode(v);
  }
  return out as T;
}
