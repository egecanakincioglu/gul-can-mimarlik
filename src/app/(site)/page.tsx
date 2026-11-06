import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import HeroMark from '@/components/HeroMark';
import BeforeAfter from '@/components/BeforeAfter';
import ServicesBands from '@/components/ServicesBands';
import Footer from '@/components/Footer';
import { beforeAfterTexts } from '@/components/shell-texts';
import { getContent } from '@/content';
import { getProject } from '@/content/projects';
import { processSteps, site } from '@/content/site';

const hero = {
  src: '/images/hero-poster.png',
  alt: 'Kireç sıvalı boş bir odada duvara düşen gün ışığı. İllüstratif görsel',
  focalX: 60,
  focalY: 50,
};
const heroM = {
  src: '/images/hero-poster-m.png',
  alt: 'Kireç sıvalı boş bir odada duvara düşen gün ışığı. İllüstratif görsel',
  focalX: 50,
  focalY: 50,
};
const materialSet = [
  {
    src: '/images/p1-square.png',
    label: 'Brüt beton · Kireç sıva',
    where: 'Avlulu Konut',
    alt: 'Brüt beton ve kireç sıva malzeme detayı. İllüstratif görsel',
  },
  {
    src: '/images/p2-square.png',
    label: 'Mikro beton · Keten',
    where: 'Daire Yenileme',
    alt: 'Mikro beton ve keten malzeme detayı. İllüstratif görsel',
  },
  {
    src: '/images/p4-square.png',
    label: 'Meşe · Siyah çelik',
    where: 'Köşe Kafe',
    alt: 'Meşe ve siyah çelik malzeme detayı. İllüstratif görsel',
  },
];
const arrow = (
  <span className="arr" aria-hidden>
    →
  </span>
);

