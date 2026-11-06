import Link from 'next/link';
import Photo from '@/components/Photo';
import InView from '@/components/InView';
import BeforeAfter from '@/components/BeforeAfter';
import ProjectGallery from '@/components/ProjectGallery';
import { FooterView } from '@/components/Footer';
import RichText from '@/components/RichText';
import { beforeAfterTexts } from '@/components/shell-texts';
import type { SiteContent } from '@/content/types';
import {
  captionOf,
  conceptBadge,
  conceptLine,
  nextProject,
  projectFacts,
  illustrativeLabel,
  resolveImage,
  scopeLinks,
} from '@/content/select';

/** Null when no project has this slug; drafts count only with includeUnpublished (admin preview). */
export function renderProject(c: SiteContent, slug: string, opts: { includeUnpublished?: boolean } = {}) {
  const p = c.projects.find((x) => x.slug === slug && (x.published || opts.includeUnpublished));
  if (!p) return null;
  const next = nextProject(c, p.id) ?? p;
  const category = c.projectCategories.find((x) => x.id === p.categoryId)?.name;
  const badge = conceptBadge(c, p);
  const concept = conceptLine(c, p);
  const hero = resolveImage(c, p.hero);
  const heroLabel = illustrativeLabel(c, p.hero);
  const [kindFact, ...otherFacts] = projectFacts(c, p);
  const scope = scopeLinks(c, p);
  const nextCover = resolveImage(c, next.cover);
  const pair = p.beforeAfter;
  const gallery = p.gallery.map((g) => ({ ...resolveImage(c, g.image), slot: g.slot, caption: captionOf(c, g) }));
  const galleryTexts = {
    enlarge: c.ui.enlargeImage,
    prev: c.ui.prevImage,
    next: c.ui.nextImage,
    close: c.ui.closeImage,
    dialogAria: c.ui.galleryAria,
  };

  return (
    <>
      {/* Hero + Konsol */}
      <section className="pt-[var(--hdr)]">
        <InView className="wipe" from="left">
          <div className="relative aspect-[4/5] overflow-hidden bg-beton md:aspect-[16/9] xl:aspect-auto xl:h-[min(88svh,calc(100vw*9/21))] xl:min-h-[520px]">
            <Photo img={hero} sizes="100vw" priority quality={85} />
          </div>
        </InView>
        <div className="wrap relative">
          <div className="on-dark bg-pose p-6 text-kirec md:p-10 xl:-mt-[18vh] xl:w-[min(46vw,720px)] xl:p-12">
            <div className="flex flex-wrap items-center gap-3">
              {badge && <span className="badge">{badge}</span>}
              <span className="label muted">{category}</span>
            </div>
            <h1 className="d-l mt-6">{p.title}</h1>
          </div>
          {heroLabel && <p className="caption mt-3 xl:text-right">{heroLabel}</p>}
        </div>
      </section>

      {/* Künye */}
      <section className="sec-b bg-kagit !pb-[clamp(72px,8vw,128px)]">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <dl className="col-span-4 grid content-start gap-6 md:col-span-4 xl:col-span-4">
            <div>
              <dt className="label muted">{kindFact.label}</dt>
              <dd className="mt-2">{kindFact.value}</dd>
            </div>
            {scope.length > 0 && (
              <div>
                <dt className="label muted">{c.ui.scope}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {scope.map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      className="border border-pose px-3 py-2 text-[14px] font-medium hover:bg-pose hover:text-kirec"
                    >
                      {s.name}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            {otherFacts.map((fact) => (
              <div key={fact.id}>
                <dt className="label muted">{fact.label}</dt>
                <dd className="mt-2">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="prose col-span-4 md:col-span-8 xl:col-span-7 xl:col-start-6">
            <p className="lead !max-w-[34ch]">{p.summary}</p>
            <div className="mt-8">
              {p.narrative.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mekân dizisi */}
      <section className="bg-kagit pb-[clamp(96px,12vw,200px)]" aria-label={c.ui.spaceSequence}>
        <ProjectGallery items={gallery} note={p.galleryNote} texts={galleryTexts} />
      </section>

      {/* Konsept kararları + malzeme */}
      <section className="sec-b bg-kirec" aria-labelledby="not-h">
        <div className="wrap grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
          <div className="col-span-4 md:col-span-8 xl:col-span-4">
            <h2 id="not-h" className="d-l">
              <RichText value={p.concept ? c.projectPage.notesHeading : c.projectPage.notesHeadingReal} />
            </h2>
            <p className="label muted mt-8">{c.ui.materials}</p>
            <ul className="mt-4 flex list-none flex-wrap gap-2">
              {p.materials.map((m) => (
                <li key={m} className="border border-pose px-3 py-2 text-[14px] font-medium">
                  {m}
                </li>
              ))}
            </ul>
            {concept && <p className="caption mt-8 max-w-[34ch]">{concept}</p>}
          </div>
          <ol className="col-span-4 list-none border-t border-pose md:col-span-8 xl:col-span-7 xl:col-start-6">
            {p.notes.map((n, i) => (
              <li
                key={i}
                className="grid gap-2 border-b border-pose/30 py-7 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-6 md:py-9"
              >
                <span className="label muted pt-2">0{i + 1}</span>
                <h3 className="d-m">{n.title}</h3>
                <p className="muted max-w-[40ch]">{n.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Önce / Sonra */}
      {pair && (
        <section className="sec-b bg-kagit" aria-labelledby="ba-h">
          <div className="wrap grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
            <div className="col-span-4 md:col-span-8 xl:col-span-4 xl:pt-4">
              <h2 id="ba-h" className="d-l">
                <RichText value={c.projectPage.beforeAfterHeading} />
              </h2>
              <p className="lead mt-6 max-w-[26ch]">{pair.lead}</p>
            </div>
            <div className="col-span-4 md:col-span-8 xl:col-span-8">
              <BeforeAfter
                texts={beforeAfterTexts(c)}
                before={resolveImage(c, pair.before)}
                after={resolveImage(c, pair.after)}
                mode={pair.mode}
              />
            </div>
          </div>
        </section>
      )}

      {/* Video: yalnızca video dosyası tanımlıysa */}
      {p.video && (
        <section className="sec-b bg-kirec">
          <div className="wrap">
            <video
              className="w-full"
              controls
              preload="metadata"
              poster={resolveImage(c, p.video.poster).src}
              src={p.video.file}
            />
            <p className="caption mt-3">{c.labels.illustrative.animation3d}</p>
          </div>
        </section>
      )}

      {/* Sonraki proje */}
      <section className="on-dark">
        <Link href={`/projeler/${next.slug}`} className="card group block bg-pose text-kirec">
          <div className="wrap grid grid-cols-4 items-center gap-x-4 gap-y-8 py-[clamp(64px,8vw,128px)] md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
            <div className="col-span-4 md:col-span-5 xl:col-span-6">
              <p className="label muted">{c.ui.nextProject}</p>
              <p className="d-l mt-5">{next.title}</p>
              <p className="mt-6 flex items-center gap-3 font-medium">
                {c.ui.viewProject}{' '}
                <span className="card-arr" aria-hidden>
                  →
                </span>
              </p>
            </div>
            <div className="zoom relative col-span-4 aspect-[3/2] overflow-hidden bg-beton md:col-span-3 md:col-start-6 xl:col-span-5 xl:col-start-8">
              <Photo img={nextCover} sizes="(min-width:1280px) 40vw, (min-width:768px) 50vw, 100vw" />
            </div>
          </div>
        </Link>
        <div className="wrap bg-pose py-6 text-kirec">
          <Link href="/projeler" className="tlink">
            ← {c.ui.allProjects}
          </Link>
        </div>
      </section>
      <FooterView c={c} cta={c.footer.showCta.project} step="l" />
    </>
  );
}
