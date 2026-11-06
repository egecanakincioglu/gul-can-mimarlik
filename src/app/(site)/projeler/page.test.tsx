import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import ProjelerPage, { generateMetadata } from './page';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Footer has its own markup test; a stub keeps this snapshot about the page.
vi.mock('@/components/Footer', () => ({ default: () => <footer data-stub />, FooterView: () => <footer data-stub /> }));

describe('Projeler page', () => {
  it('renders the same markup as before the content model', async () => {
    expect(renderToStaticMarkup(await ProjelerPage())).toMatchSnapshot();
  });

  it('takes its metadata from the content', async () => {
    const c = await getContent();
    expect(await generateMetadata()).toEqual(
      expect.objectContaining({ title: c.seo.pages.projects.title, description: expect.any(String) }),
    );
  });
});
