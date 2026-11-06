import { beforeEach, describe, expect, it } from 'vitest';
import { getContent } from './index';
import { validate } from './validate';
import type { SiteContent } from './types';

let c: SiteContent;
beforeEach(async () => {
  c = structuredClone(await getContent());
});

const codes = () => validate(c).map((i) => i.code);

describe('validate', () => {
  it('finds no issue in the seed', () => {
    expect(validate(c)).toEqual([]);
  });

  it('reports duplicate ids and slugs', () => {
    c.projects[1].id = c.projects[0].id;
    c.projects[1].slug = c.projects[0].slug;
    c.media[1].id = c.media[0].id;
    expect(codes()).toEqual(expect.arrayContaining(['duplicate-id', 'duplicate-slug']));
    expect(validate(c).filter((i) => i.path.startsWith('media'))).toHaveLength(1);
  });

  it('reports a duplicate service id across categories', () => {
    c.serviceCategories[1].services[0].id = c.serviceCategories[0].services[0].id;
    expect(validate(c)).toContainEqual({ path: 'serviceCategories.services[3].id', code: 'duplicate-id' });
  });

  it('reports a missing media reference', () => {
    c.projects[0].cover = { media: 'yok' };
    expect(validate(c)).toContainEqual({ path: 'projects.avlulu-konut.cover', code: 'missing-media' });
  });

  it('reports empty alt text on media and on references', () => {
    c.media[0].alt = ' ';
    c.projects[0].cover = { media: 'p1-cover', alt: '' };
    const found = validate(c).filter((i) => i.code === 'empty-alt');
    expect(found.map((i) => i.path)).toEqual(['media[0].alt', 'projects.avlulu-konut.cover.alt']);
  });

  it('reports a missing category and a missing service', () => {
    c.projects[0].categoryId = 'yok';
    c.projects[0].scope = ['yok'];
    expect(codes()).toEqual(expect.arrayContaining(['missing-category', 'missing-service']));
  });

  it('reports a dangling service category project', () => {
    c.serviceCategories[0].projectId = 'yok';
    expect(validate(c)).toContainEqual({ path: 'serviceCategories[0].projectId', code: 'missing-project' });
    c.serviceCategories[0].projectId = null;
    expect(validate(c)).toEqual([]);
  });

  it('reports filters that point nowhere', () => {
    c.projectFilters[1].rule = { kind: 'category', categoryId: 'yok' };
    c.projectFilters[4].rule = { kind: 'service', serviceId: 'yok' };
    expect(validate(c).map((i) => i.code)).toEqual(['missing-category', 'missing-service']);
  });

  it('requires exactly four featured slots', () => {
    c.home.featured.slots = c.home.featured.slots.slice(0, 3) as unknown as typeof c.home.featured.slots;
    expect(codes()).toContain('featured-count');
  });

  it('reports a featured slot with a missing or unpublished project', () => {
    c.home.featured.slots[0].projectId = 'yok';
    c.projects.find((p) => p.id === 'daire-yenileme')!.published = false;
    expect(codes()).toEqual(expect.arrayContaining(['missing-project', 'featured-unpublished']));
  });

  it('reports a materials item with a missing project', () => {
    c.home.materials.items[0].projectId = 'yok';
    expect(codes()).toContain('missing-project');
  });

  it('reports a before/after section without a pair', () => {
    delete c.projects.find((p) => p.id === 'daire-yenileme')!.beforeAfter;
    expect(codes()).toContain('before-after-missing');
    c.home.beforeAfter.projectId = 'yok';
    expect(codes()).toContain('missing-project');
    c.home.beforeAfter.projectId = null;
    expect(validate(c)).toEqual([]);
  });

  it('requires location and year on a real project', () => {
    c.projects[0].concept = false;
    expect(codes()).toContain('real-project-needs-location-year');
    c.projects[0].location = 'Bir yer';
    expect(codes()).toContain('real-project-needs-location-year');
    c.projects[0].year = 2025;
    expect(validate(c)).toEqual([]);
  });

  it('forbids location and year on a concept project', () => {
    c.projects[0].location = 'Bir yer';
    expect(codes()).toContain('concept-has-location-year');
    delete c.projects[0].location;
    c.projects[0].year = 2025;
    expect(codes()).toContain('concept-has-location-year');
  });

  it('reports a gallery image that does not fit its slot', () => {
    c.projects[0].gallery[0].slot = 'portrait';
    expect(validate(c)).toContainEqual({ path: 'projects[0].gallery[0]', code: 'aspect-mismatch' });
  });

  describe('decorative media', () => {
    it('accepts a decorative item with empty alt and an empty reference alt', () => {
      c.media[0].decorative = true;
      c.media[0].alt = '';
      c.projects[0].cover = { media: c.media[0].id, alt: '' };
      expect(codes()).not.toContain('empty-alt');
      expect(codes()).not.toContain('decorative-with-alt');
    });

    it('reports a decorative item that has alt text', () => {
      c.media[0].decorative = true;
      expect(validate(c)).toContainEqual({ path: 'media[0].alt', code: 'decorative-with-alt' });
    });

    it('reports a non-decorative item with empty alt', () => {
      c.media[0].alt = '';
      expect(validate(c)).toContainEqual({ path: 'media[0].alt', code: 'empty-alt' });
    });
  });

  describe('redirects', () => {
    const live = '/projeler/yamac-evi';

    it('accepts a redirect to a live project', () => {
      c.redirects = [{ id: 'r', from: '/projeler/eski', to: live }];
      expect(validate(c)).toEqual([]);
    });

    it('accepts a redirect to a static public path', () => {
      c.redirects = [{ id: 'r', from: '/eski', to: '/hizmetler' }];
      expect(validate(c)).toEqual([]);
    });

    it('reports a redirect to an unknown path', () => {
      c.redirects = [{ id: 'r', from: '/eski', to: '/yok' }];
      expect(validate(c)).toContainEqual({ path: 'redirects[0].to', code: 'redirect-dangling' });
    });

    it('reports a redirect from a static public page', () => {
      c.redirects = [{ id: 'r', from: '/hizmetler', to: '/studyo' }];
      expect(validate(c)).toContainEqual({ path: 'redirects[0].from', code: 'redirect-shadows-page' });
    });

    it('reports a duplicate from', () => {
      c.redirects = [
        { id: 'a', from: '/projeler/eski', to: live },
        { id: 'b', from: '/projeler/eski', to: live },
      ];
      expect(codes()).toContain('redirect-duplicate-from');
    });

    it('reports a self redirect, a shadowed live project and a dangling target', () => {
      c.redirects = [
        { id: 'a', from: live, to: live },
        { id: 'b', from: '/projeler/eski', to: '/projeler/yok' },
      ];
      expect(codes()).toEqual(
        expect.arrayContaining(['redirect-self', 'redirect-shadows-project', 'redirect-dangling']),
      );
    });

    it('reports a chain', () => {
      c.redirects = [
        { id: 'a', from: '/projeler/a', to: '/projeler/b' },
        { id: 'b', from: '/projeler/b', to: live },
      ];
      expect(validate(c)).toContainEqual({ path: 'redirects[0].to', code: 'redirect-chain' });
    });
  });

  it('requires a %s placeholder in the title template', () => {
    c.seo.titleTemplate = 'Gül CAN Mimarlık';
    expect(codes()).toContain('title-template-missing-placeholder');
  });

  it('reports unknown tokens anywhere in the content', () => {
    c.home.hero.lead = 'Merhaba {nope}';
    c.studioPage.heading = [{ text: 'A {bilinmeyen}' }];
    const found = validate(c).filter((i) => i.code === 'unknown-token');
    expect(found.map((i) => i.path)).toEqual(['home.hero.lead', 'studioPage.heading[0].text']);
  });

  it('accepts the known and per-call tokens', () => {
    c.home.hero.lead = '{Categories} {n} {foundedIn} {year}';
    expect(validate(c)).toEqual([]);
  });

  it('reports an empty rich text segment', () => {
    c.home.hero.lines[0] = [{ text: '' }];
    expect(validate(c)).toContainEqual({ path: 'home.hero.lines[0][0]', code: 'rich-empty-segment' });
  });

  it('does not mistake a project note for a rich segment', () => {
    c.projects[0].notes[0].text = '';
    expect(codes()).not.toContain('rich-empty-segment');
  });
});
