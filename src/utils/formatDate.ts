export function formatDate(input?: string | null, opts: 'date' | 'datetime' | 'time' = 'datetime'): string {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  if (opts === 'date') return d.toLocaleDateString();
  if (opts === 'time') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function relativeFromNow(input?: string | null): string {
  if (!input) return '—';
  const d = new Date(input).getTime();
  if (Number.isNaN(d)) return '—';
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const h = Math.round(m / 60);
  const days = Math.round(h / 24);
  const sign = diff < 0 ? 'ago' : 'in';
  if (m < 60) return `${sign} ${m}m`;
  if (h < 24) return `${sign} ${h}h`;
  return `${sign} ${days}d`;
}
