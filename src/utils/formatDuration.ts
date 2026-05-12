export function formatDuration(totalSeconds?: number | null): string {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return '00:00';
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  if (s < 3600) return `${mm}:${ss}`;
  const hh = Math.floor(s / 3600).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
