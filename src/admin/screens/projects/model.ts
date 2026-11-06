import { renameSlug, seoForProject } from '@/content/select';
import type { GalleryItem, ImageRef, Project, SiteContent } from '@/content/types';
import { fitsRatio, RATIOS } from '../media/ratios';
import { slugError } from './slug';

export type Keyed<T> = { key: string; value: T };
let counter = 0;
/** Stable identity for list rows, so editing a row never remounts it. */
export const keyed = <T>(value: T): Keyed<T> => ({ key: `row-${++counter}`, value });

type Note = Project['notes'][number];

export type Working = {
  /** Empty while the project is new. */
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  kind: string;
  scope: string[];
  summary: string;
  narrative: Keyed<string>[];
  materials: Keyed<string>[];
  notes: Keyed<Note>[];
  concept: boolean;
  location: string;
  year: string;
  cover: ImageRef | null;
  hero: ImageRef | null;
  gallery: Keyed<GalleryItem>[];
  galleryNote: string;
  pair: { before: ImageRef | null; after: ImageRef | null; lead: string; mode: 'slider' | 'toggle' };
  video: { file: string; poster: ImageRef | null } | null;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

/** A new project starts with nothing in it. */
export const emptyWorking = (): Working => ({
  id: '',
  slug: '',
  title: '',
  categoryId: '',
  kind: '',
  scope: [],
  summary: '',
  narrative: [],
  materials: [],
  notes: [],
  concept: false,
  location: '',
  year: '',
  cover: null,
  hero: null,
  gallery: [],
  galleryNote: '',
  pair: { before: null, after: null, lead: '', mode: 'slider' },
  video: null,
  published: false,
  seoTitle: '',
  seoDescription: '',
});

export const fromProject = (p: Project): Working => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  categoryId: p.categoryId,
  kind: p.kind,
  scope: [...p.scope],
  summary: p.summary,
  narrative: p.narrative.map(keyed),
  materials: p.materials.map(keyed),
  notes: p.notes.map(keyed),
  concept: p.concept,
  location: p.location ?? '',
  year: p.year === undefined ? '' : String(p.year),
  cover: p.cover.media ? p.cover : null,
  hero: p.hero.media ? p.hero : null,
  gallery: p.gallery.map(keyed),
  galleryNote: p.galleryNote ?? '',
  pair: p.beforeAfter
    ? {
        before: p.beforeAfter.before,
        after: p.beforeAfter.after,
        lead: p.beforeAfter.lead,
        mode: p.beforeAfter.mode ?? 'slider',
      }
    : { before: null, after: null, lead: '', mode: 'slider' },
  video: p.video ? { file: p.video.file, poster: p.video.poster.media ? p.video.poster : null } : null,
  published: p.published,
  seoTitle: p.seo?.title ?? '',
  seoDescription: p.seo?.description ?? '',
});

/** Placeholder for an image that is not chosen yet; content validation reports it as a missing media item. */
const EMPTY_IMAGE: ImageRef = { media: '' };
const filled = (rows: Keyed<string>[]) => rows.map((r) => r.value.trim()).filter(Boolean);

export const toProject = (w: Working, id: string, c: SiteContent): Project => {
  const project: Project = {
    id,
    slug: w.slug,
    title: w.title.trim(),
    categoryId: w.categoryId,
    kind: w.kind.trim(),
    scope: w.scope,
    summary: w.summary.trim(),
    narrative: filled(w.narrative),
    materials: filled(w.materials),
    notes: w.notes
      .map((n) => ({ title: n.value.title.trim(), text: n.value.text.trim() }))
      .filter((n) => n.title || n.text),
    concept: w.concept,
    cover: w.cover ?? EMPTY_IMAGE,
    hero: w.hero ?? EMPTY_IMAGE,
    gallery: w.gallery.map((g) => g.value),
    published: w.published,
  };
  if (!w.concept) {
    if (w.location.trim()) project.location = w.location.trim();
    if (w.year.trim()) project.year = Number(w.year);
  }
  if (w.galleryNote.trim()) project.galleryNote = w.galleryNote.trim();
  if (w.pair.before && w.pair.after) {
    project.beforeAfter = { before: w.pair.before, after: w.pair.after, lead: w.pair.lead.trim() };
    if (w.pair.mode === 'toggle') project.beforeAfter.mode = 'toggle';
  }
  if (w.video) project.video = { file: w.video.file, poster: w.video.poster ?? EMPTY_IMAGE };
  if (w.seoTitle.trim() || w.seoDescription.trim()) {
    const description = w.seoDescription.trim();
    project.seo = {
      title: w.seoTitle.trim() || seoForProject(c, project).title,
      ...(description ? { description } : {}),
    };
  }
  return project;
};

