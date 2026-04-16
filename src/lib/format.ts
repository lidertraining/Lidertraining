/** Formatadores em pt-BR. */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Formata número como moeda brasileira (ex: R$ 1.500). */
export function formatBRL(value: number): string {
  return BRL.format(value);
}

/** Formata número de XP com separador de milhar (ex: 12.500). */
export function formatXP(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/** Formata duração em segundos para "Xh Ym" ou "Ym Zs". */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Formata duração para áudios (MM:SS). */
export function formatAudioLength(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Retorna string YYYY-MM-DD no fuso local. */
export function toLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
