import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import Page from './page';

vi.mock('@/components/Footer', () => ({ default: () => null, FooterView: () => null }));
vi.mock('@/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/content')>();
  return { ...actual, getContent: vi.fn(actual.getContent) };
});

const withContent = async (edit: (c: SiteContent) => SiteContent) => {
  const base = await vi.mocked(getContent).getMockImplementation()!();
  vi.mocked(getContent).mockResolvedValueOnce(edit(structuredClone(base)));
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
  cleanup();
  vi.unstubAllGlobals();
});

describe('services page', () => {
  it('keeps the rendered markup', async () => {
    const { container } = render(await Page());
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('derives the counts in the lead text from the content', async () => {
    expect(render(await Page()).container.textContent).toContain('Dört kategori, on hizmet.');
    cleanup();
    await withContent((c) => {
      c.serviceCategories[0].services.push({ id: 'extra', name: 'Extra', desc: 'x' });
      return c;
    });
    expect(render(await Page()).container.textContent).toContain('Dört kategori, on bir hizmet.');
  });

  it('drops the demo sentence from the footnote when demo mode is off', async () => {
    expect(render(await Page()).container.textContent).toContain('Bu sayfa bir tasarım demosudur.');
    cleanup();
    await withContent((c) => {
      c.site.demoMode = false;
      return c;
    });
    const out = render(await Page()).container.textContent;
    expect(out).toContain('birlikte netleştirilir.');
    expect(out).not.toContain('tasarım demosudur');
  });
});
