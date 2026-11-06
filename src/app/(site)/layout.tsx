import { renderShell } from '@/site/render/shell';
import { getContent } from '@/content';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return renderShell(await getContent(), children);
}
