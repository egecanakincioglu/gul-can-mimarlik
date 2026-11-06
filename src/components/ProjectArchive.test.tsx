import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { matchesFilter, projects } from '@/content/projects';
import ProjectArchive from './ProjectArchive';
import { archiveProps } from './archive-props';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

const archive = (c: SiteContent = seed) => <ProjectArchive {...archiveProps(c)} />;

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
    render(archive());
    expect(shown()).toEqual(projects.map((p) => p.title));
    expect(chip(`Tümü (${projects.length})`).getAttribute('aria-pressed')).toBe('true');
  });

  it('filters by category, announces the count and writes the choice to the address', () => {
    render(archive());
    fireEvent.click(chip('İç Mimarlık'));
    const expected = projects.filter((p) => matchesFilter(p, 'İç Mimarlık'));
    expect(shown()).toEqual(expected.map((p) => p.title));
    expect(screen.getByText(`${expected.length} proje gösteriliyor`)).toBeTruthy();
    expect(chip('İç Mimarlık').getAttribute('aria-pressed')).toBe('true');
    expect(window.location.search).toBe('?kategori=ic-mimarlik');
  });

  it('"Tümü" restores the full list and removes the query parameter', () => {
    render(archive());
    fireEvent.click(chip('Mimari'));
    fireEvent.click(chip(`Tümü (${projects.length})`));
    expect(shown()).toHaveLength(projects.length);
    expect(window.location.search).toBe('');
  });

  it('applies the filter named in the address on load', async () => {
    window.history.replaceState(null, '', '/projeler?kategori=gorsellestirme');
    render(archive());
    const expected = projects.filter((p) => matchesFilter(p, 'Görselleştirme'));
    expect(await screen.findByRole('button', { name: 'Görselleştirme' })).toBeTruthy();
    expect(chip('Görselleştirme').getAttribute('aria-pressed')).toBe('true');
    expect(shown()).toEqual(expected.map((p) => p.title));
  });

  it('ignores an unknown filter in the address', () => {
    window.history.replaceState(null, '', '/projeler?kategori=yok');
    render(archive());
    expect(shown()).toHaveLength(projects.length);
  });
});

describe('ProjectArchive markup', () => {
  it('matches the recorded markup', () => {
    expect(renderToStaticMarkup(archive())).toMatchSnapshot();
  });
});

describe('ProjectArchive from content', () => {
  const withProjects = (edit: (c: SiteContent) => SiteContent) => edit(structuredClone(seed));

  it('hides an unpublished project and leaves it out of the counts', () => {
    const c = withProjects((x) => {
      x.projects[0].published = false;
      return x;
    });
    render(archive(c));
    expect(shown()).not.toContain(seed.projects[0].title);
    expect(shown()).toHaveLength(seed.projects.length - 1);
    expect(chip(`Tümü (${seed.projects.length - 1})`)).toBeTruthy();
  });

  it('orders the chips like the filter array', () => {
    const c = withProjects((x) => {
      x.projectFilters = [x.projectFilters[0], ...x.projectFilters.slice(1).reverse()];
      return x;
    });
    render(archive(c));
    const labels = screen.getAllByRole('button').map((b) => b.textContent);
    expect(labels).toEqual(
      c.projectFilters.map((f) => (f.rule.kind === 'all' ? `${f.label} (${seed.projects.length})` : f.label)),
    );
  });

  it('shows no concept badge on a card whose project is not a concept', () => {
    const c = withProjects((x) => {
      x.projects[0].concept = false;
      x.projects[0].location = 'Test';
      x.projects[0].year = 2020;
      return x;
    });
    render(archive(c));
    const cards = screen.getAllByRole('article');
    expect(cards[0].querySelector('.badge')).toBeNull();
    expect(cards[1].querySelector('.badge')).not.toBeNull();
  });
});
