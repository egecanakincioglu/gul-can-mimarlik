import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RichText from './RichText';
import { getContent } from '@/content';

describe('RichText', () => {
  it('renders the same DOM as the hard-coded "Önce / Sonra" heading', async () => {
    const c = await getContent();
    const fromContent = render(
      <h2>
        <RichText value={c.home.beforeAfter.heading} />
      </h2>,
    ).container.innerHTML;
    const hardCoded = render(
      <h2>
        Önce <span className="w3">/</span> <span className="w8">Sonra</span>
      </h2>,
    ).container.innerHTML;
    expect(fromContent).toBe(hardCoded);
  });

  it('renders unweighted segments as bare text and weighted ones as spans', () => {
    const { container } = render(
      <p>
        <RichText value={[{ text: 'a ' }, { text: 'b', weight: 800 }, { text: ' c', weight: 300 }]} />
      </p>,
    );
    expect(container.innerHTML).toBe('<p>a <span class="w8">b</span><span class="w3"> c</span></p>');
  });
});