export default async function Home() {
  const content = await getContent();
  const p1 = getProject('avlulu-konut')!;
  const p2 = getProject('daire-yenileme')!;
  const p3 = getProject('yamac-evi')!;
  const p4 = getProject('kose-kafe')!;

  return (
    <>
      {/* ───── HERO — Işıklı oda ───── */}
      <section className="hero on-dark" aria-labelledby="hero-h">
        <HeroMark />
        <div className="hero-copy">
          <h1 id="hero-h" className="d-hero">
            <span className="hl-line">
              <span className="w3" style={{ '--d': '1.05s' } as React.CSSProperties}>
                Işığa
              </span>
            </span>
            <span className="hl-line">
              <span className="w8" style={{ '--d': '1.3s' } as React.CSSProperties}>
                yer açan
              </span>
            </span>
            <span className="hl-line">
              <span className="w3" style={{ '--d': '1.15s' } as React.CSSProperties}>
                mimarlık.
              </span>
            </span>
          </h1>
          <p className="lead hero-fade mt-6 max-w-[34ch] text-siva" style={{ '--d': '1.5s' } as React.CSSProperties}>
            Mimari proje, iç mimarlık, 3D görselleştirme ve uygulama. Çizimden anahtar teslime tek elden.
          </p>
          <div
            className="hero-fade mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
            style={{ '--d': '1.6s' } as React.CSSProperties}
          >
            <Link href="/projeler" className="btn">
              <span>Projeleri incele</span>
              {arrow}
            </Link>
            <Link href="/iletisim" className="tlink">
              Projenizi konuşalım {arrow}
            </Link>
          </div>
        </div>
        <div className="hero-room">
          <div className="hero-aperture">
            <div className="absolute inset-0 max-md:hidden">
              <Photo img={hero} sizes="(min-width:1024px) 60vw, 100vw" priority quality={85} />
            </div>
            <div className="absolute inset-0 md:hidden">
              <Photo img={heroM} sizes="100vw" quality={85} />
            </div>
          </div>
        </div>
        <div className="hero-band hero-fade" style={{ '--d': '1.7s' } as React.CSSProperties}>
          <p className="band-list label muted">Mimari Proje · İç Mimarlık · 3D &amp; Animasyon · Uygulama</p>
          <p className="caption flex items-center gap-4">
            <span>İllüstratif görsel</span>
            <a href="#giris" className="label inline-flex min-h-[44px] items-center text-kirec">
              Projeler ↓
            </a>
          </p>
        </div>
      </section>

      {/* ───── GİRİŞ ───── */}
      <section id="giris" className="sec-b mass-out-r">
        <div className="wrap grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <InView className="rise col-span-4 md:col-span-7 xl:col-span-8 xl:col-start-3">
            <p className="d-l w3 !font-light">
              İyi bir mekân, neyi doldurduğunuz kadar neyi <span className="w8">boş</span> bıraktığınızla ilgilidir.
            </p>
          </InView>
          <InView
            className="rise col-span-4 mt-16 grid gap-6 md:col-span-6 md:col-start-3 xl:col-span-5 xl:col-start-8 xl:mt-24"
            delay={0.1}
          >
            <p className="max-w-[46ch]">
              Gül CAN Mimarlık, Aralık 2020&apos;de kuruldu. Konuttan ticari mekâna, ilk eskizden şantiye teslimine
              kadar projenin her aşamasında yanınızdayız.
            </p>
            <dl className="grid gap-4 border-t border-pose pt-5 text-[15px]">
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <dt className="label muted pt-1">Kuruluş</dt>
                <dd>{site.founded}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <dt className="label muted pt-1">Hizmet</dt>
                <dd>Mimari · İç Mimari · 3D · Uygulama</dd>
              </div>
            </dl>
          </InView>
        </div>
      </section>

      {/* ───── SEÇİLİ ÇALIŞMALAR ───── */}
      <section className="pb-[clamp(96px,12vw,200px)]" aria-labelledby="secili-h">
        <div className="wrap">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="secili-h" className="d-l">
              Seçili Çalışmalar
            </h2>
            <Link href="/projeler" className="tlink self-start">
              Tüm projeler {arrow}
            </Link>
          </div>
          <p className="caption mt-4">Konsept çalışmalar — illüstratif görseller.</p>

          {/* 1 — 8 kolon landscape + Konsol */}
          <Link href={`/projeler/${p1.slug}`} className="card group relative mt-14 block md:mt-20 xl:mt-24">
            <div className="grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
              <InView className="wipe col-span-4 md:col-span-8 xl:col-span-8 xl:col-start-1 xl:row-start-1" from="left">
                <div className="zoom relative aspect-[3/2] overflow-hidden bg-beton">
                  <Photo img={p1.cover} sizes="(min-width:1280px) 62vw, 100vw" />
                </div>
              </InView>
              <div className="relative z-10 col-span-4 bg-pose p-6 text-kirec md:col-span-5 md:col-start-4 md:-mt-12 md:p-8 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:mt-0 xl:self-end xl:p-10">
                <span className="badge">Konsept Çalışma</span>
                <h3 className="d-m mt-5">{p1.title}</h3>
                <p className="label muted mt-3">
                  {p1.category} · {p1.scope[0]}
                </p>
                <p className="mt-5 max-w-[34ch] text-[16px] text-siva">{p1.summary}</p>
                <p className="mt-6 flex items-center gap-3 font-medium">
                  Projeyi incele{' '}
                  <span className="card-arr" aria-hidden>
                    →
                  </span>
                </p>
              </div>
            </div>
          </Link>

          {/* 2 — portrait, kaydırılmış */}
          <div className="mt-24 grid grid-cols-4 gap-x-4 md:mt-32 md:grid-cols-8 md:gap-x-5 xl:mt-40 xl:grid-cols-12 xl:gap-x-6">
            <Link
              href={`/projeler/${p2.slug}`}
              className="card group col-span-4 max-md:mr-[12%] md:col-span-4 xl:col-span-5 xl:col-start-2 xl:mt-[15vh]"
            >
              <InView className="wipe" from="left">
                <div className="zoom relative aspect-[4/5] overflow-hidden bg-beton">
                  <Photo img={p2.cover} sizes="(min-width:1280px) 40vw, (min-width:768px) 50vw, 88vw" />
                </div>
              </InView>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="d-m">{p2.title}</h3>
                <span className="card-arr d-m" aria-hidden>
                  →
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="badge">Konsept Çalışma</span>
                <span className="caption">İllüstratif görsel</span>
              </div>
            </Link>
            <InView
              className="rise col-span-4 mt-10 self-start md:col-span-4 md:mt-24 xl:col-span-5 xl:col-start-8 xl:mt-0"
              delay={0.1}
            >
              <p className="label muted">
                {p2.category} · {p2.scope.join(' · ')}
              </p>
              <p className="lead mt-5 max-w-[30ch]">{p2.summary}</p>
              <Link href={`/projeler/${p2.slug}`} className="tlink mt-6">
                Projeyi incele {arrow}
              </Link>
            </InView>
          </div>

          {/* 2b — Köşe Kafe: metin solda, landscape sağda */}
          <div className="mt-24 grid grid-cols-4 gap-x-4 gap-y-8 md:mt-32 md:grid-cols-8 md:gap-x-5 xl:mt-40 xl:grid-cols-12 xl:gap-x-6">
            <InView className="rise order-2 col-span-4 md:order-1 md:col-span-3 xl:col-span-4 xl:self-end" delay={0.1}>
              <p className="label muted">
                {p4.category} · {p4.scope.join(' · ')}
              </p>
              <h3 className="d-m mt-4">{p4.title}</h3>
              <p className="mt-4 max-w-[34ch] muted">{p4.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="badge">Konsept Çalışma</span>
                <span className="caption">İllüstratif görsel</span>
              </div>
              <Link href={`/projeler/${p4.slug}`} className="tlink mt-4">
                Projeyi incele {arrow}
              </Link>
            </InView>
            <Link
              href={`/projeler/${p4.slug}`}
              className="card group order-1 col-span-4 md:order-2 md:col-span-5 xl:col-span-7 xl:col-start-6"
            >
              <InView className="wipe" from="right">
                <div className="zoom relative aspect-[3/2] overflow-hidden bg-beton">
                  <Photo img={p4.hero} sizes="(min-width:1280px) 56vw, (min-width:768px) 60vw, 100vw" />
                </div>
              </InView>
            </Link>
          </div>
        </div>

        {/* 3 — full-bleed wide + Lento */}
        <Link href={`/projeler/${p3.slug}`} className="card group mt-24 block md:mt-32 xl:mt-40">
          <div className="bg-pose px-[var(--pad)] py-5 text-kirec">
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h3 className="d-m">{p3.title}</h3>
                <span className="badge">Konsept Çalışma</span>
                {p3.video && <span className="badge">Video</span>}
              </div>
              <span className="flex items-center gap-3 font-medium">
                Projeyi incele{' '}
                <span className="card-arr" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
          <InView className="wipe" from="right">
            <div className="zoom relative aspect-[4/3] overflow-hidden bg-beton md:aspect-[21/9]">
              <Photo img={p3.cover} sizes="100vw" />
            </div>
          </InView>
          <p className="caption wrap mt-3">İllüstratif görsel · Yamaç evi konsepti</p>
        </Link>
      </section>

      {/* ───── ÖNCE / SONRA ───── */}
      <section className="sec-b bg-kagit" aria-labelledby="ba-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <div className="col-span-4 md:col-span-8 xl:col-span-4 xl:order-2 xl:pt-4">
            <h2 id="ba-h" className="d-l">
              Önce <span className="w3">/</span> <span className="w8">Sonra</span>
            </h2>
            <p className="lead mt-6 max-w-[28ch]">Aynı oda, aynı geometri. Değişen yüzeyler ve ışığın okunuşu.</p>
            <p className="mt-4 max-w-[40ch] muted">
              Sürükleyin, dokunun ya da alttaki Önce / Karşılaştır / Sonra kontrolünü kullanın.
            </p>
            <Link href="/projeler/daire-yenileme" className="tlink mt-6">
              Projeyi incele {arrow}
            </Link>
          </div>
          <div className="col-span-4 md:col-span-8 xl:order-1 xl:col-span-8">
            <BeforeAfter
              texts={beforeAfterTexts(content)}
              before={p2.beforeAfter!.before}
              after={p2.beforeAfter!.after}
            />
          </div>
        </div>
      </section>

      {/* ───── MALZEME ───── */}
      <section className="sec-b" aria-labelledby="mal-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <InView className="rise col-span-4 md:col-span-6 xl:col-span-5">
            <h2 id="mal-h" className="d-l">
              Az malzeme, <span className="w8">net oran.</span>
            </h2>
            <p className="lead mt-6 max-w-[28ch]">
              Kireç sıva, beton, meşe, keten, siyah çelik. Palet dar kaldıkça mekân sakinleşir.
            </p>
          </InView>
          {materialSet.map((m, i) => (
            <figure
              key={m.src}
              className={[
                'col-span-4',
                i === 0 ? 'md:col-span-4 xl:col-span-4 xl:col-start-1 xl:row-start-2' : '',
                i === 1 ? 'max-md:mr-[12%] md:col-span-4 xl:col-span-4 xl:col-start-6 xl:row-start-2 xl:mt-[12vh]' : '',
                i === 2 ? 'md:col-span-4 md:col-start-3 xl:col-span-3 xl:col-start-10 xl:row-start-2 xl:mt-[4vh]' : '',
              ].join(' ')}
            >
              <InView className="wipe" from={i % 2 ? 'right' : 'left'}>
                <div className="relative aspect-square overflow-hidden bg-beton">
                  <Photo
                    img={{ src: m.src, alt: m.alt, focalX: 50, focalY: 50 }}
                    sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw"
                  />
                </div>
              </InView>
              <figcaption className="mt-3">
                <span className="block font-medium">{m.label}</span>
                <span className="caption">İllüstratif görsel · {m.where} · Konsept Çalışma</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───── HİZMETLER (kütle) ───── */}
      <section className="sec-k on-dark mass-in-l" aria-labelledby="hiz-h">
        <div className="wrap">
          <InView className="rise">
            <h2 id="hiz-h" className="d-l max-w-[16ch]">
              Projenin her aşaması, <span className="w3">tek masada.</span>
            </h2>
          </InView>
          <div className="mt-14 md:mt-20">
            <ServicesBands />
          </div>
          <Link href="/hizmetler" className="btn btn-ghost mt-12 w-full sm:w-auto">
            <span>Hizmetler</span>
            {arrow}
          </Link>
        </div>
      </section>

      {/* ───── SÜREÇ ───── */}
      <section className="sec-b bg-siva mass-out-r md:!pb-0" aria-labelledby="sur-h">
        <div className="wrap">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 id="sur-h" className="d-l">
              Fikirden <span className="w3">yapıya.</span>
            </h2>
            <p className="max-w-[34ch] text-[17px] leading-snug text-golge">
              Altı adım, tek ekip. Her adım bir öncekinin üzerine yükselir.
            </p>
          </div>
          <InView className="proc mt-14 md:mt-24">
            {processSteps.map((s, i) => (
              <div
                key={s}
                className="proc-step"
                data-last={i === processSteps.length - 1 ? '1' : undefined}
                style={{ '--i': i, '--j': i % 3 } as React.CSSProperties}
              >
                <p className="proc-no" aria-hidden="true">
                  0{i + 1}
                </p>
                <p className="proc-t">{s}</p>
                <div className="proc-bar" aria-hidden="true" />
              </div>
            ))}
          </InView>
        </div>
      </section>

      {/* ───── STÜDYO ───── */}
      <section className="sec-b relative z-10 !pb-0 xl:!pb-0" aria-labelledby="std-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <InView className="rise col-span-4 md:col-span-6 xl:col-span-7">
            <h2 id="std-h" className="d-l">
              Çizimden <span className="w3">şantiyeye,</span> aynı masa.
            </h2>
            <div className="prose mt-8">
              <p>
                Stüdyo Aralık 2020&apos;de kuruldu. Tasarım, görselleştirme ve uygulama aynı ekipte kalıyor; böylece
                çizilen, yapılanla aynı oluyor.
              </p>
              <p>
                Aşağıdaki görsel stüdyonun gerçek ofisi değil, çalışma biçimini anlatan illüstratif bir atmosferdir.
              </p>
            </div>
            <Link href="/studyo" className="tlink mt-8">
              Stüdyo {arrow}
            </Link>
          </InView>
          <div className="col-span-4 -mb-[calc(var(--step)+clamp(48px,6vw,96px))] md:col-span-4 md:col-start-5 xl:col-span-4 xl:col-start-9">
            <p className="caption mb-3">İllüstratif görsel</p>
            <InView className="wipe" from="left">
              <div className="relative aspect-[4/5] overflow-hidden bg-beton">
                <Photo
                  img={{
                    src: '/images/studio-atmos.png',
                    alt: 'Pencere önünde çizim masası, maket ve aydınlık sıvalı duvar. İllüstratif görsel',
                    focalX: 50,
                    focalY: 55,
                  }}
                  sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw"
                />
              </div>
            </InView>
          </div>
        </div>
      </section>
      <div className="h-[clamp(48px,6vw,96px)]" aria-hidden />

      {/* ───── İLETİŞİM + FOOTER ───── */}
      <Footer step="l" />
    </>
  );
}
