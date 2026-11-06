import { beforeEach, describe, expect, it } from 'vitest';
import { getContent } from './index';
import { filters, matchesFilter, projects as oldProjects } from './projects';
import {
  captionOf,
  conceptBadge,
  conceptLine,
  counts,
  demoText,
  emailHref,
  filterCount,
  filterProjects,
  getProjectById,
  getProjectBySlug,
  illustrativeLabel,
  mediaUsage,
  nextProject,
  phoneHref,
  projectFacts,
  publishedProjects,
  renameSlug,
  resolveImage,
  resolveRedirect,
  scopeLinks,
  seoForPage,
  seoForProject,
  text,
  tokens,
} from './select';
import type { Project, SiteContent } from './types';

let c: SiteContent;
beforeEach(async () => {
  c = structuredClone(await getContent());
});

const project = (id: string): Project => getProjectById(c, id)!;

describe('project lookup', () => {
  it('lists published projects only', () => {
    expect(publishedProjects(c)).toHaveLength(4);
    project('yamac-evi').published = false;
    expect(publishedProjects(c).map((p) => p.id)).not.toContain('yamac-evi');
  });

  it('finds by id and by slug', () => {
    expect(getProjectById(c, 'kose-kafe')?.title).toBe('Köşe Kafe');
    expect(getProjectById(c, 'yok')).toBeUndefined();
    expect(getProjectBySlug(c, 'kose-kafe')?.id).toBe('kose-kafe');
  });

  it('hides an unpublished project from slug lookup', () => {
    project('kose-kafe').published = false;
    expect(getProjectBySlug(c, 'kose-kafe')).toBeUndefined();
  });

  it('returns the next published project and wraps around', () => {
    expect(nextProject(c, 'avlulu-konut')?.id).toBe('daire-yenileme');
    expect(nextProject(c, 'kose-kafe')?.id).toBe('avlulu-konut');
  });

  it('skips unpublished projects and returns undefined for an unknown id', () => {
    project('daire-yenileme').published = false;
    expect(nextProject(c, 'avlulu-konut')?.id).toBe('yamac-evi');
    expect(nextProject(c, 'daire-yenileme')).toBeUndefined();
  });
});

describe('images', () => {
  it('resolves to the Img shape from the media defaults', () => {
    expect(resolveImage(c, { media: 'p1-cover' })).toEqual({
      src: '/images/p1-cover.png',
      alt: 'Avlulu konut konsepti: giriş açıklığı ve avludaki zeytin ağacı',
      focalX: 52,
      focalY: 55,
    });
  });

  it('lets a reference override alt and focal point', () => {
    expect(resolveImage(c, { media: 'p1-cover', alt: 'X', focal: { x: 1, y: 2 } })).toEqual({
      src: '/images/p1-cover.png',
      alt: 'X',
      focalX: 1,
      focalY: 2,
    });
  });

  it('throws for an unknown media id', () => {
    expect(() => resolveImage(c, { media: 'yok' })).toThrow('Unknown media');
  });

  it('labels illustrative kinds and returns null for a photograph', () => {
    expect(illustrativeLabel(c, { media: 'p1-cover' })).toBe('İllüstratif görsel');
    expect(illustrativeLabel(c, { media: 'p3-video-poster' })).toBe('İllüstratif 3D görselleştirme');
    c.media.find((m) => m.id === 'p1-cover')!.illustrative = null;
    expect(illustrativeLabel(c, { media: 'p1-cover' })).toBeNull();
  });

  it('builds captions from label and caption', () => {
    expect(captionOf(c, { image: { media: 'p1-cover' }, slot: 'landscape', caption: 'Giriş' })).toBe(
      'İllüstratif görsel · Giriş',
    );
    expect(captionOf(c, { image: { media: 'p3-video-poster' }, slot: 'wide' })).toBe('İllüstratif 3D görselleştirme');
    c.media.find((m) => m.id === 'p1-cover')!.illustrative = null;
    expect(captionOf(c, { image: { media: 'p1-cover' }, slot: 'wide', caption: 'Giriş' })).toBe('Giriş');
  });

  it('lists where a media item is used', () => {
    expect(mediaUsage(c, 'p2-before')).toEqual(['projects.daire-yenileme.beforeAfter.before']);
    expect(mediaUsage(c, 'p2-after')).toContain('serviceCategories.uygulama.image');
    expect(mediaUsage(c, 'p4-square')).toContain('home.materials.mese-celik');
    expect(mediaUsage(c, 'yok')).toEqual([]);
  });
});

