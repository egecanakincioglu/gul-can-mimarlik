import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import Footer from '@/components/Footer';
import { serviceCategories, site } from '@/content/site';

export const metadata: Metadata = { title: 'Stüdyo' };

const principles = [
  { t: 'Kütle', d: 'Taşıyan, saran, ağırlık veren: yapının sağlam kısmı. Önce onu doğru kurarız.' },
  { t: 'Boşluk', d: 'Odanın kendisi. Neyin boş kalacağı, neyin dolacağı kadar önemlidir.' },
  { t: 'Işık', d: 'Boşluğa giren gün ışığı. Plan, açıklıklar ve malzeme onun yolunu hesaba katar.' },
];

export default function StudyoPage() {
  return (
    <>
      <section className="pt-[var(--hdr)]">
        <div className="wrap sec-b grid grid-cols-4 gap-x-4 gap-y-14 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h1 className="d-xl col-span-4 md:col-span-8 xl:col-span-10">
            Mekânı çizen, <span className="w8">yapıyı</span> da takip eden stüdyo.
          </h1>
          <div className="prose col-span-4 md:col-span-6 md:col-start-3 xl:col-span-5 xl:col-start-3">
            <p className="lead">Gül CAN Mimarlık, {site.founded}&apos;de kuruldu.</p>
            <p className="mt-6">
              Konuttan ticari mekâna; ilk eskizden şantiye teslimine kadar projenin her aşamasında yanınızdayız. Mimari
              proje, iç mimarlık, 3D görselleştirme ve uygulama aynı çatı altında yürüyor.
            </p>
          </div>
        </div>
      </section>

      <section className="sec-b bg-kagit" aria-labelledby="fel-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-14 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h2 id="fel-h" className="d-l col-span-4 md:col-span-6 xl:col-span-6">
            İyi bir mekân, neyi <span className="w3">boş</span> bıraktığınızla ilgilidir.
          </h2>
          <InView
            className="wipe col-span-4 md:col-span-4 md:col-start-5 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1"
            from="right"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-beton">
              <Photo
                img={{
                  src: '/images/studio-atmos.png',
                  alt: 'Pencere önünde çizim masası, maket ve aydınlık sıvalı duvar. İllüstratif görsel',
                  focalX: 50,
                  focalY: 55,
                }}
                sizes="(min-width:1280px) 30vw, 50vw"
              />
            </div>
            <p className="caption mt-3">İllüstratif görsel — stüdyonun gerçek ofisi değildir.</p>
          </InView>
          <ol className="col-span-4 grid list-none gap-0 border-t border-pose md:col-span-8 xl:col-span-7 xl:col-start-1">
            {principles.map((p, i) => (
              <li
                key={p.t}
                className="grid gap-2 border-b border-pose/30 py-7 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,2fr)] md:gap-6"
              >
                <span className="label muted pt-2">0{i + 1}</span>
                <h3 className="d-m">{p.t}</h3>
                <p className="max-w-[44ch] muted">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-b !pb-0" aria-labelledby="kap-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h2 id="kap-h" className="d-l col-span-4 md:col-span-8 xl:col-span-7">
            Neler <span className="w8">yapıyoruz.</span>
          </h2>
          <ul className="col-span-4 list-none border-t border-pose md:col-span-8 xl:col-span-10 xl:col-start-3">
            {serviceCategories.map((c) => (
              <li key={c.slug} className="border-b border-pose/30">
                <Link
                  href={`/hizmetler#${c.slug}`}
                  className="group grid gap-2 py-7 md:grid-cols-[4rem_minmax(0,1.2fr)_minmax(0,2fr)_2rem] md:items-baseline md:gap-6"
                >
                  <span className="label muted">{c.no}</span>
                  <h3 className="d-m">{c.name}</h3>
                  <p className="muted">{c.services.map((s) => s.name).join(' · ')}</p>
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
            Ofis
          </h2>
          <address className="col-span-4 not-italic md:col-span-4 xl:col-span-4 xl:col-start-8">
            <p className="label muted">Adres</p>
            <p className="d-s mt-4">
              {site.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
            <p className="mt-6 flex flex-col gap-1">
              <a href={site.phoneHref} className="big-link inline-flex min-h-[44px] items-center">
                {site.phone}
              </a>
              <a href={site.emailHref} className="big-link inline-flex min-h-[44px] items-center break-all">
                {site.email}
              </a>
            </p>
            <Link href="/iletisim" className="btn mt-8 w-full sm:w-auto">
              <span>İletişim</span>
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
