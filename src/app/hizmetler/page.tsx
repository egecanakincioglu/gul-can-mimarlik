import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import Footer from '@/components/Footer';
import { processSteps, serviceCategories } from '@/content/site';

export const metadata: Metadata = { title: 'Hizmetler' };

/* Alternating mass / void; never two dark floors in a row. */
const TONE = ['light', 'dark', 'light', 'paper'] as const;

export default function HizmetlerPage() {
  return (
    <>
      <section className="pt-[var(--hdr)]">
        <div className="wrap sec-b !pb-[clamp(64px,8vw,120px)] grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <h1 className="d-xl col-span-4 md:col-span-8 xl:col-span-9">
            Projenin her aşaması, <span className="w8">tek masada.</span>
          </h1>
          <p className="lead col-span-4 mt-10 max-w-[36ch] md:col-span-5 md:col-start-1 xl:col-span-4 xl:col-start-3">
            Dört kategori, on hizmet. Çizimden anahtar teslime her aşamayı birlikte ya da ayrı ayrı yürütüyoruz.
          </p>
        </div>
      </section>

      {serviceCategories.map((c, i) => {
        const tone = TONE[i];
        const dark = tone === 'dark';
        const cls = dark ? 'sec-k on-dark' : tone === 'paper' ? 'sec-b bg-siva' : 'sec-b bg-kagit';
        const edge = dark
          ? i % 2
            ? 'mass-in-l'
            : 'mass-in-r'
          : serviceCategories[i - 1] && TONE[i - 1] === 'dark'
            ? 'mass-out-r'
            : '';
        const flip = i % 2 === 1;
        return (
          <section key={c.slug} id={c.slug} className={`${cls} ${edge}`} aria-labelledby={`${c.slug}-h`}>
            <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
              <div className={`col-span-4 md:col-span-8 xl:col-span-7 ${flip ? 'xl:col-start-6 xl:order-2' : ''}`}>
                <p className="label muted">{c.no} / 04</p>
                <h2 id={`${c.slug}-h`} className="d-l mt-4">
                  {c.name}
                </h2>
                <p className="lead mt-6 max-w-[30ch]">{c.sentence}</p>
                <ul className="mt-12 list-none border-t border-current">
                  {c.services.map((s) => (
                    <li
                      key={s.name}
                      className="grid gap-1 border-b border-current/30 py-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8"
                    >
                      <h3 className="d-s">{s.name}</h3>
                      <p className={dark ? 'text-siva' : 'muted'}>{s.desc}</p>
                    </li>
                  ))}
                </ul>
                <Link href={`/projeler/${c.projectSlug}`} className="tlink mt-8">
                  İlgili konsept proje →
                </Link>
              </div>
              <div
                className={`col-span-4 md:col-span-5 xl:col-span-4 ${flip ? 'xl:col-start-2 xl:order-1' : 'xl:col-start-9'} ${i === 0 ? 'xl:mt-24' : 'xl:mt-40'}`}
              >
                <InView className="wipe" from={flip ? 'right' : 'left'}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-beton">
                    <Photo img={c.image} sizes="(min-width:1280px) 30vw, 60vw" />
                  </div>
                </InView>
                <p className="caption mt-3">İllüstratif görsel · Konsept Çalışma</p>
              </div>
            </div>
          </section>
        );
      })}
      <section className="sec-b" aria-labelledby="sur-h">
        <div className="wrap">
          <h2 id="sur-h" className="d-l">
            Fikirden <span className="w3">yapıya.</span>
          </h2>
          <p className="lead mt-6 max-w-[34ch]">
            Altı adım. İsterseniz hepsini, isterseniz yalnızca ihtiyacınız olanı birlikte yürütürüz.
          </p>
          <InView className="proc mt-16 md:mt-24">
            {processSteps.map((s, i) => (
              <div key={s} className="proc-step" style={{ '--i': i } as React.CSSProperties}>
                <div className="proc-bar" />
                <p className="label">0{i + 1}</p>
                <p className="d-s mt-2 max-w-[16ch]">{s}</p>
              </div>
            ))}
          </InView>
          <p className="caption mt-14 max-w-[52ch]">
            Paket Proje ve Şantiye Şefliği kapsamı projeye göre birlikte netleştirilir. Bu sayfa bir tasarım demosudur.
          </p>
        </div>
      </section>
      <Footer step="l" />
    </>
  );
}
