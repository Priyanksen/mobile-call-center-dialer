export const isNonEmpty = (v: string): boolean => v.trim().length > 0;

export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const minLength = (v: string, n: number): boolean => v.trim().length >= n;
