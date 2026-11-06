import { prerender } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import IletisimPage from './page';

// The footer is an async component, which the sync renderer rejects; text-split comments are dropped to match the earlier output.
const html = async (node: React.ReactNode) => {
  const { prelude } = await prerender(node);
  return (await new Response(prelude).text()).replaceAll('<!-- -->', '');
};

describe('Contact page', () => {
  it('keeps its markup', async () => {
    expect(await html(await IletisimPage())).toMatchSnapshot();
  });
});
