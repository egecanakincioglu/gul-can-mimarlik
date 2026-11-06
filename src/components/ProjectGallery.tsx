'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import InView from './InView';
import Photo from './Photo';
import type { GalleryItem, Slot } from '@/content/projects';

const RATIO: Record<Slot, string> = { wide: '21 / 9', landscape: '3 / 2', portrait: '4 / 5', square: '1 / 1' };
const SPAN: Record<Slot, number> = { wide: 12, landscape: 7, portrait: 5, square: 5 };
const SIZES: Record<Slot, string> = {
  wide: '100vw',
  landscape: '(min-width:1280px) 56vw, 100vw',
  portrait: '(min-width:1280px) 38vw, 88vw',
  square: '(min-width:1280px) 38vw, 88vw',
};
const FIRST: Record<number, string> = { 7: 'xl:col-start-1 xl:col-span-7', 5: 'xl:col-start-1 xl:col-span-5' };
const SECOND: Record<number, string> = { 7: 'xl:col-start-6 xl:col-span-7', 5: 'xl:col-start-8 xl:col-span-5' };
const SINGLE: Record<number, string> = { 7: 'xl:col-start-2 xl:col-span-7', 5: 'xl:col-start-2 xl:col-span-5' };

type Row = { wide: boolean; idx: number[] };

function buildRows(items: GalleryItem[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < items.length) {
    if (items[i].slot === 'wide') {
      rows.push({ wide: true, idx: [i] });
      i += 1;
      continue;
    }
    const idx = [i];
    if (i + 1 < items.length && items[i + 1].slot !== 'wide') idx.push(i + 1);
    rows.push({ wide: false, idx });
    i += idx.length;
  }
  return rows;
}

export default function ProjectGallery({ items, note }: { items: GalleryItem[]; note?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const rows = buildRows(items);

  const show = (i: number, el: HTMLElement) => {
    opener.current = el;
    setOpen(i);
  };
  const step = (d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length));

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('button')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button') ?? []);
        if (!f.length) return;
        const a = document.activeElement;
        if (e.shiftKey && a === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && a === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    const back = opener.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', key);
      back?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open === null]);

  const down = (e: PointerEvent) => {
    swipe.current = e.clientX;
  };
  const up = (e: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  const cell = (i: number, cls: string, extra = '') => {
    const it = items[i];
    return (
      <figure key={i} className={`${cls} ${extra}`}>
        <InView className="wipe" from={i % 2 ? 'right' : 'left'}>
          <button
            type="button"
            className="card zoom relative block w-full cursor-zoom-in overflow-hidden bg-beton"
            style={{ aspectRatio: it.slot === 'wide' ? undefined : RATIO[it.slot] }}
            data-slot={it.slot}
            onClick={(e) => show(i, e.currentTarget)}
            aria-label={`Görseli büyüt: ${it.alt}`}
          >
            {it.slot === 'wide' && <span className="block aspect-video md:aspect-[21/9]" />}
            <Photo img={it} sizes={SIZES[it.slot]} />
          </button>
        </InView>
        <figcaption className="caption mt-3">{it.caption}</figcaption>
      </figure>
    );
  };

  return (
    <>
      <div className="wrap grid grid-cols-4 gap-x-4 gap-y-[clamp(56px,9vw,144px)] md:grid-cols-8 md:gap-x-5 xl:grid-cols-12 xl:gap-x-6">
        {rows.map((r, ri) => {
          const out = r.idx.map((i, k) => {
            const slot = items[i].slot;
            if (r.wide)
              return cell(
                i,
                'col-span-4 md:col-span-8 xl:col-span-12 max-md:-mx-[var(--pad)] max-md:[&_figcaption]:px-[var(--pad)]',
              );
            const span = SPAN[slot];
            if (r.idx.length === 1) return cell(i, `col-span-4 md:col-span-6 md:col-start-2 ${SINGLE[span]}`);
            const mobile = k === 0 ? 'col-span-4' : 'col-span-4 max-md:mr-[12%]';
            const tablet = k === 0 ? 'md:col-span-5' : 'md:col-start-6 md:col-span-3';
            return cell(
              i,
              `${mobile} ${tablet} ${k === 0 ? FIRST[span] : SECOND[span]}`,
              k === 1 ? 'xl:mt-[12vh]' : '',
            );
          });
          return [
            ...out,
            ri === 0 && note ? (
              <p key="note" className="col-span-4 md:col-span-6 md:col-start-2 xl:col-span-5 xl:col-start-3 lead muted">
                {note}
              </p>
            ) : null,
          ];
        })}
      </div>

      {open !== null &&
        createPortal(
          <div
            ref={dialog}
            className="lb on-dark"
            role="dialog"
            aria-modal="true"
            aria-label="Görsel galerisi"
            onPointerDown={down}
            onPointerUp={up}
          >
            <div className="lb-img">
              <Image
                key={open}
                src={items[open].src}
                alt={items[open].alt}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-5 pb-5 md:px-20">
              <p className="caption min-w-0 flex-1">
                {items[open].caption}{' '}
                <span className="ml-3 tabular-nums">
                  {String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
              </p>
              <div className="flex gap-2">
                <button type="button" className="lb-btn" onClick={() => step(-1)} aria-label="Önceki görsel">
                  ←
                </button>
                <button type="button" className="lb-btn" onClick={() => step(1)} aria-label="Sonraki görsel">
                  →
                </button>
              </div>
            </div>
            <button type="button" className="lb-btn label fixed right-4 top-4 !px-5" onClick={() => setOpen(null)}>
              Kapat
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
