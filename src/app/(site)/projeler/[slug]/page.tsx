import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { renderProject } from '@/site/render/project';
import { getContent } from '@/content';
import { getProjectBySlug, publishedProjects, resolveRedirect, seoForProject } from '@/content/select';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return publishedProjects(await getContent()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getContent();
  const p = getProjectBySlug(c, (await params).slug);
  return p ? seoForProject(c, p) : {};
}

export default async function ProjectPage({ params }: Params) {
  const c = await getContent();
  const { slug } = await params;
  const page = renderProject(c, slug);
  if (!page) {
    const to = resolveRedirect(c, `/projeler/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }
  return page;
}
