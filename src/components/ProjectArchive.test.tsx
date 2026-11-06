import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matchesFilter, projects } from '@/content/projects';
import ProjectArchive from './ProjectArchive';

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  window.history.replaceState(null, '', '/projeler');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const shown = () => screen.getAllByRole('article').map((a) => a.querySelector('h2')?.textContent);
const chip = (name: string) => screen.getByRole('button', { name });

describe('ProjectArchive', () => {
  it('lists every project first and counts them on the "Tümü" chip', () => {
    render(<ProjectArchive />);
    expect(shown()).toEqual(projects.map((p) => p.title));
    expect(chip(`Tümü (${projects.length})`).getAttribute('aria-pressed')).toBe('true');
  });

  it('filters by category, announces the count and writes the choice to the address', () => {
    render(<ProjectArchive />);
    fireEvent.click(chip('İç Mimarlık'));
    const expected = projects.filter((p) => matchesFilter(p, 'İç Mimarlık'));
    expect(shown()).toEqual(expected.map((p) => p.title));
    expect(screen.getByText(`${expected.length} proje gösteriliyor`)).toBeTruthy();
    expect(chip('İç Mimarlık').getAttribute('aria-pressed')).toBe('true');
    expect(window.location.search).toBe('?kategori=ic-mimarlik');
  });

  it('"Tümü" restores the full list and removes the query parameter', () => {
    render(<ProjectArchive />);
    fireEvent.click(chip('Mimari'));
    fireEvent.click(chip(`Tümü (${projects.length})`));
    expect(shown()).toHaveLength(projects.length);
    expect(window.location.search).toBe('');
  });

  it('applies the filter named in the address on load', async () => {
    window.history.replaceState(null, '', '/projeler?kategori=gorsellestirme');
    render(<ProjectArchive />);
    const expected = projects.filter((p) => matchesFilter(p, 'Görselleştirme'));
    expect(await screen.findByRole('button', { name: 'Görselleştirme' })).toBeTruthy();
    expect(chip('Görselleştirme').getAttribute('aria-pressed')).toBe('true');
    expect(shown()).toEqual(expected.map((p) => p.title));
  });

  it('ignores an unknown filter in the address', () => {
    window.history.replaceState(null, '', '/projeler?kategori=yok');
    render(<ProjectArchive />);
    expect(shown()).toHaveLength(projects.length);
  });
});
