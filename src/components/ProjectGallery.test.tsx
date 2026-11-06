import { prerender } from 'react-dom/static';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectGallery from './ProjectGallery';
import { projects } from '@/content/projects';

const html = async (node: React.ReactNode) => {
  const { prelude } = await prerender(node);
  return (await new Response(prelude).text()).replaceAll('<!-- -->', '');
};

const texts = {
  enlarge: 'Görseli büyüt',
  prev: 'Önceki görsel',
  next: 'Sonraki görsel',
  close: 'Kapat',
  dialogAria: 'Görsel galerisi',
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
  vi.unstubAllGlobals();
});

describe('ProjectGallery', () => {
  it('keeps its markup', async () => {
    const p = projects[0];
    expect(await html(<ProjectGallery items={p.gallery} note="Not" texts={texts} />)).toMatchSnapshot();
    expect(await html(<ProjectGallery items={projects[1].gallery} texts={texts} />)).toMatchSnapshot();
  });
});
