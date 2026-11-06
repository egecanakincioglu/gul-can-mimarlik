import type { Metadata } from 'next';
import { Funnel_Display, Funnel_Sans } from 'next/font/google';
import Script from 'next/script';
import { getContent } from '@/content';
import './globals.css';

// Funnel Display / Funnel Sans: latin-ext alt kümesi Türkçe glifleri (ı İ ğ Ğ ş Ş) kapsar.
// next/font bu alt küme yoksa build'de hata verir; ilk build bunun kanıtıdır.
const display = Funnel_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-funnel-display',
  display: 'swap',
});
const sans = Funnel_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-funnel-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: { default: c.site.name, template: c.seo.titleTemplate },
    description: c.seo.description + (c.site.demoMode ? c.seo.demoSuffix : ''),
  };
}

const boot = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('gc-hero'))document.documentElement.dataset.hero='seen'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <Script id="boot" strategy="beforeInteractive">
          {boot}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
