import { tokensIn } from '@/lib/text';
import { ASPECT, ASPECT_TOLERANCE, fitsAspect } from './aspects';
import { EXTRA_TOKENS, PUBLIC_PATHS, imageRefs, tokens } from './select';
import type { SiteContent } from './types';

export type Issue = { path: string; code: string };

const walk = (value: unknown, path: string, visit: (v: unknown, path: string) => void) => {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((x, i) => walk(x, `${path}[${i}]`, visit));
  else if (value && typeof value === 'object') {
    for (const [k, x] of Object.entries(value)) walk(x, path ? `${path}.${k}` : k, visit);
  }
};

const isSeg = (v: unknown): v is { text: string } => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.includes('text') && keys.every((k) => k === 'text' || k === 'weight');
};

/** Checks the whole content; the seed must return no issues. */
export const validate = (c: SiteContent): Issue[] => {
  const issues: Issue[] = [];
  const add = (path: string, code: string) => issues.push({ path, code });

  const unique = (list: { id?: string; slug?: string }[], key: 'id' | 'slug', path: string) => {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      const v = item[key];
      if (v === undefined) return;
      if (seen.has(v)) add(`${path}[${i}].${key}`, `duplicate-${key}`);
      seen.add(v);
    });
  };
  unique(c.media, 'id', 'media');
  unique(c.projects, 'id', 'projects');
  unique(c.projects, 'slug', 'projects');
  unique(c.projectCategories, 'id', 'projectCategories');
  unique(c.projectFilters, 'id', 'projectFilters');
  unique(c.projectFilters, 'slug', 'projectFilters');
  unique(c.serviceCategories, 'id', 'serviceCategories');
  unique(c.serviceCategories, 'slug', 'serviceCategories');
  unique(
    c.serviceCategories.flatMap((cat) => cat.services),
    'id',
    'serviceCategories.services',
  );
  unique(c.processSteps, 'id', 'processSteps');
  unique(c.navigation, 'id', 'navigation');
  unique(c.redirects, 'id', 'redirects');

  const mediaIds = new Set(c.media.map((m) => m.id));
  const projectIds = new Set(c.projects.map((p) => p.id));
  const categoryIds = new Set(c.projectCategories.map((x) => x.id));
  const serviceIds = new Set(c.serviceCategories.flatMap((cat) => cat.services.map((s) => s.id)));

  c.media.forEach((m, i) => {
    if (m.decorative) {
      if (m.alt !== '') add(`media[${i}].alt`, 'decorative-with-alt');
    } else if (!m.alt.trim()) add(`media[${i}].alt`, 'empty-alt');
  });
  const decorativeIds = new Set(c.media.filter((m) => m.decorative).map((m) => m.id));
  for (const { path, ref } of imageRefs(c)) {
    if (!mediaIds.has(ref.media)) add(path, 'missing-media');
    if (ref.alt !== undefined && !ref.alt.trim() && !decorativeIds.has(ref.media)) add(`${path}.alt`, 'empty-alt');
  }

  c.projects.forEach((p, i) => {
    const at = `projects[${i}]`;
    if (!categoryIds.has(p.categoryId)) add(`${at}.categoryId`, 'missing-category');
    p.scope.forEach((s, k) => {
      if (!serviceIds.has(s)) add(`${at}.scope[${k}]`, 'missing-service');
    });
    if (!p.concept && (!p.location || p.year === undefined)) add(at, 'real-project-needs-location-year');
    if (p.concept && (p.location !== undefined || p.year !== undefined)) add(at, 'concept-has-location-year');
    p.gallery.forEach((g, k) => {
      const m = c.media.find((x) => x.id === g.image.media);
      if (m && !fitsAspect(m, ASPECT[g.slot], ASPECT_TOLERANCE)) add(`${at}.gallery[${k}]`, 'aspect-mismatch');
    });
  });

  c.serviceCategories.forEach((cat, i) => {
    if (cat.projectId !== null && !projectIds.has(cat.projectId))
      add(`serviceCategories[${i}].projectId`, 'missing-project');
  });
  c.projectFilters.forEach((f, i) => {
    const rule = f.rule;
    if (rule.kind === 'category' && !categoryIds.has(rule.categoryId))
      add(`projectFilters[${i}].rule`, 'missing-category');
    if (rule.kind === 'service' && !serviceIds.has(rule.serviceId)) add(`projectFilters[${i}].rule`, 'missing-service');
  });

  const slots = c.home.featured.slots;
  if (slots.length !== 4) add('home.featured.slots', 'featured-count');
  slots.forEach((s, i) => {
    const p = c.projects.find((x) => x.id === s.projectId);
    if (!p) add(`home.featured.slots[${i}]`, 'missing-project');
    else if (!p.published) add(`home.featured.slots[${i}]`, 'featured-unpublished');
  });
  c.home.materials.items.forEach((item, i) => {
    if (!projectIds.has(item.projectId)) add(`home.materials.items[${i}].projectId`, 'missing-project');
  });
  const baId = c.home.beforeAfter.projectId;
  if (baId !== null) {
    const p = c.projects.find((x) => x.id === baId);
    if (!p) add('home.beforeAfter.projectId', 'missing-project');
    else if (!p.beforeAfter) add('home.beforeAfter.projectId', 'before-after-missing');
  }

  const livePaths = new Set(c.projects.filter((p) => p.published).map((p) => `/projeler/${p.slug}`));
  const targets = new Set<string>([...PUBLIC_PATHS, ...livePaths]);
  const froms = new Set<string>();
  c.redirects.forEach((r, i) => {
    const at = `redirects[${i}]`;
    if (froms.has(r.from)) add(`${at}.from`, 'redirect-duplicate-from');
    froms.add(r.from);
    if (r.from === r.to) add(at, 'redirect-self');
    if (livePaths.has(r.from)) add(`${at}.from`, 'redirect-shadows-project');
    if ((PUBLIC_PATHS as readonly string[]).includes(r.from)) add(`${at}.from`, 'redirect-shadows-page');
    if (!targets.has(r.to)) add(`${at}.to`, 'redirect-dangling');
  });
  c.redirects.forEach((r, i) => {
    if (r.from !== r.to && c.redirects.some((o) => o.from === r.to)) add(`redirects[${i}].to`, 'redirect-chain');
  });

  if (!c.seo.titleTemplate.includes('%s')) add('seo.titleTemplate', 'title-template-missing-placeholder');

  const known = new Set([...Object.keys(tokens(c, new Date(0))), ...EXTRA_TOKENS]);
  walk(c, '', (v, path) => {
    if (typeof v === 'string') {
      for (const t of tokensIn(v)) if (!known.has(t)) add(path, 'unknown-token');
    } else if (isSeg(v) && v.text === '') add(path, 'rich-empty-segment');
  });

  return issues;
};
