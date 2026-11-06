import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EkranPage from './page.tsx';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));

afterEach(cleanup);

const run = (ekran: string[]) => EkranPage({ params: Promise.resolve({ ekran }) });

describe('admin catch-all screen', () => {
  it('shows the sidebar label and the notice for a known path', async () => {
    render(await run(['hizmetler']));
    expect(screen.getByRole('heading', { level: 1, name: 'Hizmetler' })).toBeTruthy();
    expect(screen.getByText('Bu ekran yapım aşamasında.')).toBeTruthy();
    const back = screen.getByRole('link', { name: 'Genel bakış' });
    expect(back.getAttribute('href')).toBe('/yonetim');
    expect(back.classList.contains('tlink')).toBe(true);
  });

  it('calls notFound for an unknown path', async () => {
    await expect(run(['yok'])).rejects.toThrow('NOT_FOUND');
  });
});
