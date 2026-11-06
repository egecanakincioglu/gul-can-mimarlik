import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import ProjectPage from './page';

const nav = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
  permanentRedirect: vi.fn((to: string) => {
    throw new Error(`redirect:${to}`);
  }),
}));
vi.mock('next/navigation', () => nav);

const state = vi.hoisted(() => ({ content: null as unknown }));
vi.mock('@/content', async (orig) => {
  const mod = await orig<typeof import('@/content')>();
  return { ...mod, getContent: async () => state.content ?? (await mod.getContent()) };
});
vi.mock('@/components/Footer', () => ({ default: () => <footer data-stub />, FooterView: () => <footer data-stub /> }));

const html = async (node: ReactNode) => {
  const { prelude } = await prerender(node);
  return (await new Response(prelude).text()).replaceAll('<!-- -->', '');
};
const render = async (slug: string) => html(await ProjectPage({ params: Promise.resolve({ slug }) }));

let base: SiteContent;
beforeEach(async () => {
  state.content = null;
  base = structuredClone(await getContent());
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Project detail page content', () => {
  it('shows location and year, and no concept badge, for a real project', async () => {
    const p = base.projects.find((x) => x.slug === 'avlulu-konut')!;
    p.concept = false;
    p.location = 'Örnek Mahalle';
    p.year = 2031;
    state.content = base;
    const out = await render('avlulu-konut');
    expect(out).toContain('Örnek Mahalle');
    expect(out).toContain('2031');
    expect(out).not.toContain(base.labels.concept);
    expect(out).not.toContain(base.labels.statusConcept);
    expect(out).toContain('Tasarım');
  });

  it('keeps scope links working when a service is renamed', async () => {
    const cat = base.serviceCategories.find((c) => c.services.some((s) => s.id === 'mimari-proje'))!;
    cat.services.find((s) => s.id === 'mimari-proje')!.name = 'Yeni Ad';
    state.content = base;
    const out = await render('avlulu-konut');
    expect(out).toContain(`href="/hizmetler#${cat.slug}"`);
    expect(out).toContain('Yeni Ad');
  });

  it('redirects an old slug to the new path', async () => {
    base.redirects = [{ id: 'r1', from: '/projeler/eski-ad', to: '/projeler/avlulu-konut' }];
    state.content = base;
    await expect(render('eski-ad')).rejects.toThrow('redirect:/projeler/avlulu-konut');
    expect(nav.permanentRedirect).toHaveBeenCalledWith('/projeler/avlulu-konut');
    expect(nav.notFound).not.toHaveBeenCalled();
  });

  it('answers not found for an unpublished project', async () => {
    base.projects.find((x) => x.slug === 'kose-kafe')!.published = false;
    state.content = base;
    await expect(render('kose-kafe')).rejects.toThrow('not-found');
    expect(nav.notFound).toHaveBeenCalled();
    expect(nav.permanentRedirect).not.toHaveBeenCalled();
  });
});
