import Header from '@/components/Header';
import { headerTexts } from '@/components/shell-texts';
import { getContent } from '@/content';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  return (
    <>
      <a href="#icerik" className="skip">
        {c.ui.skipLink}
      </a>
      <Header texts={headerTexts(c)} />
      <main id="icerik">{children}</main>
    </>
  );
}
