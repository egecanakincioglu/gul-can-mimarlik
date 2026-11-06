import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import BeforeAfter from '@/components/BeforeAfter';
import ProjectGallery from '@/components/ProjectGallery';
import Footer from '@/components/Footer';
import { getProject, nextProject, projects } from '@/content/projects';
import { serviceCategories } from '@/content/site';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  return { title: p ? `${p.title} — Konsept Çalışma` : 'Proje' };
}

/* Which services page anchor does a scope label belong to? */
const anchorFor = (scope: string) =>
  serviceCategories.find((c) => c.services.some((s) => s.name === scope))?.slug ?? '';

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const next = nextProject(p.slug);
  const note = p.slug === 'avlulu-konut' ? 'Avlu, evin kütlesine açılmış bir oda: ışık önce oraya giriyor.' : undefined;

  return (
    <>
      {/* Hero + Konsol */}
      <section className="pt-[var(--hdr)]">
        <InView className="wipe" from="left">
          <div className="relative aspect-[4/5] overflow-hidden bg-beton md:aspect-[16/9] xl:aspect-auto xl:h-[min(88svh,calc(100vw*9/21))] xl:min-h-[520px]">
            <Photo img={p.hero} sizes="100vw" priority quality={85} />
          </div>
        </InView>
        <div className="wrap relative">
          <div className="on-dark bg-pose p-6 text-kirec md:p-10 xl:-mt-[18vh] xl:w-[min(46vw,720px)] xl:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge">Konsept Çalışma</span>
              <span className="label muted">{p.category}</span>
            </div>
            <h1 className="d-l mt-6">{p.title}</h1>
          </div>
          <p className="caption mt-3 xl:text-right">İllüstratif görsel</p>
        </div>
      </section>

      {/* Künye */}
      <section className="sec-b bg-kagit !pb-[clamp(72px,8vw,128px)]">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <dl className="col-span-4 grid content-start gap-6 md:col-span-4 xl:col-span-4">
            <div>
              <dt className="label muted">Tür</dt>
              <dd className="mt-2">
                {p.kind} · {p.category}
              </dd>
            </div>
            <div>
              <dt className="label muted">Kapsam</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {p.scope.map((s) => (
                  <Link
                    key={s}
                    href={`/hizmetler#${anchorFor(s)}`}
                    className="border border-pose px-3 py-2 text-[14px] font-medium hover:bg-pose hover:text-kirec"
                  >
                    {s}
                  </Link>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label muted">Durum</dt>
              <dd className="mt-2">Konsept / İllüstratif</dd>
            </div>
            <div>
              <dt className="label muted">Konum</dt>
              <dd className="mt-2">Temsilî</dd>
            </div>
          </dl>
          <div className="prose col-span-4 md:col-span-8 xl:col-span-7 xl:col-start-6">
            <p className="lead !max-w-[34ch]">{p.summary}</p>
            <div className="mt-8">
              {p.narrative.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mekân dizisi */}
      <section className="bg-kagit pb-[clamp(96px,12vw,200px)]" aria-label="Mekân dizisi">
        <ProjectGallery items={p.gallery} note={note} />
      </section>

      {/* Konsept kararları + malzeme */}
      <section className="sec-b bg-kirec" aria-labelledby="not-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <div className="col-span-4 md:col-span-8 xl:col-span-4">
            <h2 id="not-h" className="d-l">
              Konsept <span className="w8">kararları.</span>
            </h2>
            <p className="label muted mt-8">Malzeme paleti</p>
            <ul className="mt-4 flex list-none flex-wrap gap-2">
              {p.materials.map((m) => (
                <li key={m} className="border border-pose px-3 py-2 text-[14px] font-medium">
                  {m}
                </li>
              ))}
            </ul>
            <p className="caption mt-8 max-w-[34ch]">Konsept çalışma; ölçü, yıl, konum ve müşteri bilgisi içermez.</p>
          </div>
          <ol className="col-span-4 list-none border-t border-pose md:col-span-8 xl:col-span-7 xl:col-start-6">
            {p.notes.map((n, i) => (
              <li
                key={n.t}
                className="grid gap-2 border-b border-pose/30 py-7 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-6 md:py-9"
              >
                <span className="label muted pt-2">0{i + 1}</span>
                <h3 className="d-m">{n.t}</h3>
                <p className="muted max-w-[40ch]">{n.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Önce / Sonra */}
      {p.beforeAfter && (
        <section className="sec-b bg-kagit" aria-labelledby="ba-h">
          <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
            <div className="col-span-4 md:col-span-8 xl:col-span-4 xl:pt-4">
              <h2 id="ba-h" className="d-l">
                Önce <span className="w3">/</span> <span className="w8">Sonra</span>
              </h2>
              <p className="lead mt-6 max-w-[26ch]">Pencere, kiriş ve kolon aynı kalıyor; yüzeyler değişiyor.</p>
            </div>
            <div className="col-span-4 md:col-span-8 xl:col-span-8">
              <BeforeAfter before={p.beforeAfter.before} after={p.beforeAfter.after} />
            </div>
          </div>
        </section>
      )}

      {/* Video: yalnızca video dosyası tanımlıysa */}
      {p.video && (
        <section className="sec-b bg-kirec">
          <div className="wrap">
            <video className="w-full" controls preload="metadata" poster={p.video.poster.src} src={p.video.src} />
            <p className="caption mt-3">İllüstratif 3D animasyon.</p>
          </div>
        </section>
      )}

      {/* Sonraki proje */}
      <section className="on-dark">
        <Link href={`/projeler/${next.slug}`} className="card group block bg-pose text-kirec">
          <div className="wrap grid grid-cols-4 items-center gap-x-4 gap-y-8 py-[clamp(64px,8vw,128px)] md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
            <div className="col-span-4 md:col-span-5 xl:col-span-6">
              <p className="label muted">Sonraki proje</p>
              <p className="d-l mt-5">{next.title}</p>
              <p className="mt-6 flex items-center gap-3 font-medium">
                Projeyi incele{' '}
                <span className="card-arr" aria-hidden>
                  →
                </span>
              </p>
            </div>
            <div className="zoom relative col-span-4 aspect-[3/2] overflow-hidden bg-beton md:col-span-3 md:col-start-6 xl:col-span-5 xl:col-start-8">
              <Photo img={next.cover} sizes="(min-width:1280px) 40vw, (min-width:768px) 50vw, 100vw" />
            </div>
          </div>
        </Link>
        <div className="wrap bg-pose py-6 text-kirec">
          <Link href="/projeler" className="tlink">
            ← Tüm projeler
          </Link>
        </div>
      </section>
      <Footer cta={false} step="l" />
    </>
  );
}
