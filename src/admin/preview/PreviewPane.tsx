'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/content/types';
import { usePreviewBridge } from './usePreviewBridge';

export const PREVIEW_WIDTHS = [360, 390, 768, 1024, 1440] as const;

/** Scale that fits a viewport of `width` px into `available` px; never enlarges. */
export const fitScale = (width: number, available: number) =>
  available > 0 && available < width ? available / width : 1;

export default function PreviewPane({
  src,
  draft,
  initialWidth = 1024,
}: {
  /** Preview route of the page to show, e.g. `/yonetim/onizleme/studyo`. */
  src: string;
  draft: SiteContent;
  initialWidth?: number;
}) {
  const [width, setWidth] = useState<number>(initialWidth);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  usePreviewBridge(frame, draft);

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

  const scale = fitScale(width, box.w);

  return (
    <div className="adm-preview">
      <div role="group" aria-label="Önizleme genişliği" className="seg adm-preview-widths">
        {PREVIEW_WIDTHS.map((w) => (
          <button key={w} type="button" aria-pressed={w === width} onClick={() => setWidth(w)}>
            {w}
          </button>
        ))}
      </div>
      <div ref={stage} className="adm-preview-stage">
        <iframe
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
