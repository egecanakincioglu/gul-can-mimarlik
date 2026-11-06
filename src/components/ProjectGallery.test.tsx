import { prerender } from 'react-dom/static';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectGallery from './ProjectGallery';
import { getContent } from '@/content';
import { captionOf, resolveImage } from '@/content/select';

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
    const c = await getContent();
    const photos = (i: number) =>
      c.projects[i].gallery.map((g) => ({ ...resolveImage(c, g.image), slot: g.slot, caption: captionOf(c, g) }));
    expect(await html(<ProjectGallery items={photos(0)} note="Not" texts={texts} />)).toMatchSnapshot();
    expect(await html(<ProjectGallery items={photos(1)} texts={texts} />)).toMatchSnapshot();
  });
});
