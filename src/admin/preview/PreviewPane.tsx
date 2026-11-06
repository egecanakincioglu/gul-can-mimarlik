'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/content/types';
import { usePreviewBridge } from './usePreviewBridge';

export const PREVIEW_WIDTHS = [360, 390, 768, 1024, 1440] as const;

/** Scale that fits a viewport of `width` px into `available` px; never enlarges. */
export const fitScale = (width: number, available: number) =>
  available > 0 && available < width ? available / width : 1;

const WIDTH_KEY = 'gcm-admin:preview-width';

const isPreset = (n: number) => (PREVIEW_WIDTHS as readonly number[]).includes(n);

const storedWidth = (): number | null => {
  try {
    const n = Number(window.sessionStorage.getItem(WIDTH_KEY));
    return isPreset(n) ? n : null;
  } catch {
    return null;
  }
};

/** Phone width in a narrow window, otherwise a desktop width that is scaled to fit the stage. */
export const defaultWidth = (viewport: number): number => (viewport < 768 ? 360 : 1024);

export default function PreviewPane({
  src,
  draft,
}: {
  /** Preview route of the page to show, e.g. `/yonetim/onizleme/studyo`. */
  src: string;
  draft: SiteContent;
}) {
  const [chosen, setChosen] = useState<number | null>(storedWidth);
  const [reloads, setReloads] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const { ready, reset } = usePreviewBridge(frame, draft);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = (w: number, h: number) => setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
    measure(el.clientWidth, el.clientHeight);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) measure(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = chosen ?? defaultWidth(typeof window === 'undefined' ? 0 : window.innerWidth);
  const scale = fitScale(width, box.w);
  const choose = (w: number) => {
    setChosen(w);
    try {
      window.sessionStorage.setItem(WIDTH_KEY, String(w));
    } catch {
      // Remembering the width is a convenience only.
    }
  };
  const reload = () => {
    reset();
    setReloads((n) => n + 1);
  };

  return (
    <div className="adm-preview">
      <div role="group" aria-label="Önizleme genişliği" className="seg adm-preview-widths">
        {PREVIEW_WIDTHS.map((w) => (
          <button key={w} type="button" aria-pressed={w === width} onClick={() => choose(w)}>
            {w} px
          </button>
        ))}
        <button type="button" onClick={reload}>
          Önizlemeyi yenile
        </button>
      </div>
      <div ref={stage} className="adm-preview-stage">
        {!ready && (
          <p role="status" className="adm-preview-loading">
            Önizleme yükleniyor…
          </p>
        )}
        <iframe
          key={reloads}
          ref={frame}
          title="Site önizlemesi"
          src={src}
          data-scale={scale}
          style={{
            width,
            height: box.h > 0 ? box.h / scale : '100%',
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}
