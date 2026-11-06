import type { Metadata } from 'next';
import { renderContact } from '@/site/render/contact';
import { getContent } from '@/content';
import { seoForPage } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'contact');
}

export default async function IletisimPage() {
  return renderContact(await getContent());
}
