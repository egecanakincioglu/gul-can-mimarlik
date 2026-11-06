type NavItem = { href: string; label: string };
export type NavGroup = { label: string | null; items: NavItem[] };

export const INBOX_HREF = '/yonetim/gelen-kutusu';

export const navGroups: NavGroup[] = [
  { label: null, items: [{ href: '/yonetim', label: 'Genel bakış' }] },
  {
    label: 'Sayfalar',
    items: [
      { href: '/yonetim/ana-sayfa', label: 'Ana sayfa' },
      { href: '/yonetim/hizmetler', label: 'Hizmetler' },
      { href: '/yonetim/studyo', label: 'Stüdyo' },
      { href: '/yonetim/iletisim-sayfasi', label: 'İletişim sayfası' },
      { href: '/yonetim/projeler-sayfasi', label: 'Projeler sayfası' },
      { href: '/yonetim/surec-adimlari', label: 'Süreç adımları' },
      { href: '/yonetim/alt-bilgi', label: 'Alt bilgi' },
    ],
  },
  {
    label: 'Projeler',
    items: [
      { href: '/yonetim/projeler', label: 'Tüm projeler' },
      { href: '/yonetim/kategoriler', label: 'Kategoriler' },
    ],
  },
  { label: 'Medya', items: [{ href: '/yonetim/medya', label: 'Medya kütüphanesi' }] },
  { label: 'Mesajlar', items: [{ href: INBOX_HREF, label: 'Gelen kutusu' }] },
  {
    label: 'Site',
    items: [
      { href: '/yonetim/site-ayarlari', label: 'Site ayarları' },
      { href: '/yonetim/iletisim-bilgileri', label: 'İletişim bilgileri' },
      { href: '/yonetim/gezinme', label: 'Gezinme' },
      { href: '/yonetim/seo', label: 'SEO' },
      { href: '/yonetim/yonlendirmeler', label: 'Yönlendirmeler' },
      { href: '/yonetim/metinler', label: 'Metinler' },
    ],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

/** 'page' for the exact route, 'true' for a parent of the current route. */
export const currentState = (href: string, pathname: string): 'page' | 'true' | undefined => {
  if (pathname === href) return 'page';
  if (href !== '/yonetim' && pathname.startsWith(`${href}/`)) return 'true';
  return undefined;
};

/** Breadcrumb labels for a pathname, without the leading "Yönetim". */
export const crumbsFor = (pathname: string): string[] => {
  const item = allItems.filter((i) => i.href !== '/yonetim' && currentState(i.href, pathname)).at(-1);
  if (!item) return pathname === '/yonetim' ? ['Genel bakış'] : [];
  const rest = pathname.slice(item.href.length + 1);
  return rest ? [item.label, decodeURIComponent(rest)] : [item.label];
};

/** Sidebar label for an exact screen path, or undefined when the path has no screen. */
export const labelFor = (pathname: string): string | undefined => allItems.find((i) => i.href === pathname)?.label;