describe('concept labels and facts', () => {
  it('shows concept texts only for concept projects', () => {
    const p = project('avlulu-konut');
    expect(conceptBadge(c, p)).toBe('Konsept Çalışma');
    expect(conceptLine(c, p)).toBe('Konsept çalışma; ölçü, yıl, konum ve müşteri bilgisi içermez.');
    p.concept = false;
    expect(conceptBadge(c, p)).toBeNull();
    expect(conceptLine(c, p)).toBeNull();
  });

  it('builds the facts of a concept project', () => {
    expect(projectFacts(c, project('avlulu-konut'))).toEqual([
      { id: 'kind', label: 'Tür', value: 'Konut · Mimari' },
      { id: 'status', label: 'Durum', value: 'Konsept / İllüstratif' },
      { id: 'location', label: 'Konum', value: 'Temsilî' },
    ]);
  });

  it('builds the facts of a real project', () => {
    const p = project('avlulu-konut');
    Object.assign(p, { concept: false, location: 'Bir yer', year: 2025 });
    expect(projectFacts(c, p).map((f) => [f.id, f.value])).toEqual([
      ['kind', 'Konut · Mimari'],
      ['location', 'Bir yer'],
      ['year', '2025'],
    ]);
    delete p.location;
    delete p.year;
    expect(projectFacts(c, p).map((f) => f.id)).toEqual(['kind']);
  });

  it('links scope entries to the services page anchors by service id', () => {
    expect(scopeLinks(c, project('daire-yenileme'))).toEqual([
      { id: 'ic-mimarlik-hizmetleri', name: 'İç Mimarlık Hizmetleri', href: '/hizmetler#ic-mimarlik' },
      { id: 'uygulama', name: 'Uygulama', href: '/hizmetler#uygulama' },
      { id: 'anahtar-teslim', name: 'Anahtar Teslim', href: '/hizmetler#uygulama' },
    ]);
    project('daire-yenileme').scope = ['yok'];
    expect(scopeLinks(c, project('daire-yenileme'))).toEqual([]);
  });
});

describe('counts and tokens', () => {
  it('counts categories, services and steps', () => {
    expect(counts(c)).toEqual({ categories: 4, services: 10, steps: 6 });
  });

  it('derives the token values', () => {
    const t = tokens(c, new Date('2026-05-01T00:00:00Z'));
    expect(t).toMatchObject({
      categories: 'dört',
      Categories: 'Dört',
      services: 'on',
      Services: 'On',
      steps: 'altı',
      Steps: 'Altı',
      founded: 'Aralık 2020',
      foundedIn: "Aralık 2020'de",
      year: '2026',
      name: 'Gül CAN Mimarlık',
    });
  });

  it('capitalises with Turkish casing', () => {
    c.processSteps = c.processSteps.slice(0, 2);
    expect(tokens(c, new Date()).Steps).toBe('İki');
  });

  it('fills a template and keeps an unknown token visible', () => {
    expect(text(c, '{Categories} kategori, {services} hizmet {x}')).toBe('Dört kategori, on hizmet {x}');
  });

  it('reproduces the current services and process sentences', () => {
    expect(text(c, c.servicesPage.lead)).toBe(
      'Dört kategori, on hizmet. Çizimden anahtar teslime her aşamayı birlikte ya da ayrı ayrı yürütüyoruz.',
    );
    expect(text(c, c.home.process.text)).toBe('Altı adım, tek ekip. Her adım bir öncekinin üzerine yükselir.');
  });
});

describe('demo texts', () => {
  it('returns the text in demo mode and null otherwise', () => {
    expect(demoText(c, 'footer')).toBe('Bu site bir tasarım demosudur. Portföy içerikleri illüstratiftir.');
    c.site.demoMode = false;
    expect(demoText(c, 'footer')).toBeNull();
  });
});

describe('contact links', () => {
  it('derives the phone and mail links', () => {
    expect(phoneHref(c)).toBe('tel:+905425933175');
    expect(emailHref(c)).toBe('mailto:gulcan.mimarlik@gmail.com');
  });
});

