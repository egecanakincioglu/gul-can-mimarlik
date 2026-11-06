import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { site } from '@/content/site';

export const metadata: Metadata = { title: 'İletişim' };

export default function IletisimPage() {
  return (
    <>
      <section className="grid min-h-[100svh] pt-[var(--hdr)] xl:grid-cols-12">
        {/* Kütle: doğrudan iletişim */}
        <div className="on-dark dark-bg px-[var(--pad)] py-14 md:py-20 xl:col-span-5 xl:flex xl:flex-col xl:justify-between xl:py-24">
          <div>
            <h1 className="d-l max-w-[12ch]">
              Bir sonraki mekânı <span className="w3">birlikte</span> çizelim.
            </h1>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:hidden">
              <a href={site.phoneHref} className="btn btn-day">
                <span>Ara</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
              <a href={site.emailHref} className="btn btn-ghost">
                <span>E-posta gönder</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
          <div className="mt-14 grid gap-8 xl:mt-0">
            <div>
              <p className="label muted">Telefon</p>
              <a href={site.phoneHref} className="d-m big-link mt-2 inline-flex min-h-[44px] items-center">
                {site.phone}
              </a>
            </div>
            <div>
              <p className="label muted">E-posta</p>
              <a href={site.emailHref} className="d-m big-link mt-2 inline-flex min-h-[44px] items-center break-all">
                {site.email}
              </a>
            </div>
            <div>
              <p className="label muted">Adres</p>
              <address className="mt-2 not-italic">
                {site.address.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
            <div className="hidden gap-3 sm:grid-cols-2 xl:grid">
              <a href={site.phoneHref} className="btn btn-day">
                <span>Ara</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
              <a href={site.emailHref} className="btn btn-ghost">
                <span>E-posta gönder</span>
                <span className="arr" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Boşluk: form */}
        <div className="bg-kirec px-[var(--pad)] py-14 md:py-20 xl:col-span-7 xl:py-24 xl:pl-[clamp(48px,6vw,112px)]">
          <h2 className="d-m">Projenizi kısaca anlatın.</h2>
          <p className="muted mt-3 max-w-[44ch]">
            Bu form bir arayüz demosudur: alanlar doğrulanır, ancak mesaj hiçbir yere gönderilmez. Gerçek iletişim için
            telefon veya e-postayı kullanın.
          </p>
          <div className="mt-10 max-w-[720px]">
            <ContactForm />
          </div>
        </div>
      </section>
      <Footer cta={false} step="r" />
    </>
  );
}
