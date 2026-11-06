import Header from '@/components/Header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#icerik" className="skip">
        İçeriğe geç
      </a>
      <Header />
      <main id="icerik">{children}</main>
    </>
  );
}
