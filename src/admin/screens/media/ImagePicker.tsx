'use client';

import { useId, useState } from 'react';
import type { ImageRef, MediaItem } from '@/content/types';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import Field from '../../ui/Field';
import FocalPicker from './FocalPicker.tsx';
import { fileName, unfitReason } from './ratios.ts';
import type { RatioSpec } from './ratios.ts';
import './media.css';

type Props = {
  label: string;
  value: ImageRef | null;
  media: MediaItem[];
  /** The ratio this slot is displayed in. */
  slot: RatioSpec;
  onChange: (next: ImageRef | null) => void;
  /** Extra ratios the image appears in; shown in the focal point previews. */
  otherRatios?: RatioSpec[];
  /** Hide "remove" for slots that must keep an image. */
  removable?: boolean;
};

export default function ImagePicker({
  label,
  value,
  media,
  slot,
  onChange,
  otherRatios = [],
  removable = true,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ImageRef | null>(value);
  const [focalOpen, setFocalOpen] = useState(false);

  const current = value ? media.find((m) => m.id === value.media) : undefined;
  const picked = draft ? media.find((m) => m.id === draft.media) : undefined;

  const openDialog = () => {
    setDraft(value);
    setFocalOpen(false);
    setOpen(true);
  };

  const choose = (m: MediaItem) => {
    if (unfitReason(m, slot)) return;
    if (draft?.media !== m.id) setDraft({ media: m.id });
  };

  const patch = (next: Partial<ImageRef>) => {
    if (!draft) return;
    const merged = { ...draft, ...next };
    if (merged.alt === undefined) delete merged.alt;
    setDraft(merged);
  };

  const close = () => setOpen(false);

  return (
    <div className="mp">
      <p className="label" id={`${id}-label`}>
        {label}
      </p>
      <button
        type="button"
        className="mp-trigger"
        data-narrow={slot.aspect <= 1 || undefined}
        aria-labelledby={`${id}-label`}
        onClick={openDialog}
      >
        <span className="mp-frame" style={{ aspectRatio: String(slot.aspect) }}>
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
            <img
              src={current.file}
              alt=""
              style={{
                objectPosition: `${value?.focal?.x ?? current.focal.x}% ${value?.focal?.y ?? current.focal.y}%`,
              }}
            />
          ) : (
            <span className="mp-empty">Görsel seçin</span>
          )}
        </span>
        <span className="mp-strip label">
          {slot.label} · {slot.name}
        </span>
      </button>

      <Dialog open={open} onClose={close} title={`${label}: görsel seç`}>
        <p className="caption">Bu alan {slot.label} ister. Oranı uymayan görseller soluk gösterilir ve seçilemez.</p>
        <ul className="mp-grid" aria-label="Medya">
          {media.map((m) => {
            const reason = unfitReason(m, slot);
            const selected = draft?.media === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className="mp-item"
                  data-selected={selected || undefined}
                  data-unfit={reason ? true : undefined}
                  aria-disabled={reason ? true : undefined}
                  aria-pressed={selected}
                  aria-label={fileName(m.file)}
                  aria-describedby={reason ? `${id}-${m.id}-reason` : undefined}
                  onClick={() => choose(m)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
                  <img src={m.file} alt="" />
                </button>
                <span className="caption">{fileName(m.file)}</span>
                {selected && <span className="mp-chosen label">Seçili</span>}
                {reason && (
                  <span id={`${id}-${m.id}-reason`} className="caption">
                    {reason}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {picked && draft && (
          <div className="mp-use">
            <Field
              boxed
              label="Bu kullanım için alt metni"
              value={draft.alt ?? ''}
              max={140}
              helper={`Boş bırakırsanız görselin varsayılan alt metni kullanılır: ${picked.alt || 'yok'}`}
              onChange={(v) => patch({ alt: v === '' ? undefined : v })}
            />
            <p className="caption">
              İllüstratif görsel: {picked.illustrative ? 'evet (medya kütüphanesinde işaretli)' : 'hayır'}
            </p>
            <Button onClick={() => setFocalOpen((o) => !o)} aria-expanded={focalOpen}>
              Odak noktası
            </Button>
            {focalOpen && (
              <FocalPicker
                media={picked}
                value={draft.focal ?? picked.focal}
                onChange={(focal) => patch({ focal })}
                ratios={[slot, ...otherRatios]}
                alt=""
              />
            )}
          </div>
        )}

        <div className="adm-dialog-actions">
          <Button
            variant="primary"
            disabled={!draft}
            onClick={() => {
              onChange(draft);
              close();
            }}
          >
            Seç
          </Button>
          {value && removable && (
            <Button
              onClick={() => {
                onChange(null);
                close();
              }}
            >
              Görseli kaldır
            </Button>
          )}
          <Button onClick={close}>Vazgeç</Button>
        </div>
      </Dialog>
    </div>
  );
}
