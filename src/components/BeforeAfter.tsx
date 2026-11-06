'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import Photo from './Photo';
import { fill } from '@/lib/text';
import type { Img } from '@/content/types';

export type BeforeAfterTexts = {
  before: string;
  after: string;
  compare: string;
  sliderAria: string;
  valueText: string; // contains {n}
  groupAria: string;
  caption: string;
};

type Props = {
  texts: BeforeAfterTexts;
  before: Img;
  after: Img;
  /* "toggle": use if a pair is visibly misaligned — drag is disabled, only Önce | Sonra. */
  mode?: 'slider' | 'toggle';
  sizes?: string;
};

export default function BeforeAfter({
  texts,
  before,
  after,
  mode = 'slider',
  sizes = '(min-width:1280px) 60vw, 100vw',
}: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const [pos, setPos] = useState(mode === 'toggle' ? 100 : 50);
  const [smooth, setSmooth] = useState(false);

  const set = (v: number, animate = false) => {
    setSmooth(animate);
    setPos(Math.max(0, Math.min(100, v)));
    if (animate) window.setTimeout(() => setSmooth(false), 280);
  };
  const pct = (e: PointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };

  // one-time hint when the module first enters the viewport
  useEffect(() => {
    const el = stage.current;
    if (!el || mode === 'toggle' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          if (touched.current) return;
          const k = Math.min(1, (t - t0) / 1200);
          setPos(50 - 12 * Math.sin(Math.PI * k));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [mode]);

  const down = (e: PointerEvent) => {
    if (mode === 'toggle') return;
    touched.current = true;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    // touch: scrolling vertically must stay possible, so only horizontal moves drive the divider
    if (e.pointerType !== 'touch') set(pct(e), true);
  };
  const move = (e: PointerEvent) => {
    if (dragging.current) set(pct(e));
  };
  const up = () => {
    dragging.current = false;
  };

  const key = (e: KeyboardEvent) => {
    const big = e.shiftKey ? 10 : 5;
    let v: number | null = null;
    if (e.key === 'ArrowLeft') v = pos - big;
    else if (e.key === 'ArrowRight') v = pos + big;
    else if (e.key === 'Home') v = 0;
    else if (e.key === 'End') v = 100;
    if (v === null) return;
    e.preventDefault();
    touched.current = true;
    set(v);
  };

  const state = pos >= 99 ? 'before' : pos <= 1 ? 'after' : 'compare';
  const choose = (s: 'before' | 'compare' | 'after') => {
    touched.current = true;
    set(s === 'before' ? 100 : s === 'after' ? 0 : 50, true);
  };

  return (
    <div className="ba" data-mode={mode}>
      <div
        ref={stage}
        className="ba-stage"
        data-smooth={smooth ? '1' : '0'}
        style={{ '--pos': `${pos}%`, '--op': pos > 50 ? 1 : 0 } as CSSProperties}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <Photo img={after} sizes={sizes} />
        <div className="ba-top">
          <Photo img={before} sizes={sizes} />
        </div>
        <span className="ba-tag l label">{texts.before}</span>
        <span className="ba-tag r label">{texts.after}</span>
        {mode === 'slider' && (
          <div className="ba-bar">
            <div
              className="ba-grip"
              role="slider"
              tabIndex={0}
              aria-label={texts.sliderAria}
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-valuetext={fill(texts.valueText, { n: String(Math.round(pos)) })}
              onKeyDown={key}
            >
              <span aria-hidden>‹ ›</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="seg" role="group" aria-label={texts.groupAria}>
          <button type="button" aria-pressed={state === 'before'} onClick={() => choose('before')}>
            {texts.before}
          </button>
          {mode === 'slider' && (
            <button type="button" aria-pressed={state === 'compare'} onClick={() => choose('compare')}>
              {texts.compare}
            </button>
          )}
          <button type="button" aria-pressed={state === 'after'} onClick={() => choose('after')}>
            {texts.after}
          </button>
        </div>
        <p className="caption">{texts.caption}</p>
      </div>
    </div>
  );
}
