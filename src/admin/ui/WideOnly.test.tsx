import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import WideOnly from './WideOnly';

afterEach(cleanup);

describe('WideOnly', () => {
  it('renders the children and the narrow-screen notice with a link back', () => {
    render(
      <WideOnly backHref="/yonetim" backLabel="Genel bakış">
        <p>editor</p>
      </WideOnly>,
    );
    expect(screen.getByText('editor').parentElement?.className).toBe('adm-wide-only');
    expect(screen.getByText('Bu işlem için daha geniş ekran gerekir (768 px ve üzeri).')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Genel bakış' }).getAttribute('href')).toBe('/yonetim');
  });
});
