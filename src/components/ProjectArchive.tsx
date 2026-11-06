'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import InView from './InView';
import Photo from './Photo';
import { fill } from '@/lib/text';
import type { Img } from '@/content/types';

export type ArchiveChip = { id: string; slug: string; label: string; count: number | null };
export type ArchiveProject = {
  slug: string;
  title: string;
  cover: Img;
  meta: string;
  badge: string | null;
  caption: string | null;
  filterIds: string[];
};
export type ArchiveTexts = { filterAria: string; shown: string; viewProject: string };

/* Repeating asymmetric pattern. Works for 4 projects and for 20+. */
const PATTERN = [
  {
    wrap: 'md:col-span-5 xl:col-span-8',
    ratio: '3 / 2',
    from: 'left' as const,
    sizes: '(min-width:1280px) 62vw, (min-width:768px) 60vw, 100vw',
    mt: '',
  },
  {
    wrap: 'md:col-span-3 xl:col-span-4',
    ratio: '4 / 5',
    from: 'right' as const,
    sizes: '(min-width:1280px) 31vw, (min-width:768px) 36vw, 88vw',
    mt: 'xl:mt-[10vh] max-md:mr-[12%]',
  },
  {
    wrap: 'md:col-span-3 xl:col-start-2 xl:col-span-5',
    ratio: '4 / 5',
    from: 'left' as const,
    sizes: '(min-width:1280px) 40vw, (min-width:768px) 36vw, 88vw',
    mt: 'max-md:ml-[12%]',
  },
  {
    wrap: 'md:col-span-5 xl:col-span-6',
    ratio: '3 / 2',
    from: 'right' as const,
    sizes: '(min-width:1280px) 48vw, (min-width:768px) 60vw, 100vw',
    mt: 'xl:self-end',
  },
  {
    wrap: 'md:col-span-8 xl:col-span-12',
    ratio: '21 / 9',
    from: 'left' as const,
    sizes: '100vw',
    mt: '-mx-[var(--pad)]',
  },
];

// The chosen filter lives in the address (?kategori=...). history.replaceState fires no event, so choose() notifies.
const listeners = new Set<() => void>();
const subscribe = (notify: () => void) => {
  listeners.add(notify);
  window.addEventListener('popstate', notify);
  return () => {
    listeners.delete(notify);
    window.removeEventListener('popstate', notify);
  };
};

type Props = { chips: ArchiveChip[]; projects: ArchiveProject[]; texts: ArchiveTexts };

export default function ProjectArchive({ chips, projects, texts }: Props) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
  const k = new URLSearchParams(search).get('kategori');
  const f = chips.find((x) => x.slug === k) ?? chips[0];

  const choose = (x: ArchiveChip) => {
    const url = new URL(window.location.href);
    if (x === chips[0]) url.searchParams.delete('kategori');
    else url.searchParams.set('kategori', x.slug);
    window.history.replaceState(null, '', url);
    listeners.forEach((notify) => notify());
  };

  const list = projects.filter((p) => p.filterIds.includes(f.id));

  return (
    <>
      <div className="sticky top-[var(--hdr)] z-30 border-b border-golge bg-kirec">
        <div className="wrap flex items-center gap-4 py-2">
          <div className="chips md:flex-wrap" role="group" aria-label={texts.filterAria}>
            {chips.map((x) => (
              <button key={x.id} type="button" className="chip" aria-pressed={f === x} onClick={() => choose(x)}>
                {x.count === null ? x.label : `${x.label} (${x.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap sec-b !pt-[clamp(56px,7vw,112px)]">
        <p className="sr-only" aria-live="polite">
          {fill(texts.shown, { n: String(list.length) })}
        </p>
        <div
          key={f.id}
          className="fade-swap grid grid-cols-1 gap-x-4 gap-y-[clamp(56px,8vw,128px)] md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6"
        >
          {list.map((p, i) => {
            const s = PATTERN[i % PATTERN.length];
            return (
              <article key={p.slug} className={`${s.wrap} ${s.mt} flex flex-col`}>
                <Link href={`/projeler/${p.slug}`} className="card group block">
                  <InView className="wipe" from={s.from}>
                    <div className="zoom relative overflow-hidden bg-beton" style={{ aspectRatio: s.ratio }}>
                      <Photo img={p.cover} sizes={s.sizes} />
                    </div>
                  </InView>
                  <div className="mt-5 flex items-start justify-between gap-4 xl:px-0">
                    <div>
                      <h2 className="d-m">{p.title}</h2>
                      <p className="label muted mt-3">{p.meta}</p>
                    </div>
                    <span className="card-arr d-m" aria-hidden>
                      →
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {p.badge && <span className="badge">{p.badge}</span>}
                    {p.caption && <span className="caption">{p.caption}</span>}
                    <span className="card-more label ml-auto hidden md:inline">{texts.viewProject}</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
