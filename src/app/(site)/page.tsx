import type { Metadata } from 'next';
import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import HeroMark from '@/components/HeroMark';
import BeforeAfter from '@/components/BeforeAfter';
import RichText from '@/components/RichText';
import ServicesBands from '@/components/ServicesBands';
import Footer from '@/components/Footer';
import { beforeAfterTexts } from '@/components/shell-texts';
import { getContent } from '@/content';
import {
  conceptBadge,
  demoText,
  getProjectById,
  illustrativeLabel,
  resolveImage,
  scopeLinks,
  seoForPage,
  text,
} from '@/content/select';
import type { ImageRef, Project } from '@/content/types';

// Entrance delays belong to the layout, not to the content.
const heroLineDelays = ['1.05s', '1.3s', '1.15s'];
const arrow = (
  <span className="arr" aria-hidden>
    →
  </span>
);
const delay = (d: string) => ({ '--d': d }) as React.CSSProperties;
const weightClass = (weight?: number) => (weight === 800 ? 'w8' : weight === 300 ? 'w3' : undefined);

export async function generateMetadata(): Promise<Metadata> {
  return seoForPage(await getContent(), 'home');
}

export default async function Home() {
  const c = await getContent();
  const { hero, intro, featured, beforeAfter, materials, services, process, studioTeaser } = c.home;
  const [s1, s2, s3, s4] = featured.slots.map((slot) => {
    const project = getProjectById(c, slot.projectId)!;
    const ref: ImageRef = project[slot.image];
    return {
      project,
      href: `/projeler/${project.slug}`,
      img: resolveImage(c, ref),
      label: [illustrativeLabel(c, ref), slot.caption].filter(Boolean).join(' · '),
      badge: conceptBadge(c, project),
    };
  });
  const category = (p: Project) => c.projectCategories.find((x) => x.id === p.categoryId)?.name;
  const scopeNames = (p: Project) => scopeLinks(c, p).map((l) => l.name);
  const baProject = beforeAfter.projectId ? getProjectById(c, beforeAfter.projectId) : undefined;
  const demoListing = demoText(c, 'listing');
  const demoTeaser = demoText(c, 'studioTeaser');
  const teaserLabel = illustrativeLabel(c, studioTeaser.image);
  const viewProject = c.ui.viewProject;
  const badge = (b: string | null) => b && <span className="badge">{b}</span>;

  return (
    <>
      {/* ───── HERO — Işıklı oda ───── */}
      <section className="hero on-dark" aria-labelledby="hero-h">
        <HeroMark />
        <div className="hero-copy">
          <h1 id="hero-h" className="d-hero">
            {hero.lines.map((line, i) => (
              <span key={i} className="hl-line">
                {line.map((seg, j) => (
                  <span key={j} className={weightClass(seg.weight)} style={delay(heroLineDelays[i])}>
                    {seg.text}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="lead hero-fade mt-6 max-w-[34ch] text-siva" style={delay('1.5s')}>
            {hero.lead}
          </p>
          <div
            className="hero-fade mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
            style={delay('1.6s')}
          >
            <Link href={hero.primary.href} className="btn">
              <span>{hero.primary.label}</span>
              {arrow}
            </Link>
            <Link href={hero.secondary.href} className="tlink">
              {hero.secondary.label} {arrow}
            </Link>
          </div>
        </div>
        <div className="hero-room">
          <div className="hero-aperture">
            <div className="absolute inset-0 max-md:hidden">
              <Photo
                img={resolveImage(c, hero.posterDesktop)}
                sizes="(min-width:1024px) 60vw, 100vw"
                priority
                quality={85}
              />
            </div>
            <div className="absolute inset-0 md:hidden">
              <Photo img={resolveImage(c, hero.posterMobile)} sizes="100vw" quality={85} />
            </div>
          </div>
        </div>
        <div className="hero-band hero-fade" style={delay('1.7s')}>
          <p className="band-list label muted">{hero.band.join(' · ')}</p>
          <p className="caption flex items-center gap-4">
            <span>{illustrativeLabel(c, hero.posterDesktop)}</span>
            <a href="#giris" className="label inline-flex min-h-[44px] items-center text-kirec">
              {hero.anchor}
            </a>
          </p>
        </div>
      </section>

      {/* ───── GİRİŞ ───── */}
      <section id="giris" className="sec-b mass-out-r">
        <div className="wrap grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <InView className="rise col-span-4 md:col-span-7 xl:col-span-8 xl:col-start-3">
            <p className="d-l w3 !font-light">
              <RichText value={intro.sentence} />
            </p>
          </InView>
          <InView
            className="rise col-span-4 mt-16 grid gap-6 md:col-span-6 md:col-start-3 xl:col-span-5 xl:col-start-8 xl:mt-24"
            delay={0.1}
          >
            <p className="max-w-[46ch]">{text(c, intro.paragraph)}</p>
            <dl className="grid gap-4 border-t border-pose pt-5 text-[15px]">
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <dt className="label muted pt-1">{intro.foundedLabel}</dt>
                <dd>{text(c, '{founded}')}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-4">
                <dt className="label muted pt-1">{intro.servicesLabel}</dt>
                <dd>{intro.servicesLine}</dd>
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
              {featured.heading}
            </h2>
            <Link href="/projeler" className="tlink self-start">
              {featured.link} {arrow}
            </Link>
          </div>
          {demoListing && <p className="caption mt-4">{demoListing}</p>}

          {/* 1 — 8 kolon landscape + Konsol */}
          <Link href={s1.href} className="card group relative mt-14 block md:mt-20 xl:mt-24">
            <div className="grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
              <InView className="wipe col-span-4 md:col-span-8 xl:col-span-8 xl:col-start-1 xl:row-start-1" from="left">
                <div className="zoom relative aspect-[3/2] overflow-hidden bg-beton">
                  <Photo img={s1.img} sizes="(min-width:1280px) 62vw, 100vw" />
                </div>
              </InView>
              <div className="relative z-10 col-span-4 bg-pose p-6 text-kirec md:col-span-5 md:col-start-4 md:-mt-12 md:p-8 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:mt-0 xl:self-end xl:p-10">
                {badge(s1.badge)}
                <h3 className="d-m mt-5">{s1.project.title}</h3>
                <p className="label muted mt-3">
                  {category(s1.project)} · {scopeNames(s1.project)[0]}
                </p>
                <p className="mt-5 max-w-[34ch] text-[16px] text-siva">{s1.project.summary}</p>
                <p className="mt-6 flex items-center gap-3 font-medium">
                  {viewProject}{' '}
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
              href={s2.href}
              className="card group col-span-4 max-md:mr-[12%] md:col-span-4 xl:col-span-5 xl:col-start-2 xl:mt-[15vh]"
            >
              <InView className="wipe" from="left">
                <div className="zoom relative aspect-[4/5] overflow-hidden bg-beton">
                  <Photo img={s2.img} sizes="(min-width:1280px) 40vw, (min-width:768px) 50vw, 88vw" />
                </div>
              </InView>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h3 className="d-m">{s2.project.title}</h3>
                <span className="card-arr d-m" aria-hidden>
                  →
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {badge(s2.badge)}
                {s2.label && <span className="caption">{s2.label}</span>}
              </div>
            </Link>
            <InView
              className="rise col-span-4 mt-10 self-start md:col-span-4 md:mt-24 xl:col-span-5 xl:col-start-8 xl:mt-0"
              delay={0.1}
            >
              <p className="label muted">
                {category(s2.project)} · {scopeNames(s2.project).join(' · ')}
              </p>
              <p className="lead mt-5 max-w-[30ch]">{s2.project.summary}</p>
              <Link href={s2.href} className="tlink mt-6">
                {viewProject} {arrow}
              </Link>
            </InView>
          </div>

          {/* 2b — Köşe Kafe: metin solda, landscape sağda */}
          <div className="mt-24 grid grid-cols-4 gap-x-4 gap-y-8 md:mt-32 md:grid-cols-8 md:gap-x-5 xl:mt-40 xl:grid-cols-12 xl:gap-x-6">
            <InView className="rise order-2 col-span-4 md:order-1 md:col-span-3 xl:col-span-4 xl:self-end" delay={0.1}>
              <p className="label muted">
                {category(s3.project)} · {scopeNames(s3.project).join(' · ')}
              </p>
              <h3 className="d-m mt-4">{s3.project.title}</h3>
              <p className="mt-4 max-w-[34ch] muted">{s3.project.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {badge(s3.badge)}
                {s3.label && <span className="caption">{s3.label}</span>}
              </div>
              <Link href={s3.href} className="tlink mt-4">
                {viewProject} {arrow}
              </Link>
            </InView>
            <Link
              href={s3.href}
              className="card group order-1 col-span-4 md:order-2 md:col-span-5 xl:col-span-7 xl:col-start-6"
            >
              <InView className="wipe" from="right">
                <div className="zoom relative aspect-[3/2] overflow-hidden bg-beton">
                  <Photo img={s3.img} sizes="(min-width:1280px) 56vw, (min-width:768px) 60vw, 100vw" />
                </div>
              </InView>
            </Link>
          </div>
        </div>

        {/* 3 — full-bleed wide + Lento */}
        <Link href={s4.href} className="card group mt-24 block md:mt-32 xl:mt-40">
          <div className="bg-pose px-[var(--pad)] py-5 text-kirec">
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h3 className="d-m">{s4.project.title}</h3>
                {badge(s4.badge)}
                {s4.project.video && badge(c.labels.video)}
              </div>
              <span className="flex items-center gap-3 font-medium">
                {viewProject}{' '}
                <span className="card-arr" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
          <InView className="wipe" from="right">
            <div className="zoom relative aspect-[4/3] overflow-hidden bg-beton md:aspect-[21/9]">
              <Photo img={s4.img} sizes="100vw" />
            </div>
          </InView>
          {s4.label && <p className="caption wrap mt-3">{s4.label}</p>}
        </Link>
      </section>

      {/* ───── ÖNCE / SONRA ───── */}
      {baProject?.beforeAfter && (
        <section className="sec-b bg-kagit" aria-labelledby="ba-h">
          <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
            <div className="col-span-4 md:col-span-8 xl:col-span-4 xl:order-2 xl:pt-4">
              <h2 id="ba-h" className="d-l">
                <RichText value={beforeAfter.heading} />
              </h2>
              <p className="lead mt-6 max-w-[28ch]">{beforeAfter.lead}</p>
              <p className="mt-4 max-w-[40ch] muted">{beforeAfter.hint}</p>
              <Link href={`/projeler/${baProject.slug}`} className="tlink mt-6">
                {beforeAfter.link} {arrow}
              </Link>
            </div>
            <div className="col-span-4 md:col-span-8 xl:order-1 xl:col-span-8">
              <BeforeAfter
                texts={beforeAfterTexts(c)}
                before={resolveImage(c, baProject.beforeAfter.before)}
                after={resolveImage(c, baProject.beforeAfter.after)}
              />
            </div>
          </div>
        </section>
      )}

      {/* ───── MALZEME ───── */}
      <section className="sec-b" aria-labelledby="mal-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <InView className="rise col-span-4 md:col-span-6 xl:col-span-5">
            <h2 id="mal-h" className="d-l">
              <RichText value={materials.heading} />
            </h2>
            <p className="lead mt-6 max-w-[28ch]">{materials.lead}</p>
          </InView>
          {materials.items.map((m, i) => {
            const project = getProjectById(c, m.projectId);
            const caption = [illustrativeLabel(c, m.image), project?.title, project && conceptBadge(c, project)]
              .filter(Boolean)
              .join(' · ');
            return (
              <figure
                key={m.id}
                className={[
                  'col-span-4',
                  i === 0 ? 'md:col-span-4 xl:col-span-4 xl:col-start-1 xl:row-start-2' : '',
                  i === 1
                    ? 'max-md:mr-[12%] md:col-span-4 xl:col-span-4 xl:col-start-6 xl:row-start-2 xl:mt-[12vh]'
                    : '',
                  i === 2
                    ? 'md:col-span-4 md:col-start-3 xl:col-span-3 xl:col-start-10 xl:row-start-2 xl:mt-[4vh]'
                    : '',
                ].join(' ')}
              >
                <InView className="wipe" from={i % 2 ? 'right' : 'left'}>
                  <div className="relative aspect-square overflow-hidden bg-beton">
                    <Photo
                      img={resolveImage(c, m.image)}
                      sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw"
                    />
                  </div>
                </InView>
                <figcaption className="mt-3">
                  <span className="block font-medium">{m.label}</span>
                  <span className="caption">{caption}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      {/* ───── HİZMETLER (kütle) ───── */}
      <section className="sec-k on-dark mass-in-l" aria-labelledby="hiz-h">
        <div className="wrap">
          <InView className="rise">
            <h2 id="hiz-h" className="d-l max-w-[16ch]">
              <RichText value={services.heading} />
            </h2>
          </InView>
          <div className="mt-14 md:mt-20">
            <ServicesBands />
          </div>
          <Link href="/hizmetler" className="btn btn-ghost mt-12 w-full sm:w-auto">
            <span>{services.button}</span>
            {arrow}
          </Link>
        </div>
      </section>

      {/* ───── SÜREÇ ───── */}
      <section className="sec-b bg-siva mass-out-r md:!pb-0" aria-labelledby="sur-h">
        <div className="wrap">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 id="sur-h" className="d-l">
              <RichText value={process.heading} />
            </h2>
            <p className="max-w-[34ch] text-[17px] leading-snug text-golge">{text(c, process.text)}</p>
          </div>
          <InView className="proc mt-14 md:mt-24">
            {c.processSteps.map((s, i) => (
              <div
                key={s.id}
                className="proc-step"
                data-last={i === c.processSteps.length - 1 ? '1' : undefined}
                style={{ '--i': i, '--j': i % 3 } as React.CSSProperties}
              >
                <p className="proc-no" aria-hidden="true">
                  0{i + 1}
                </p>
                <p className="proc-t">{s.title}</p>
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
              <RichText value={studioTeaser.heading} />
            </h2>
            <div className="prose mt-8">
              {studioTeaser.paragraphs.map((p, i) => (
                <p key={i}>{text(c, p)}</p>
              ))}
              {demoTeaser && <p>{demoTeaser}</p>}
            </div>
            <Link href="/studyo" className="tlink mt-8">
              {studioTeaser.link} {arrow}
            </Link>
          </InView>
          <div className="col-span-4 -mb-[calc(var(--step)+clamp(48px,6vw,96px))] md:col-span-4 md:col-start-5 xl:col-span-4 xl:col-start-9">
            {teaserLabel && <p className="caption mb-3">{teaserLabel}</p>}
            <InView className="wipe" from="left">
              <div className="relative aspect-[4/5] overflow-hidden bg-beton">
                <Photo
                  img={resolveImage(c, studioTeaser.image)}
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