export type FieldErrors = {
  title?: string;
  slug?: string;
  year?: string;
  pair?: string;
  video?: string;
  gallery: Record<string, string>;
};

/** Problems that stop a save. */
export const fieldErrors = (c: SiteContent, w: Working): FieldErrors => {
  const errors: FieldErrors = { gallery: {} };
  if (!w.title.trim()) errors.title = 'Başlık boş bırakılamaz.';
  errors.slug = slugError(c, w.slug, w.id);
  if (!w.concept && w.year.trim() && !/^\d{4}$/.test(w.year.trim())) errors.year = 'Yıl dört haneli bir sayı olmalı.';
  if ((w.pair.before === null) !== (w.pair.after === null))
    errors.pair = 'Önce ve sonra görselleri birlikte seçilmeli ya da ikisi de boş bırakılmalı.';
  if (w.video && !w.video.poster) errors.video = 'Video için bir kapak görseli seçin.';
  for (const g of w.gallery) {
    const m = c.media.find((x) => x.id === g.value.image.media);
    if (m && !fitsRatio(m, RATIOS[g.value.slot]))
      errors.gallery[g.key] = `Görsel ${RATIOS[g.value.slot].label} alanına uymuyor.`;
  }
  return errors;
};

export const hasErrors = (e: FieldErrors) =>
  Boolean(e.title || e.slug || e.year || e.pair || e.video || Object.keys(e.gallery).length);

const missingAlt = (c: SiteContent, ref: ImageRef): boolean => {
  const m = c.media.find((x) => x.id === ref.media);
  if (!m) return true;
  return !m.decorative && !(ref.alt ?? m.alt).trim();
};

/** What is still missing before the project can be published; empty means it can. */
export const publishGaps = (c: SiteContent, w: Working): string[] => {
  const gaps: string[] = [];
  if (!w.title.trim()) gaps.push('başlık');
  if (slugError(c, w.slug, w.id)) gaps.push('geçerli adres');
  if (!c.projectCategories.some((x) => x.id === w.categoryId)) gaps.push('kategori');
  if (!w.concept && (!w.location.trim() || !/^\d{4}$/.test(w.year.trim()))) gaps.push('konum ve yıl');
  if (!w.cover) gaps.push('kapak görseli');
  if (!w.hero) gaps.push('ana görsel');
  const refs: [string, ImageRef | null][] = [
    ['kapak', w.cover],
    ['ana görsel', w.hero],
    ...w.gallery.map((g, i): [string, ImageRef] => [`galeri ${i + 1}`, g.value.image]),
    ['önce', w.pair.before],
    ['sonra', w.pair.after],
    ['video kapağı', w.video?.poster ?? null],
  ];
  const noAlt = refs.filter(([, ref]) => ref && missingAlt(c, ref)).map(([label]) => label);
  if (noAlt.length) gaps.push(`alt metni (${noAlt.join(', ')})`);
  return gaps;
};

/** Id for a new project: the address, made unique when another project already uses it as an id. */
const newId = (c: SiteContent, slug: string): string => {
  const taken = new Set(c.projects.map((p) => p.id));
  let id = slug;
  for (let n = 2; taken.has(id); n++) id = `${slug}-${n}`;
  return id;
};

/** Writes the project into the content; a published project that changes address keeps its old address alive. */
export const applyProject = (c: SiteContent, w: Working, original: Project | null): SiteContent => {
  if (!original) {
    const project = toProject(w, newId(c, w.slug), c);
    return { ...c, projects: [...c.projects, project] };
  }
  const renamed = original.published && original.slug !== w.slug ? renameSlug(c, original.id, w.slug) : c;
  const project = toProject(w, original.id, renamed);
  return { ...renamed, projects: renamed.projects.map((p) => (p.id === original.id ? project : p)) };
};

/** Puts a reordered subset back into the full list, keeping the other projects where they were. */
export const mergeOrder = (all: Project[], subset: Project[]): Project[] => {
  const ids = new Set(subset.map((p) => p.id));
  const queue = [...subset];
  return all.map((p) => (ids.has(p.id) ? (queue.shift() as Project) : p));
};
