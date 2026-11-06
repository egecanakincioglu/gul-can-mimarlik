import type { Metadata } from 'next';
import { renderStudio } from '@/site/render/studio';
import { getContent } from '@/content';
import { seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'studio');
}

export default async function StudyoPage() {
  return renderStudio(await getContent());
}
