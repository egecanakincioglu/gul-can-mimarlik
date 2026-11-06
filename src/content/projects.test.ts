import { describe, expect, it } from 'vitest';
import { filters, getProject, matchesFilter, nextProject, projects } from './projects';
import { serviceCategories } from './site';

describe('project lookup', () => {
  it('has unique slugs', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it('finds a project by slug', () => {
    for (const p of projects) expect(getProject(p.slug)).toBe(p);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getProject('yok-boyle-bir-proje')).toBeUndefined();
  });

  it('returns the following project and wraps around at the end', () => {
    expect(nextProject(projects[0].slug)).toBe(projects[1]);
    expect(nextProject(projects[projects.length - 1].slug)).toBe(projects[0]);
  });
});

describe('category filters', () => {
  const [mimari, ic, gorsel] = ['Mimari', 'İç Mimarlık', 'Görselleştirme'].map((category) =>
    projects.find((p) => p.category === category)!,
  );

  it('"Tümü" keeps every project', () => {
    expect(projects.every((p) => matchesFilter(p, 'Tümü'))).toBe(true);
  });

  it('a category filter keeps only that category', () => {
    expect(matchesFilter(mimari, 'Mimari')).toBe(true);
    expect(matchesFilter(ic, 'Mimari')).toBe(false);
    expect(matchesFilter(gorsel, 'Görselleştirme')).toBe(true);
    expect(matchesFilter(mimari, 'İç Mimarlık')).toBe(false);
  });

  it('"Uygulama" keeps projects whose scope mentions it, whatever their category', () => {
    for (const p of projects) {
      expect(matchesFilter(p, 'Uygulama')).toBe(p.scope.some((s) => s.includes('Uygulama')));
    }
  });

  it('every filter matches at least one project', () => {
    for (const f of filters) expect(projects.some((p) => matchesFilter(p, f))).toBe(true);
  });
});

describe('before/after note', () => {
  it('calls the comparison illustrative', () => {
    const withComparison = projects.filter((p) => p.beforeAfter);
    expect(withComparison.length).toBeGreaterThan(0);
    for (const p of withComparison) {
      expect(p.narrative.join(' ').toLowerCase()).toContain('illüstratif');
    }
  });
});

describe('scope labels', () => {
  const categoriesFor = (scope: string) => serviceCategories.filter((c) => c.services.some((s) => s.name === scope));

  it('maps every scope label to exactly one services category anchor', () => {
    for (const p of projects) {
      for (const s of p.scope) {
        const matches = categoriesFor(s);
        expect(matches, `${p.slug}: "${s}"`).toHaveLength(1);
        expect(matches[0].slug).not.toBe('');
      }
    }
  });
});

describe('filter data', () => {
  it('uses a filter label as every project category', () => {
    for (const p of projects) expect(filters).toContain(p.category);
  });

  it('"Uygulama" selects at least one project', () => {
    expect(projects.some((p) => matchesFilter(p, 'Uygulama'))).toBe(true);
  });
});
