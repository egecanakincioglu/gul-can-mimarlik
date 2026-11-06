import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  vi.unstubAllGlobals();
});

describe('Studio page', () => {
  it('keeps its markup', async () => {
    expect(await html(await StudyoPage())).toMatchSnapshot();
  });
});
