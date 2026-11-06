import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import Footer from '@/components/Footer';
import RichText from '@/components/RichText';
import { getContent } from '@/content';
import { emailHref, illustrativeLabel, phoneHref, resolveImage, seoForPage, text } from '@/content/select';

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'studio');
}

export default async function StudyoPage() {
  const c = await getContent();
  const page = c.studioPage;
  return (
    <>
      <section className="pt-[var(--hdr)]">
        <div className="wrap sec-b grid grid-cols-4 gap-x-4 gap-y-14 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h1 className="d-xl col-span-4 md:col-span-8 xl:col-span-10">
            <RichText value={page.heading} />
          </h1>
          <div className="prose col-span-4 md:col-span-6 md:col-start-3 xl:col-span-5 xl:col-start-3">
            <p className="lead">{text(c, page.lead)}</p>
            <p className="mt-6">{page.paragraph}</p>
          </div>
        </div>
      </section>

      <section className="sec-b bg-kagit" aria-labelledby="fel-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-14 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h2 id="fel-h" className="d-l col-span-4 md:col-span-6 xl:col-span-6">
            <RichText value={page.sentence} />
          </h2>
          <InView
            className="wipe col-span-4 md:col-span-4 md:col-start-5 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1"
            from="right"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-beton">
              <Photo img={resolveImage(c, page.image)} sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw" />
            </div>
            {(page.imageCaption ?? illustrativeLabel(c, page.image)) && (
              <p className="caption mt-3">{page.imageCaption ?? illustrativeLabel(c, page.image)}</p>
            )}
          </InView>
          <ol className="col-span-4 grid list-none gap-0 border-t border-pose md:col-span-8 xl:col-span-7 xl:col-start-1">
            {page.principles.map((p, i) => (
              <li
                key={p.id}
                className="grid gap-2 border-b border-pose/30 py-7 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,2fr)] md:gap-6"
              >
                <span className="label muted pt-2">0{i + 1}</span>
                <h3 className="d-m">{p.title}</h3>
                <p className="max-w-[44ch] muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-b !pb-0" aria-labelledby="kap-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h2 id="kap-h" className="d-l col-span-4 md:col-span-8 xl:col-span-7">
            <RichText value={page.servicesHeading} />
          </h2>
          <ul className="col-span-4 list-none border-t border-pose md:col-span-8 xl:col-span-10 xl:col-start-3">
            {c.serviceCategories.map((cat, i) => (
              <li key={cat.id} className="border-b border-pose/30">
                <Link
                  href={`/hizmetler#${cat.slug}`}
                  className="group grid gap-2 py-7 md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,2fr)_2rem] md:items-baseline md:gap-6"
                >
                  <span className="label muted">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="d-m">{cat.name}</h3>
                  <p className="muted">{cat.services.map((s) => s.name).join(' · ')}</p>
                  <span className="card-arr hidden md:block" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec-b" aria-labelledby="ofis-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h2 id="ofis-h" className="d-l col-span-4 md:col-span-8 xl:col-span-7">
            {page.officeHeading}
          </h2>
          <address className="col-span-4 not-italic md:col-span-4 xl:col-span-4 xl:col-start-8">
            <p className="label muted">{c.ui.address}</p>
            <p className="d-s mt-4">
              {c.contact.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
            <p className="mt-6 flex flex-col gap-1">
              <a href={phoneHref(c)} className="big-link inline-flex min-h-[44px] items-center">
                {c.contact.phone}
              </a>
              <a href={emailHref(c)} className="big-link inline-flex min-h-[44px] items-center break-all">
                {c.contact.email}
              </a>
            </p>
            <Link href="/iletisim" className="btn mt-8 w-full sm:w-auto">
              <span>{page.contactLabel}</span>
              <span className="arr" aria-hidden>
                →
              </span>
            </Link>
          </address>
        </div>
      </section>
      <Footer cta={false} step="l" />
    </>
  );
}
