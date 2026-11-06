import { beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { emptyWorking, fromProject, mergeOrder, publishGaps, toProject } from './model';
import { slugError, slugify } from './slug';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

describe('slugify', () => {
  it('transliterates Turkish letters to ASCII kebab-case', () => {
    expect(slugify('Çamlık Köşkü')).toBe('camlik-kosku');
    expect(slugify('Yığın İşlemi Ğ Ü Ö')).toBe('yigin-islemi-g-u-o');
    expect(slugify('  Işık --  Evi!  ')).toBe('isik-evi');
  });

  it('caps the length without leaving a trailing dash', () => {
    const out = slugify(`${'a'.repeat(59)} bbb`);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith('-')).toBe(false);
  });
});

describe('slugError', () => {
  it('accepts a well-formed unused address', () => {
    expect(slugError(seed, 'sahil-evi', '')).toBeUndefined();
  });

  it.each([
    ['', 'boş'],
    ['ab', '3-60'],
    ['a'.repeat(61), '3-60'],
    ['Büyük-Harf', 'küçük harf'],
    ['-basta', 'küçük harf'],
    ['iki--tire', 'küçük harf'],
    ['yeni', 'ayrılmış'],
    ['yonetim', 'ayrılmış'],
  ])('rejects %j', (slug, part) => {
    expect(slugError(seed, slug, '')).toContain(part);
  });

  it('rejects an address another project uses but allows keeping its own', () => {
    expect(slugError(seed, 'avlulu-konut', '')).toContain('başka bir projede');
    expect(slugError(seed, 'avlulu-konut', 'avlulu-konut')).toBeUndefined();
  });
});

describe('publishGaps', () => {
  it('lists everything missing from an empty project', () => {
    const gaps = publishGaps(seed, emptyWorking());
    expect(gaps).toEqual(
      expect.arrayContaining(['başlık', 'geçerli adres', 'kategori', 'konum ve yıl', 'kapak görseli', 'ana görsel']),
    );
  });

  it('is empty for a complete seed project', () => {
    expect(publishGaps(seed, fromProject(seed.projects[0]))).toEqual([]);
  });

  it('reports a missing title, a real project without location and a picture without alt text', () => {
    const base = fromProject(seed.projects[0]);
    expect(publishGaps(seed, { ...base, title: ' ' })).toContain('başlık');
    expect(publishGaps(seed, { ...base, concept: false })).toContain('konum ve yıl');
    const media = seed.media.map((m) => (m.id === base.cover?.media ? { ...m, alt: '' } : m));
    expect(publishGaps({ ...seed, media }, base).join()).toContain('görsel açıklaması (kapak');
  });
});

describe('model round trip', () => {
  it('keeps a seed project unchanged', () => {
    const p = seed.projects[1];
    expect(toProject(fromProject(p), p.id, seed)).toEqual(p);
  });

  it('drops a half-filled pair instead of storing it', () => {
    const w = fromProject(seed.projects[1]);
    const out = toProject({ ...w, pair: { ...w.pair, after: null } }, w.id, seed);
    expect(out.beforeAfter).toBeUndefined();
  });
});

describe('mergeOrder', () => {
  it('reorders a subset in place and leaves the others where they were', () => {
    const [a, b, c, d] = seed.projects;
    expect(mergeOrder([a, b, c, d], [d, b]).map((p) => p.id)).toEqual([a.id, d.id, c.id, b.id]);
  });
});
