import { fill, trCapital, trLocative, trMonth, trNumberWord } from '@/lib/text';
import type {
  DemoTexts,
  GalleryItem,
  ImageRef,
  Img,
  MediaItem,
  PageKey,
  PageSeo,
  Project,
  ProjectId,
  Redirect,
  SiteContent,
} from './types';

const projectPath = (slug: string) => `/projeler/${slug}`;

export const publishedProjects = (c: SiteContent): Project[] => c.projects.filter((p) => p.published);

export const getProjectById = (c: SiteContent, id: ProjectId): Project | undefined =>
  c.projects.find((p) => p.id === id);

/** Unpublished projects are not reachable by slug. */
export const getProjectBySlug = (c: SiteContent, slug: string): Project | undefined =>
  c.projects.find((p) => p.published && p.slug === slug);

/** The next published project, wrapping around at the end. */
export const nextProject = (c: SiteContent, id: ProjectId): Project | undefined => {
  const list = publishedProjects(c);
  const i = list.findIndex((p) => p.id === id);
  return i < 0 ? undefined : list[(i + 1) % list.length];
};

const mediaOf = (c: SiteContent, id: string): MediaItem => {
  const m = c.media.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown media: ${id}`);
  return m;
};

export const resolveImage = (c: SiteContent, ref: ImageRef): Img => {
  const m = mediaOf(c, ref.media);
  const focal = ref.focal ?? m.focal;
  return { src: m.file, alt: ref.alt ?? m.alt, focalX: focal.x, focalY: focal.y };
};

/** Label of the kind of picture, or null for a real photograph. */
export const illustrativeLabel = (c: SiteContent, ref: ImageRef): string | null => {
  const kind = mediaOf(c, ref.media).illustrative;
  return kind ? c.labels.illustrative[kind] : null;
};

export const captionOf = (c: SiteContent, item: GalleryItem): string => {
  const label = illustrativeLabel(c, item.image);
  return [label, item.caption].filter(Boolean).join(' · ');
};

export const conceptBadge = (c: SiteContent, p: Project): string | null => (p.concept ? c.labels.concept : null);

export const conceptLine = (c: SiteContent, p: Project): string | null =>
  p.concept ? c.projectPage.conceptNote : null;

export type Fact = { id: 'kind' | 'status' | 'location' | 'year'; label: string; value: string };

/** Fact rows of the project page, in display order. The scope row is built from `scopeLinks`. */
export const projectFacts = (c: SiteContent, p: Project): Fact[] => {
  const category = c.projectCategories.find((x) => x.id === p.categoryId)?.name ?? '';
  const facts: Fact[] = [{ id: 'kind', label: c.ui.kind, value: `${p.kind} · ${category}` }];
  if (p.concept) {
    facts.push({ id: 'status', label: c.ui.status, value: c.labels.statusConcept });
    facts.push({ id: 'location', label: c.ui.location, value: c.labels.locationConcept });
  } else {
    if (p.location) facts.push({ id: 'location', label: c.ui.location, value: p.location });
    if (p.year !== undefined) facts.push({ id: 'year', label: c.ui.year, value: String(p.year) });
  }
  return facts;
};

export const scopeLinks = (c: SiteContent, p: Project): { id: string; name: string; href: string }[] =>
  p.scope.flatMap((serviceId) => {
    const category = c.serviceCategories.find((cat) => cat.services.some((s) => s.id === serviceId));
    const service = category?.services.find((s) => s.id === serviceId);
    return category && service ? [{ id: serviceId, name: service.name, href: `/hizmetler#${category.slug}` }] : [];
  });

export const counts = (c: SiteContent) => ({
  categories: c.serviceCategories.length,
  services: c.serviceCategories.reduce((sum, cat) => sum + cat.services.length, 0),
  steps: c.processSteps.length,
});

export const tokens = (c: SiteContent, now: Date): Record<string, string> => {
  const n = counts(c);
  const { year, month } = c.site.founded;
  return {
    categories: trNumberWord(n.categories),
    Categories: trCapital(trNumberWord(n.categories)),
    services: trNumberWord(n.services),
    Services: trCapital(trNumberWord(n.services)),
    steps: trNumberWord(n.steps),
    Steps: trCapital(trNumberWord(n.steps)),
    founded: `${trMonth(month)} ${year}`,
    foundedIn: `${trMonth(month)} ${year}'${trLocative(year)}`,
    year: String(now.getFullYear()),
    name: c.site.name,
  };
};

