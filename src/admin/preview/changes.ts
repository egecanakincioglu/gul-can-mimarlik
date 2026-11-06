import type { SiteContent } from '@/content/types';

/** Human name of each top-level content area; projects and media are named per item. */
export const AREA_NAMES: Record<string, string> = {
  site: 'Site ayarları',
  contact: 'İletişim bilgileri',
  navigation: 'Gezinme',
  seo: 'SEO',
  ui: 'Metinler',
  labels: 'Metinler',
  demo: 'Metinler',
  footer: 'Alt bilgi',
  home: 'Ana sayfa',
  serviceCategories: 'Hizmetler sayfası',
  processSteps: 'Süreç adımları',
  servicesPage: 'Hizmetler sayfası',
  studioPage: 'Stüdyo sayfası',
  contactPage: 'İletişim sayfası',
  projectsPage: 'Projeler sayfası',
  projectPage: 'Metinler',
  projectCategories: 'Kategoriler',
  projectFilters: 'Kategoriler',
  redirects: 'Yönlendirmeler',
};

const differs = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

/** Ids present in only one list or whose entry differs. */
const changedIds = <T extends { id: string }>(draft: T[], published: T[]): string[] => {
  const d = byId(draft);
  const p = byId(published);
  const ids = new Set([...d.keys(), ...p.keys()]);
  return [...ids].filter((id) => differs(d.get(id), p.get(id)));
};

/** Names the parts of the site whose draft differs from the published content, in display order. */
export const changedAreas = (draft: SiteContent, published: SiteContent): string[] => {
  const names: string[] = [];
  const add = (name: string) => {
    if (!names.includes(name)) names.push(name);
  };

  for (const [key, name] of Object.entries(AREA_NAMES)) {
    const k = key as keyof SiteContent;
    if (differs(draft[k], published[k])) add(name);
  }

  const titles = new Map([...published.projects, ...draft.projects].map((p) => [p.id, p.title]));
  for (const id of changedIds(draft.projects, published.projects)) add(`${titles.get(id) ?? id} projesi`);
  // Reordering projects changes no single project but still changes the site.
  if (
    changedIds(draft.projects, published.projects).length === 0 &&
    differs(
      draft.projects.map((p) => p.id),
      published.projects.map((p) => p.id),
    )
  ) {
    add('Proje sırası');
  }

  const media = changedIds(draft.media, published.media).length;
  if (media > 0) add(`Medya: ${media} görsel`);

  return names;
};
