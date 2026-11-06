import type { Metadata } from 'next';
import { renderProjects } from '@/site/render/projects';
import { getContent } from '@/content';
import { seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'projects');
}

export default async function ProjelerPage() {
  return renderProjects(await getContent());
}
