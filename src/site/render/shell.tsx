import Header from '@/components/Header';
import { headerTexts } from '@/components/shell-texts';
import type { SiteContent } from '@/content/types';

export function renderShell(c: SiteContent, children: React.ReactNode) {
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
