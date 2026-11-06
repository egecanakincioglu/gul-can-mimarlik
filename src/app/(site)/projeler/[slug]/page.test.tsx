import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectPage from './page';

// The footer is an async component, which the sync renderer rejects; text-split comments are dropped to match its output.
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
  vi.unstubAllGlobals();
});

// The footer prints the current year; freeze it so the snapshot stays valid in later years.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('Project detail page', () => {
  it.each(['avlulu-konut', 'daire-yenileme', 'yamac-evi', 'kose-kafe'])('keeps the markup of %s', async (slug) => {
    expect(await html(await ProjectPage({ params: Promise.resolve({ slug }) }))).toMatchSnapshot();
  });
});
