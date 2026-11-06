import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

// Server components that read the content themselves cannot render in the client test renderer.
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/ServicesBands', () => ({ default: () => null }));

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
});
