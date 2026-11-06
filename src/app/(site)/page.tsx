import type { Metadata } from 'next';
import { renderHome } from '@/site/render/home';
import { getContent } from '@/content';
import { seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'home');
}

export default async function Home() {
  return renderHome(await getContent());
}
