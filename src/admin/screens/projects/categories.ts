import type { ProjectCategory, ProjectFilter, SiteContent } from '@/content/types';

/** Places that still use a project category; empty means it can be deleted. */
export const categoryUsage = (c: SiteContent, category: ProjectCategory): string[] => [
  ...c.projects.filter((p) => p.categoryId === category.id).map((p) => `Proje: ${p.title || p.slug}`),
  ...c.projectFilters
    .filter((f) => f.rule.kind === 'category' && f.rule.categoryId === category.id)
    .map((f) => `Filtre: ${f.label}`),
];

/** Why a filter cannot be deleted; the "all" filter is what the archive shows by default. */
export const filterUsage = (filter: ProjectFilter): string[] =>
  filter.rule.kind === 'all' ? ['Tüm projeleri gösteren filtre arşivde her zaman bulunur.'] : [];

export const ruleText = (c: SiteContent, filter: ProjectFilter): string => {
  const rule = filter.rule;
  if (rule.kind === 'all') return 'Tüm projeler';
  if (rule.kind === 'category')
    return `Kategori: ${c.projectCategories.find((x) => x.id === rule.categoryId)?.name ?? rule.categoryId}`;
  const service = c.serviceCategories.flatMap((cat) => cat.services).find((s) => s.id === rule.serviceId);
  return `Kapsamında uygulama olan projeler: ${service?.name ?? rule.serviceId}`;
};

/** First free id of the form kategori-N. */
export const newCategoryId = (c: SiteContent): string => {
  const taken = new Set(c.projectCategories.map((x) => x.id));
  let n = 1;
  while (taken.has(`kategori-${n}`)) n++;
  return `kategori-${n}`;
};
