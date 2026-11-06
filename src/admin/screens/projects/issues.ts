import type { FieldErrors, Working } from './model';

export type TabId = 'info' | 'concept' | 'gallery' | 'pair' | 'seo';

export const TAB_LABEL: Record<TabId, string> = {
  info: 'Bilgiler',
  concept: 'Konsept',
  gallery: 'Galeri',
  pair: 'Önce/Sonra',
  seo: 'SEO',
};

/** A problem the owner can jump to: the tab that holds the field and a `data-pj-field` name or `row:<key>`. */
export type Issue = { tab: TabId; field: string; message: string; target: string };

export const errorIssues = (e: FieldErrors, w: Working): Issue[] => {
  const list: Issue[] = [];
  if (e.title) list.push({ tab: 'info', field: 'Başlık', message: e.title, target: 'title' });
  if (e.slug) list.push({ tab: 'info', field: 'Sayfa adresi (URL)', message: e.slug, target: 'slug' });
  if (e.year) list.push({ tab: 'info', field: 'Yıl', message: e.year, target: 'year' });
  for (const [key, message] of Object.entries(e.gallery)) {
    const index = w.gallery.findIndex((g) => g.key === key);
    list.push({ tab: 'gallery', field: `Alan ${index + 1}`, message, target: `row:${key}` });
  }
  if (e.video) list.push({ tab: 'gallery', field: 'Video', message: e.video, target: 'video' });
  if (e.pair) list.push({ tab: 'pair', field: 'Önce ve sonra görselleri', message: e.pair, target: 'pair' });
  return list;
};

const GAP_TARGETS: [string, Omit<Issue, 'message'>][] = [
  ['başlık', { tab: 'info', field: 'Başlık', target: 'title' }],
  ['geçerli adres', { tab: 'info', field: 'Sayfa adresi (URL)', target: 'slug' }],
  ['kategori', { tab: 'info', field: 'Kategori', target: 'category' }],
  ['konum ve yıl', { tab: 'info', field: 'Konum ve yıl', target: 'location' }],
  ['kapak görseli', { tab: 'gallery', field: 'Kapak görseli', target: 'cover' }],
  ['ana görsel', { tab: 'gallery', field: 'Ana görsel', target: 'hero' }],
  ['görsel açıklaması', { tab: 'gallery', field: 'Görsel açıklaması', target: 'cover' }],
];

/** Where to send the owner for one entry of `publishGaps`. */
export const gapIssue = (gap: string): Issue => {
  const hit = GAP_TARGETS.find(([prefix]) => gap.startsWith(prefix));
  const base = hit ? hit[1] : { tab: 'info' as const, field: gap, target: 'title' };
  return { ...base, message: 'Yayın için eksik.' };
};

export const focusSelector = (target: string): string =>
  target.startsWith('row:')
    ? `[data-id="${target.slice(4)}"] select`
    : `[data-pj-field="${target}"] :is(input, select, textarea, button)`;