/** Per-call tokens that are not derived from the content (a count, for example). */
export const EXTRA_TOKENS = ['n'] as const;

export const text = (c: SiteContent, template: string, now: Date = new Date()): string =>
  fill(template, tokens(c, now));

/** Demo texts exist only while demo mode is on. */
export const demoText = (c: SiteContent, key: keyof DemoTexts): string | null => (c.site.demoMode ? c.demo[key] : null);

export const filterProjects = (c: SiteContent, filterId: string): Project[] => {
  const rule = c.projectFilters.find((f) => f.id === filterId)?.rule;
  const list = publishedProjects(c);
  if (!rule) return list;
  if (rule.kind === 'all') return list;
  if (rule.kind === 'category') return list.filter((p) => p.categoryId === rule.categoryId);
  return list.filter((p) => p.scope.includes(rule.serviceId));
};

export const filterCount = (c: SiteContent, filterId: string): number => filterProjects(c, filterId).length;

export const seoForPage = (c: SiteContent, key: PageKey): Required<PageSeo> => {
  const page = c.seo.pages[key];
  return {
    title: page.title,
    description: page.description ?? c.seo.description + (c.site.demoMode ? c.seo.demoSuffix : ''),
  };
};

export const seoForProject = (c: SiteContent, p: Project): Required<PageSeo> => ({
  title: p.seo?.title ?? (p.concept ? `${p.title} — ${c.labels.concept}` : p.title),
  description: p.seo?.description ?? p.summary,
});

export const resolveRedirect = (c: SiteContent, path: string): string | null =>
  c.redirects.find((r) => r.from === path)?.to ?? null;

/** Renames a slug and keeps the old address alive; older redirects are rewritten, so there are no chains. */
export const renameSlug = (c: SiteContent, id: ProjectId, newSlug: string): SiteContent => {
  const project = getProjectById(c, id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  if (project.slug === newSlug) return c;
  if (c.projects.some((p) => p.id !== id && p.slug === newSlug)) throw new Error(`Slug already in use: ${newSlug}`);
  const from = projectPath(project.slug);
  const to = projectPath(newSlug);
  const kept: Redirect[] = c.redirects
    .filter((r) => r.from !== to && r.from !== from)
    .map((r) => (r.to === from ? { ...r, to } : r));
  return {
    ...c,
    projects: c.projects.map((p) => (p.id === id ? { ...p, slug: newSlug } : p)),
    redirects: [...kept, { id: `redirect-${project.slug}`, from, to }],
  };
};

/** Every image reference in the content with the path it lives at. */
export const imageRefs = (c: SiteContent): { path: string; ref: ImageRef }[] => {
  const out: { path: string; ref: ImageRef }[] = [
    { path: 'home.hero.posterDesktop', ref: c.home.hero.posterDesktop },
    { path: 'home.hero.posterMobile', ref: c.home.hero.posterMobile },
    { path: 'home.studioTeaser.image', ref: c.home.studioTeaser.image },
    { path: 'studioPage.image', ref: c.studioPage.image },
  ];
  if (c.seo.ogImage) out.push({ path: 'seo.ogImage', ref: c.seo.ogImage });
  for (const item of c.home.materials.items) out.push({ path: `home.materials.${item.id}`, ref: item.image });
  for (const cat of c.serviceCategories) out.push({ path: `serviceCategories.${cat.id}.image`, ref: cat.image });
  for (const p of c.projects) {
    out.push({ path: `projects.${p.id}.cover`, ref: p.cover }, { path: `projects.${p.id}.hero`, ref: p.hero });
    p.gallery.forEach((g, i) => out.push({ path: `projects.${p.id}.gallery[${i}]`, ref: g.image }));
    if (p.beforeAfter) {
      out.push({ path: `projects.${p.id}.beforeAfter.before`, ref: p.beforeAfter.before });
      out.push({ path: `projects.${p.id}.beforeAfter.after`, ref: p.beforeAfter.after });
    }
    if (p.video) out.push({ path: `projects.${p.id}.video.poster`, ref: p.video.poster });
  }
  return out;
};

export const mediaUsage = (c: SiteContent, mediaId: string): string[] =>
  imageRefs(c)
    .filter((x) => x.ref.media === mediaId)
    .map((x) => x.path);

export const phoneHref = (c: SiteContent): string => `tel:+90${c.contact.phone.replace(/\D/g, '').replace(/^0/, '')}`;

export const emailHref = (c: SiteContent): string => `mailto:${c.contact.email}`;
