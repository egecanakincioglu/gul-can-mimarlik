import { prerender } from 'react-dom/static';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import IletisimPage from './page';

// The footer is an async component, which the sync renderer rejects; text-split comments are dropped to match the earlier output.
const html = async (node: React.ReactNode) => {
  const { prelude } = await prerender(node);
  return (await new Response(prelude).text()).replaceAll('<!-- -->', '');
};

// The footer prints the current year; freeze it so the snapshot stays valid in later years.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T12:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('Contact page', () => {
  it('keeps its markup', async () => {
    expect(await html(await IletisimPage())).toMatchSnapshot();
  });
});
