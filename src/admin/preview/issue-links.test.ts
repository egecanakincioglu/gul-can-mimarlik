import { beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { issueLink } from './issue-links';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

const EXPECTED: Record<string, string> = {
  site: '/yonetim/site-ayarlari',
  contact: '/yonetim/iletisim-bilgileri',
  navigation: '/yonetim/gezinme',
  seo: '/yonetim/seo',
  ui: '/yonetim/metinler',
  labels: '/yonetim/metinler',
  demo: '/yonetim/metinler',
  footer: '/yonetim/alt-bilgi',
  home: '/yonetim/ana-sayfa',
  serviceCategories: '/yonetim/hizmetler',
  processSteps: '/yonetim/surec-adimlari',
  servicesPage: '/yonetim/hizmetler',
  studioPage: '/yonetim/studyo',
  contactPage: '/yonetim/iletisim-sayfasi',
  projectsPage: '/yonetim/projeler-sayfasi',
  projectPage: '/yonetim/metinler',
  projectCategories: '/yonetim/kategoriler',
  projectFilters: '/yonetim/kategoriler',
  projects: '/yonetim/projeler',
  media: '/yonetim/medya',
  redirects: '/yonetim/yonlendirmeler',
};

describe('issueLink', () => {
  it('maps every top-level content key to its screen', () => {
    const keys = Object.keys(seed).filter((k) => k !== 'version');
    expect(Object.keys(EXPECTED).sort()).toEqual([...keys].sort());
    for (const key of keys) {
      const path = key === 'projects' ? 'projects' : `${key}.field`;
      expect(issueLink(seed, { path, code: 'x' }).href, key).toBe(EXPECTED[key]);
    }
  });

  it('links a project issue to the project screen by slug', () => {
    const slug = seed.projects[2].slug;
    expect(issueLink(seed, { path: 'projects[2].cover', code: 'missing-media' }).href).toBe(
      `/yonetim/projeler/${slug}`,
    );
    expect(issueLink(seed, { path: 'projects[2]', code: 'x' }).href).toBe(`/yonetim/projeler/${slug}`);
  });

  it('falls back to the project list for an index with no project', () => {
    expect(issueLink(seed, { path: 'projects[999].cover', code: 'x' }).href).toBe('/yonetim/projeler');
  });

  it('links media and home issues and gives a Turkish message', () => {
    expect(issueLink(seed, { path: 'media[1].alt', code: 'empty-alt' })).toEqual({
      text: 'Görsel açıklaması boş',
      href: '/yonetim/medya',
    });
    expect(issueLink(seed, { path: 'home.featured[0]', code: 'featured-unpublished' }).href).toBe('/yonetim/ana-sayfa');
  });
});
