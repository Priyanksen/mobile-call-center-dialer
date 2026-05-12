export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return /^\+?\d{7,15}$/.test(p);
}

export function maskPhone(raw: string): string {
  const p = normalizePhone(raw);
  if (p.length < 4) return p;
  return `${p.slice(0, p.length - 4).replace(/\d/g, '•')}${p.slice(-4)}`;
}
