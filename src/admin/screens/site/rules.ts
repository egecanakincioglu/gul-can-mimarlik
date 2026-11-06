import { tokensIn } from '@/lib/text';
import { EXTRA_TOKENS, tokens } from '@/content/select';
import type { SiteContent } from '@/content/types';

const REQUIRED = 'Bu alan boş bırakılamaz.';

export const requiredText = (value: string, max?: number): string | undefined => {
  if (!value.trim()) return REQUIRED;
  if (max !== undefined && value.length > max) return `En çok ${max} karakter olabilir.`;
  return undefined;
};

export const phoneError = (value: string): string | undefined => {
  if (!value.trim()) return REQUIRED;
  if (!/^[0-9 ]+$/.test(value)) return 'Telefon yalnızca rakam ve boşluk içerebilir.';
  if (value.replace(/\D/g, '').length < 10) return 'Telefon en az 10 rakam içermelidir.';
  return undefined;
};

export const emailError = (value: string): string | undefined => {
  if (!value.trim()) return REQUIRED;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta adresi yazın.';
  return undefined;
};

export const hrefError = (value: string): string | undefined => {
  if (!value.trim()) return REQUIRED;
  if (!/^(\/|https:\/\/)\S*$/.test(value)) return 'Bağlantı "/" ile ya da "https://" ile başlamalıdır.';
  return undefined;
};

/** Advisory only: returns a message, never blocks. */
export const rangeWarning = (value: string, min: number, max: number): string | undefined => {
  if (value.length < min) return `${min}-${max} karakter önerilir; şu an ${value.length}.`;
  if (value.length > max)
    return `${min}-${max} karakter önerilir; şu an ${value.length}. Arama sonuçlarında kesilebilir.`;
  return undefined;
};

const knownTokens = (c: SiteContent) => new Set([...Object.keys(tokens(c, new Date(0))), ...EXTRA_TOKENS]);

export const tokenError = (c: SiteContent, value: string): string | undefined => {
  const known = knownTokens(c);
  const bad = tokensIn(value).find((t) => !known.has(t));
  return bad ? `Bilinmeyen yer tutucu: {${bad}}` : undefined;
};

export const PAGE_NAMES = {
  home: 'Ana sayfa',
  services: 'Hizmetler',
  studio: 'Stüdyo',
  contact: 'İletişim',
  projects: 'Projeler',
} as const;

export const PAGE_PATHS = {
  home: '/',
  services: '/hizmetler',
  studio: '/studyo',
  contact: '/iletisim',
  projects: '/projeler',
} as const;
