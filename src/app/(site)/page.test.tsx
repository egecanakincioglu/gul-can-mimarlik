import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import Home from './page';

// Server components that read the content themselves cannot render in the client test renderer.
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/ServicesBands', () => ({ default: () => null }));
vi.mock('@/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/content')>();
  return { ...actual, getContent: vi.fn(actual.getContent) };
});

const withContent = async (edit: (c: SiteContent) => void) => {
  const base = await vi.mocked(getContent).getMockImplementation()!();
  const next = structuredClone(base);
  edit(next);
  vi.mocked(getContent).mockResolvedValueOnce(next);
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

describe('Home', () => {
  it('shows the concept badge but no Video badge on the Yamaç Evi bar while no project has a video', async () => {
    const { container } = render(await Home());
    const bar = container.querySelector<HTMLElement>('a[href="/projeler/yamac-evi"]')!;
    expect(within(bar).getByText('Konsept Çalışma')).toBeTruthy();
    expect(screen.queryByText('Video')).toBeNull();
  });

  it('shows the Video badge on a slot whose project has a video', async () => {
    await withContent((c) => {
      const p = c.projects.find((x) => x.id === 'yamac-evi')!;
      p.video = { file: '/videos/x.mp4', poster: p.cover };
    });
    const { container } = render(await Home());
    const bar = container.querySelector<HTMLElement>('a[href="/projeler/yamac-evi"]')!;
    expect(within(bar).getByText('Video')).toBeTruthy();
  });

  it('follows the project assigned to a slot', async () => {
    await withContent((c) => {
      c.home.featured.slots[0].projectId = 'kose-kafe';
    });
    const { container } = render(await Home());
    const card = container.querySelector<HTMLElement>('#secili-h')!.closest('section')!.querySelector('a.card')!;
    expect(card.getAttribute('href')).toBe('/projeler/kose-kafe');
    expect(within(card as HTMLElement).getByRole('heading', { name: 'Köşe Kafe' })).toBeTruthy();
  });

  it('removes the before/after section when no project is chosen', async () => {
    expect(render(await Home()).container.querySelector('#ba-h')).not.toBeNull();
    cleanup();
    await withContent((c) => {
      c.home.beforeAfter.projectId = null;
    });
    expect(render(await Home()).container.querySelector('#ba-h')).toBeNull();
  });

  it('hides the listing caption and the studio demo paragraph when demo mode is off', async () => {
    expect(render(await Home()).container.textContent).toContain('illüstratif görseller.');
    cleanup();
    await withContent((c) => {
      c.site.demoMode = false;
    });
    const out = render(await Home()).container.textContent;
    expect(out).not.toContain('Konsept çalışmalar — illüstratif');
    expect(out).not.toContain('gerçek ofisi değil');
  });

  it('drops the concept badge of a slot whose project is not a concept', async () => {
    await withContent((c) => {
      const p = c.projects.find((x) => x.id === 'daire-yenileme')!;
      p.concept = false;
      p.location = 'Test';
      p.year = 2024;
    });
    const { container } = render(await Home());
    const card = container.querySelector<HTMLElement>('a[href="/projeler/daire-yenileme"].card')!;
    expect(within(card).queryByText('Konsept Çalışma')).toBeNull();
  });
});
