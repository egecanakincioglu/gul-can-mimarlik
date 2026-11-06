import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SiteContent } from '@/content/types';

const state = vi.hoisted(() => ({ override: null as SiteContent | null }));

vi.mock('@/content', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/content')>();
  return { ...original, getContent: async () => state.override ?? original.getContent() };
});

import { getContent } from '@/content';
import StudyoPage from './page';

// The footer may be an async component, which the sync renderer rejects; text-split comments are dropped to match its output.
const html = async (node: ReactNode) => {
  const { prelude } = await prerender(node);
  return (await new Response(prelude).text()).replaceAll('<!-- -->', '');
};

beforeEach(() => {
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
  state.override = null;
  vi.unstubAllGlobals();
});

describe('Studio page content', () => {
  it('lists the service categories of the content', async () => {
    const base = await getContent();
    const [first, second] = base.serviceCategories;
    state.override = {
      ...base,
      serviceCategories: [{ ...second, name: 'Yeni Kategori', services: [{ id: 'x', name: 'Yeni Hizmet', desc: '' }] }],
    };
    const markup = await html(await StudyoPage());
    expect(markup).toContain('Yeni Kategori');
    expect(markup).toContain('Yeni Hizmet');
    expect(markup).toContain(`href="/hizmetler#${second.slug}"`);
    expect(markup).not.toContain(first.name);
  });
});
