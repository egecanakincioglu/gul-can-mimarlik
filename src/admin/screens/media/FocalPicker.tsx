'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { MediaItem } from '@/content/types';
import type { RatioSpec } from './ratios.ts';
import './media.css';

type Focal = { x: number; y: number };

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Share of the image (in percent) that a crop of `aspect` shows, as the browser crops with object-cover. */
export const cropBox = (media: { width: number; height: number }, aspect: number, focal: Focal) => {
  const imageAspect = media.width / media.height;
  const w = aspect > imageAspect ? 100 : (aspect / imageAspect) * 100;
  const h = aspect > imageAspect ? (imageAspect / aspect) * 100 : 100;
  return { left: ((100 - w) * focal.x) / 100, top: ((100 - h) * focal.y) / 100, width: w, height: h };
};

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export default function FocalPicker({
  media,
  value,
  onChange,
  onCommit,
  ratios = [],
  alt,
}: {
  media: MediaItem;
  value: Focal;
  /** Called with every new point, including while the handle is dragged. */
  onChange: (focal: Focal) => void;
  /** Called once per gesture: after a drag ends, and for every non-drag change (tap, keys, numbers). */
  onCommit?: (focal: Focal) => void;
  /** Ratios the image is used in; the first one draws the crop box, all get a strip preview. */
  ratios?: RatioSpec[];
  alt: string;
}) {
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const last = useRef(value);
  const [typed, setTyped] = useState<{ x?: string; y?: string }>({});
  const box = ratios[0] ? cropBox(media, ratios[0].aspect, value) : null;
  useEffect(() => {
    last.current = value;
  }, [value]);

  const emit = (next: Focal, commit: boolean) => {
    if (next.x === last.current.x && next.y === last.current.y) return;
    last.current = next;
    onChange(next);
    if (commit) onCommit?.(next);
  };

  const fromPointer = (e: { clientX: number; clientY: number }, commit: boolean) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    emit(
      { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) },
      commit,
    );
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    onCommit?.(last.current);
  };

  const onKey = (e: KeyboardEvent) => {
    const arrow = ARROWS[e.key];
    if (!arrow) return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    setTyped({});
    emit({ x: clamp(value.x + arrow[0] * step), y: clamp(value.y + arrow[1] * step) }, true);
  };

  const setAxis = (axis: 'x' | 'y', raw: string) => {
    const n = Number(raw);
    if (raw.trim() === '' || Number.isNaN(n)) {
      setTyped((t) => ({ ...t, [axis]: raw }));
      return;
    }
    const next = clamp(n);
    // Keep what the person typed while it is still a valid value; show the clamped number otherwise.
    setTyped((t) => ({ ...t, [axis]: String(next) === raw ? raw : undefined }));
    emit({ ...value, [axis]: next }, true);
  };

  const shown = (axis: 'x' | 'y') => typed[axis] ?? String(value[axis]);
  const forget = (axis: 'x' | 'y') => setTyped((t) => ({ ...t, [axis]: undefined }));

  return (
    <div className="mf">
      <p className="caption">Görsel kırpıldığında kalması gereken yeri seçin.</p>
      <div
        ref={stage}
        className="mf-stage"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
        onClick={(e) => {
          if ((e.target as Element).closest('.mf-marker')) return;
          fromPointer(e, true);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
        <img src={media.file} alt={alt} draggable={false} decoding="async" />
        {box && (
          <>
            <span className="mf-veil" style={{ left: 0, top: 0, right: 0, height: `${box.top}%` }} />
            <span
              className="mf-veil"
              style={{ left: 0, bottom: 0, right: 0, height: `${100 - box.top - box.height}%` }}
            />
            <span
              className="mf-veil"
              style={{ left: 0, top: `${box.top}%`, height: `${box.height}%`, width: `${box.left}%` }}
            />
            <span
              className="mf-veil"
              style={{
                right: 0,
                top: `${box.top}%`,
                height: `${box.height}%`,
                width: `${100 - box.left - box.width}%`,
              }}
            />
            <span
              className="mf-crop"
              data-testid="crop-box"
              style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
            />
          </>
        )}
        <button
          type="button"
          className="mf-marker"
          aria-label="Odak noktası"
          aria-describedby={`${id}-hint`}
          style={{ left: `${value.x}%`, top: `${value.y}%` }}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            if (!e.isPrimary || e.button !== 0) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragging.current && e.isPrimary) fromPointer(e, false);
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <p id={`${id}-hint`} className="caption">
        Tutamağı sürükleyin, görsele dokunun veya ok tuşlarını kullanın: 1%, Shift ile 10%.
      </p>
      <div className="mf-nums">
        <label className="field adm-field adm-boxed">
          <span className="label adm-field-label">X (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={shown('x')}
            onChange={(e) => setAxis('x', e.target.value)}
            onBlur={() => forget('x')}
          />
        </label>
        <label className="field adm-field adm-boxed">
          <span className="label adm-field-label">Y (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={shown('y')}
            onChange={(e) => setAxis('y', e.target.value)}
            onBlur={() => forget('y')}
          />
        </label>
      </div>
      {ratios.length > 0 && (
        <ul className="mf-strip" aria-label="Kırpma önizlemeleri">
          {ratios.map((r) => (
            <li key={r.id}>
              <span
                className="mf-thumb"
                role="img"
                aria-label={`${r.label} kırpma`}
                style={{
                  aspectRatio: String(r.aspect),
                  backgroundImage: `url("${media.file}")`,
                  backgroundPosition: `${value.x}% ${value.y}%`,
                }}
              />
              <span className="mf-ratio label">{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
