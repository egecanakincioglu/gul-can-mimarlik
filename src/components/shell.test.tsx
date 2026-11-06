import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import Footer from './Footer';
import Header from './Header';
import { headerTexts } from './shell-texts';
import * as content from '@/content';
import type { SiteContent } from '@/content/types';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const base = await content.getContent();
const withContent = (next: SiteContent) => vi.spyOn(content, 'getContent').mockResolvedValue(next);

describe('Footer', () => {
  it('shows the demo note while demo mode is on', async () => {
    expect(renderToStaticMarkup(await Footer({}))).toContain(base.demo.footer);
  });

  it('hides the demo note when demo mode is off', async () => {
    withContent({ ...base, site: { ...base.site, demoMode: false } });
    const html = renderToStaticMarkup(await Footer({}));
    expect(html).not.toContain(base.demo.footer);
    expect(html).toContain('© ' + new Date().getFullYear());
    vi.restoreAllMocks();
  });

  it('leaves out a navigation item that is not visible', async () => {
    withContent({
      ...base,
      navigation: base.navigation.map((n) => (n.id === 'studio' ? { ...n, visible: false } : n)),
    });
    const html = renderToStaticMarkup(await Footer({}));
    expect(html).not.toContain('href="/studyo"');
    expect(html).toContain('href="/hizmetler"');
    vi.restoreAllMocks();
  });
});

describe('Header', () => {
  it('leaves out a navigation item that is not visible', () => {
    const next = {
      ...base,
      navigation: base.navigation.map((n) => (n.id === 'studio' ? { ...n, visible: false } : n)),
    };
    const html = renderToStaticMarkup(<Header texts={headerTexts(next)} />);
    expect(html).not.toContain('href="/studyo"');
    expect(html).toContain('href="/hizmetler"');
  });
});
