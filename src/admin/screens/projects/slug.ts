import type { SiteContent } from '@/content/types';

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_MIN = 3;
const SLUG_MAX = 60;
/** Addresses that would collide with panel or editor routes. */
const RESERVED_SLUGS: readonly string[] = ['yeni', 'yonetim'];

const TURKISH: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ğ: 'g',
  Ğ: 'g',
  ş: 's',
  Ş: 's',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
  ç: 'c',
  Ç: 'c',
};

/** ASCII kebab-case address from a title; Turkish letters are transliterated. */
export const slugify = (title: string): string =>
  title
    .replace(/[ıİğĞşŞöÖüÜçÇ]/g, (ch) => TURKISH[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');

/** Turkish message for an unusable address, or undefined when it is valid. `selfId` is the project being edited. */
export const slugError = (c: SiteContent, slug: string, selfId: string): string | undefined => {
  if (!slug) return 'Adres boş bırakılamaz.';
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) return `Adres ${SLUG_MIN}-${SLUG_MAX} karakter olmalı.`;
  if (!SLUG_PATTERN.test(slug)) return 'Yalnız küçük harf, rakam ve tire kullanın; tire başta ya da sonda olamaz.';
  if (RESERVED_SLUGS.includes(slug)) return `"${slug}" ayrılmış bir adres.`;
  if (c.projects.some((p) => p.id !== selfId && p.slug === slug)) return 'Bu adres başka bir projede var.';
  return undefined;
};
