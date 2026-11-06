import { describe, expect, it } from 'vitest';
import { RATIOS, fileName, fitsRatio, unfitReason } from './ratios.ts';
import { describeUsage } from './usage.ts';
import { getContent } from '@/content';

describe('ratio fit', () => {
  it('accepts an image close to the slot ratio', () => {
    expect(fitsRatio({ width: 1500, height: 1000 }, RATIOS.landscape)).toBe(true);
    expect(fitsRatio({ width: 2100, height: 900 }, RATIOS.wide)).toBe(true);
    expect(fitsRatio({ width: 1600, height: 1200 }, RATIOS.compare)).toBe(true);
    expect(unfitReason({ width: 1500, height: 1000 }, RATIOS.landscape)).toBeNull();
  });

  it('rejects an image far from the slot ratio and says why', () => {
    expect(fitsRatio({ width: 1500, height: 1000 }, RATIOS.wide)).toBe(false);
    expect(fitsRatio({ width: 900, height: 1600 }, RATIOS.video)).toBe(false);
    expect(unfitReason({ width: 1500, height: 1000 }, RATIOS.wide)).toContain('21:9');
  });

  it('takes the name from the last path segment', () => {
    expect(fileName('/images/p1-cover.png')).toBe('p1-cover.png');
  });
});

describe('usage descriptions', () => {
  it('links usage paths to panel screens', async () => {
    const c = await getContent();
    const p = c.projects[0]!;
    expect(describeUsage(c, 'home.hero.posterDesktop').href).toBe('/yonetim/ana-sayfa');
    expect(describeUsage(c, 'studioPage.image').href).toBe('/yonetim/studyo');
    expect(describeUsage(c, 'seo.ogImage').href).toBe('/yonetim/site-ayarlari');
    expect(describeUsage(c, `serviceCategories.${c.serviceCategories[0]!.id}.image`).href).toBe('/yonetim/hizmetler');
    expect(describeUsage(c, `projects.${p.id}.cover`).href).toBe(`/yonetim/projeler/${p.slug}`);
    expect(describeUsage(c, 'something.else').href).toBe('/yonetim');
  });
});
