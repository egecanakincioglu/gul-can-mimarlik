import type { SiteContent } from '@/content/types';

type Usage = { label: string; href: string };

const SECTIONS: [RegExp, string, string][] = [
  [/^home\.hero/, 'Ana sayfa: ana görsel', '/yonetim/ana-sayfa'],
  [/^home\.materials/, 'Ana sayfa: malzemeler', '/yonetim/ana-sayfa'],
  [/^home\.studioTeaser/, 'Ana sayfa: stüdyo', '/yonetim/ana-sayfa'],
  [/^studioPage/, 'Stüdyo sayfası', '/yonetim/studyo'],
  [/^seo\.ogImage/, 'Paylaşım görseli', '/yonetim/site-ayarlari'],
];

/** Human label and panel address for a path returned by `mediaUsage`. */
export const describeUsage = (c: SiteContent, path: string): Usage => {
  for (const [re, label, href] of SECTIONS) if (re.test(path)) return { label, href };
  const category = /^serviceCategories\.([^.]+)\./.exec(path);
  if (category) {
    const name = c.serviceCategories.find((x) => x.id === category[1])?.name;
    return { label: `Hizmetler: ${name ?? category[1]}`, href: '/yonetim/hizmetler' };
  }
  const project = /^projects\.([^.]+)\.(.+)$/.exec(path);
  if (project) {
    const p = c.projects.find((x) => x.id === project[1]);
    return {
      label: `Proje: ${p?.title ?? project[1]} (${project[2]})`,
      href: `/yonetim/projeler/${p?.slug ?? project[1]}`,
    };
  }
  return { label: path, href: '/yonetim' };
};
