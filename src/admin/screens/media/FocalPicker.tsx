'use client';

import { useId, useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
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
  ratios = [],
  alt,
}: {
  media: MediaItem;
  value: Focal;
  onChange: (focal: Focal) => void;
  /** Ratios the image is used in; the first one draws the crop box, all get a strip preview. */
  ratios?: RatioSpec[];
  alt: string;
}) {
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const box = ratios[0] ? cropBox(media, ratios[0].aspect, value) : null;

  const fromPointer = (e: PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    onChange({ x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) });
  };

  const onKey = (e: KeyboardEvent) => {
    const arrow = ARROWS[e.key];
    if (!arrow) return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    onChange({ x: clamp(value.x + arrow[0] * step), y: clamp(value.y + arrow[1] * step) });
  };

  const setAxis = (axis: 'x' | 'y', raw: string) => {
    if (raw.trim() === '' || Number.isNaN(Number(raw))) return;
    onChange({ ...value, [axis]: clamp(Number(raw)) });
  };

  return (
    <div className="mf">
      <div
        ref={stage}
        className="mf-stage"
        style={{ aspectRatio: `${media.width} / ${media.height}` }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) fromPointer(e);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
        <img src={media.file} alt={alt} draggable={false} />
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
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <p id={`${id}-hint`} className="caption">
        Sürükleyin veya ok tuşlarını kullanın: 1%, Shift ile 10%.
      </p>
      <div className="mf-nums">
        <label className="field adm-field adm-boxed">
          <span className="label adm-field-label">X (%)</span>
          <input type="number" min={0} max={100} value={value.x} onChange={(e) => setAxis('x', e.target.value)} />
        </label>
        <label className="field adm-field adm-boxed">
          <span className="label adm-field-label">Y (%)</span>
          <input type="number" min={0} max={100} value={value.y} onChange={(e) => setAxis('y', e.target.value)} />
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
