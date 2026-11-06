import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import { publishedProjects } from '@/content/select';
import { renderHome } from '@/site/render/home';
import { renderServices } from '@/site/render/services';
import { renderProjects } from '@/site/render/projects';
import { renderProject } from '@/site/render/project';
import { renderStudio } from '@/site/render/studio';
import { renderContact } from '@/site/render/contact';
import { renderShell } from '@/site/render/shell';
import Home from './page';
import Services from './hizmetler/page';
import Projects from './projeler/page';
import Project from './projeler/[slug]/page';
import Studio from './studyo/page';
import Contact from './iletisim/page';
import SiteLayout from './layout';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/',
}));

const html = (node: React.ReactNode) => renderToStaticMarkup(<>{node}</>);

describe('render seam', () => {
  it.each([
    ['home', Home, renderHome],
    ['services', Services, renderServices],
    ['projects', Projects, renderProjects],
    ['studio', Studio, renderStudio],
    ['contact', Contact, renderContact],
  ] as const)('%s: render function matches the default export', async (_name, Page, render) => {
    const c = await getContent();
    expect(html(render(c))).toBe(html(await Page()));
  });

  it('project: render function matches the default export', async () => {
    const c = await getContent();
    const slug = publishedProjects(c)[0].slug;
    expect(html(renderProject(c, slug))).toBe(html(await Project({ params: Promise.resolve({ slug }) })));
  });

  it('project: returns null for an unknown slug', async () => {
    expect(renderProject(await getContent(), 'no-such-project')).toBeNull();
  });

  it('project: drafts render only with includeUnpublished', async () => {
    const c = structuredClone(await getContent());
    const slug = c.projects[0].slug;
    c.projects[0].published = false;
    expect(renderProject(c, slug)).toBeNull();
    expect(html(renderProject(c, slug, { includeUnpublished: true }))).toContain('<h1');
  });

  it('shell: render function matches the layout', async () => {
    const c = await getContent();
    const body = <p>body</p>;
    expect(html(renderShell(c, body))).toBe(html(await SiteLayout({ children: body })));
  });
});
