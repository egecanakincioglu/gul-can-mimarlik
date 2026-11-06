import { describe, expect, it } from 'vitest';
import nextConfig, { adminRewrites } from '../next.config.ts';

describe('next config', () => {
  it('marks the admin area noindex', async () => {
    const rules = await nextConfig.headers!();
    const rule = rules.find((r) => r.source === '/yonetim/:path*');
    expect(rule?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
  });

  it('hides the admin area behind a non-existent path when disabled', () => {
    const rewrites = adminRewrites(false);
    expect(rewrites.map((r) => r.source)).toEqual(['/yonetim', '/yonetim/:path*']);
    expect(rewrites.every((r) => r.destination === '/yonetim-kapali')).toBe(true);
  });

  it('adds no rewrites when enabled', () => {
    expect(adminRewrites(true)).toEqual([]);
  });
});
