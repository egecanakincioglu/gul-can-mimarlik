import { beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { changedAreas } from './changes';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

const clone = () => structuredClone(seed);

describe('changedAreas', () => {
  it('is empty for identical content', () => {
    expect(changedAreas(clone(), seed)).toEqual([]);
  });

  it('names changed pages and settings', () => {
    const d = clone();
    d.home.hero.lead = 'Başka bir cümle';
    d.servicesPage = { ...d.servicesPage, lead: 'Yeni' };
    d.navigation = d.navigation.map((n, i) => (i === 0 ? { ...n, label: 'Değişti' } : n));
    d.site = { ...d.site, name: 'Yeni ad' };
    expect(changedAreas(d, seed)).toEqual(['Site ayarları', 'Gezinme', 'Ana sayfa', 'Hizmetler sayfası']);
  });

  it('names a changed project by its title and counts changed media', () => {
    const d = clone();
    d.projects[0] = { ...d.projects[0], summary: 'Yeni özet' };
    d.media = d.media.map((m, i) => (i === 0 ? { ...m, alt: 'Yeni açıklama' } : m));
    const areas = changedAreas(d, seed);
    expect(areas).toContain(`${seed.projects[0].title} projesi`);
    expect(areas).toContain('Medya: 1 görsel');
  });

  it('reports added and removed items', () => {
    const d = clone();
    d.media = d.media.slice(1);
    d.projects = [...d.projects, { ...d.projects[0], id: 'p-new', slug: 'yeni', title: 'Yeni Proje' }];
    const areas = changedAreas(d, seed);
    expect(areas).toContain('Yeni Proje projesi');
    expect(areas).toContain('Medya: 1 görsel');
  });

  it('notices a project reorder', () => {
    const d = clone();
    d.projects = [...d.projects].reverse();
    expect(changedAreas(d, seed)).toEqual(['Proje sırası']);
  });
});
