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
      { href: '/yonetim/seo', label: 'Arama sonuçları (SEO)' },
      { href: '/yonetim/yonlendirmeler', label: 'Eski adresler (yönlendirme)' },
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

export type Crumb = { label: string; href?: string };

const PROJECTS_HREF = '/yonetim/projeler';

/**
 * Breadcrumbs for a pathname, without the leading "Yönetim". Every crumb but the
 * current one links; a project slug is shown as the project's title when known.
 */
export const crumbsFor = (
  pathname: string,
  projectTitle: (slug: string) => string | undefined = () => undefined,
  messageName: (id: string) => string | undefined = () => undefined,
): Crumb[] => {
  const item = allItems.filter((i) => i.href !== '/yonetim' && currentState(i.href, pathname)).at(-1);
  if (!item) return pathname === '/yonetim' ? [{ label: 'Genel bakış' }] : [];
  const rest = decodeURIComponent(pathname.slice(item.href.length + 1));
  if (!rest) return [{ label: item.href === PROJECTS_HREF ? 'Projeler' : item.label }];
  const parent: Crumb = { label: item.href === PROJECTS_HREF ? 'Projeler' : item.label, href: item.href };
  if (item.href === INBOX_HREF) return [parent, { label: messageName(rest) ?? 'Mesaj' }];
  if (item.href !== PROJECTS_HREF) return [parent, { label: rest }];
  return [parent, { label: rest === 'yeni' ? 'Yeni proje' : (projectTitle(rest) ?? rest) }];
};

/** Sidebar label for an exact screen path, or undefined when the path has no screen. */
export const labelFor = (pathname: string): string | undefined => allItems.find((i) => i.href === pathname)?.label;
