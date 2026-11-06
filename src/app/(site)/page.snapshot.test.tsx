import { prerender } from 'react-dom/static';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

// Footer and the service bands are async server components, so the page is prerendered instead of mounted.
const html = async () => {
  const { prelude } = await prerender(await Home());
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

describe('home page markup', () => {
  it('keeps the rendered markup', async () => {
    expect(await html()).toMatchSnapshot();
  });
});
