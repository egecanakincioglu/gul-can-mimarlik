'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import InView from './InView';
import Photo from './Photo';
import { filters, matchesFilter, projects } from '@/content/projects';
import type { Filter } from '@/content/projects';

const slug = (f: Filter) =>
  f
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/\s+/g, '-');

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

export default function ProjectArchive() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
  const k = new URLSearchParams(search).get('kategori');
  const f = filters.find((x) => slug(x) === k) ?? 'Tümü';

  const choose = (x: Filter) => {
    const url = new URL(window.location.href);
    if (x === 'Tümü') url.searchParams.delete('kategori');
    else url.searchParams.set('kategori', slug(x));
    window.history.replaceState(null, '', url);
    listeners.forEach((notify) => notify());
  };

  const list = projects.filter((p) => matchesFilter(p, f));

  return (
    <>
      <div className="sticky top-[var(--hdr)] z-30 border-b border-golge bg-kirec">
        <div className="wrap flex items-center gap-4 py-2">
          <div className="chips md:flex-wrap" role="group" aria-label="Kategori filtresi">
            {filters.map((x) => (
              <button key={x} type="button" className="chip" aria-pressed={f === x} onClick={() => choose(x)}>
                {x === 'Tümü' ? `Tümü (${projects.length})` : x}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap sec-b !pt-[clamp(56px,7vw,112px)]">
        <p className="sr-only" aria-live="polite">
          {list.length} proje gösteriliyor
        </p>
        <div
          key={f}
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
                      <p className="label muted mt-3">
                        {p.category} · {p.scope[0]}
                      </p>
                    </div>
                    <span className="card-arr d-m" aria-hidden>
                      →
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="badge">Konsept Çalışma</span>
                    <span className="caption">İllüstratif görsel</span>
                    <span className="card-more label ml-auto hidden md:inline">Projeyi incele</span>
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