describe('filters', () => {
  it('matches the previous filter behaviour on every project', () => {
    expect(c.projectFilters.map((f) => f.label)).toEqual([...filters]);
    for (const [i, filter] of filters.entries()) {
      const expected = oldProjects.filter((p) => matchesFilter(p, filter)).map((p) => p.slug);
      const actual = filterProjects(c, c.projectFilters[i].id).map((p) => p.slug);
      expect(actual, filter).toEqual(expected);
    }
  });

  it('counts the projects of a filter', () => {
    expect(filterCount(c, 'tumu')).toBe(4);
    expect(filterCount(c, 'uygulama')).toBe(2);
    expect(filterCount(c, 'ic-mimarlik')).toBe(2);
  });

  it('keeps unpublished projects out and falls back to all for an unknown filter', () => {
    project('kose-kafe').published = false;
    expect(filterCount(c, 'uygulama')).toBe(1);
    expect(filterCount(c, 'yok')).toBe(3);
  });
});

describe('seo', () => {
  it('adds the demo suffix to the default description only in demo mode', () => {
    expect(seoForPage(c, 'services')).toEqual({
      title: 'Hizmetler',
      description:
        'Gül CAN Mimarlık: mimari proje, iç mimarlık, 3D görselleştirme ve uygulama. Çizimden anahtar teslime tek elden. (Tasarım demosu.)',
    });
    c.site.demoMode = false;
    expect(seoForPage(c, 'services').description).toBe(c.seo.description);
  });

  it('prefers a page description when one is set', () => {
    c.seo.pages.studio.description = 'Özel';
    expect(seoForPage(c, 'studio').description).toBe('Özel');
  });

  it('builds the project title and description', () => {
    expect(seoForProject(c, project('yamac-evi'))).toEqual({
      title: 'Yamaç Evi — Konsept Çalışma',
      description: project('yamac-evi').summary,
    });
    const p = project('yamac-evi');
    p.concept = false;
    expect(seoForProject(c, p).title).toBe('Yamaç Evi');
    p.seo = { title: 'Başlık', description: 'Açıklama' };
    expect(seoForProject(c, p)).toEqual({ title: 'Başlık', description: 'Açıklama' });
  });
});

describe('redirects and renameSlug', () => {
  it('resolves a redirect and returns null for others', () => {
    c.redirects = [{ id: 'r', from: '/projeler/eski', to: '/projeler/yamac-evi' }];
    expect(resolveRedirect(c, '/projeler/eski')).toBe('/projeler/yamac-evi');
    expect(resolveRedirect(c, '/projeler/yok')).toBeNull();
  });

  it('renames a slug and redirects the old address', () => {
    const next = renameSlug(c, 'yamac-evi', 'yamac-konutu');
    expect(getProjectBySlug(next, 'yamac-konutu')?.id).toBe('yamac-evi');
    expect(resolveRedirect(next, '/projeler/yamac-evi')).toBe('/projeler/yamac-konutu');
    expect(c.projects.find((p) => p.id === 'yamac-evi')?.slug).toBe('yamac-evi');
  });

  it('rewrites older redirects so there are no chains', () => {
    const a = renameSlug(c, 'yamac-evi', 'b');
    const b = renameSlug(a, 'yamac-evi', 'c');
    expect(b.redirects.map((r) => [r.from, r.to])).toEqual([
      ['/projeler/yamac-evi', '/projeler/c'],
      ['/projeler/b', '/projeler/c'],
    ]);
    expect(new Set(b.redirects.map((r) => r.from)).size).toBe(b.redirects.length);
    for (const r of b.redirects) expect(b.redirects.some((o) => o.from === r.to)).toBe(false);
  });

  it('drops the redirect when a project returns to an old slug', () => {
    const back = renameSlug(renameSlug(c, 'yamac-evi', 'b'), 'yamac-evi', 'yamac-evi');
    expect(back.projects.find((p) => p.id === 'yamac-evi')?.slug).toBe('yamac-evi');
    expect(back.redirects.map((r) => [r.from, r.to])).toEqual([['/projeler/b', '/projeler/yamac-evi']]);
  });

  it('does nothing when the slug is unchanged and rejects bad input', () => {
    expect(renameSlug(c, 'yamac-evi', 'yamac-evi')).toBe(c);
    expect(() => renameSlug(c, 'yok', 'x')).toThrow('Unknown project');
    expect(() => renameSlug(c, 'yamac-evi', 'kose-kafe')).toThrow('already in use');
  });
});
