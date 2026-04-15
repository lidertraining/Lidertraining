/** Retorna "agora h\u00e1 pouco", "2 min", "3 h", "2 d". */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} d`;
  const mo = Math.floor(day / 30);
  return `${mo} mes`;
}
