import type { Metadata } from 'next';
import { renderServices } from '@/site/render/services';
import { getContent } from '@/content';
import { seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = seoForPage(await getContent(), 'services');
  return { title, description };
}

export default async function HizmetlerPage() {
  return renderServices(await getContent());
}
