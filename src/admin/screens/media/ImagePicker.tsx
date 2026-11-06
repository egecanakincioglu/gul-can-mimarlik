'use client';

import { useId, useRef, useState } from 'react';
import type { ImageRef, MediaItem } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import Field from '../../ui/Field';
import FocalPicker from './FocalPicker.tsx';
import { fileName, unfitReason } from './ratios.ts';
import type { RatioSpec } from './ratios.ts';
import { createMediaItem } from './upload.ts';
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
  const [names, setNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const { updateDraft } = useAdminStore();
  const fileInput = useRef<HTMLInputElement>(null);

  const nameOf = (m: MediaItem) => names[m.id] ?? fileName(m.file);
  const current = value ? media.find((m) => m.id === value.media) : undefined;
  const picked = draft ? media.find((m) => m.id === draft.media) : undefined;

  const openDialog = () => {
    setDraft(value);
    setFocalOpen(false);
    setStatus('');
    setProblem(null);
    setOpen(true);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setStatus('');
    setProblem(null);
    if (!file.type.startsWith('image/')) {
      setProblem(`${file.name} bir görsel dosyası değil.`);
      return;
    }
    try {
      const item = await createMediaItem(file, 0);
      updateDraft((c) => ({ ...c, media: [...c.media, item] }));
      setNames((n) => ({ ...n, [item.id]: file.name }));
      const reason = unfitReason(item, slot);
      if (reason) {
        setProblem(`${file.name} kütüphaneye eklendi ama seçilemedi. ${reason}`);
        return;
      }
      setDraft({ media: item.id });
      setStatus('Yüklendi ve seçildi. Görsel açıklamasını medya kütüphanesinde yazın.');
    } catch {
      setProblem(`${file.name} okunamadı.`);
    }
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
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}-state`}
        onClick={openDialog}
      >
        <span className="mp-frame" style={{ aspectRatio: String(slot.aspect) }}>
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer
            <img
              src={current.file}
              alt=""
              loading="lazy"
              decoding="async"
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
        <span id={`${id}-state`} className="mp-state caption">
          {current ? nameOf(current) : 'Görsel seçilmedi'}
        </span>
      </button>

      <Dialog open={open} onClose={close} title={`${label}: görsel seç`}>
        <div className="mp-dialog">
          <p className="caption">Bu alan {slot.label} ister. Oranı uymayan görseller soluk gösterilir ve seçilemez.</p>
          <div className="mp-upload">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Görsel dosyası"
              tabIndex={-1}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button onClick={() => fileInput.current?.click()}>Yeni görsel yükle</Button>
            <p role="status" className="caption">
              {status}
            </p>
            {problem && (
              <p role="alert" className="err">
                {problem}
              </p>
            )}
          </div>
          <ul className="adm-reset-list mp-grid" aria-label="Medya">
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
                    aria-label={nameOf(m)}
                    aria-describedby={reason ? `${id}-${m.id}-reason` : undefined}
                    onClick={() => choose(m)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
                    <img src={m.file} alt="" loading="lazy" decoding="async" />
                  </button>
                  <span className="caption mp-name">{nameOf(m)}</span>
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

          {picked && draft && focalOpen && (
            <FocalPicker
              media={picked}
              value={draft.focal ?? picked.focal}
              onChange={(focal) => patch({ focal })}
              ratios={[slot, ...otherRatios]}
              alt=""
            />
          )}

          <div className="mp-footer">
            {picked && draft && (
              <div className="mp-use">
                <Field
                  boxed
                  label="Bu sayfada farklı açıklama (isteğe bağlı)"
                  value={draft.alt ?? ''}
                  max={140}
                  helper={`Boş bırakırsanız görselin açıklaması kullanılır: ${picked.alt || 'yok'}`}
                  onChange={(v) => patch({ alt: v === '' ? undefined : v })}
                />
                <p className="caption">
                  İllüstratif görsel: {picked.illustrative ? 'evet (medya kütüphanesinde işaretli)' : 'hayır'}
                </p>
                <Button onClick={() => setFocalOpen((o) => !o)} aria-expanded={focalOpen}>
                  Odak noktası
                </Button>
              </div>
            )}
            {!draft && (
              <p id={`${id}-need`} className="caption">
                Önce bir görsel seçin
              </p>
            )}
            <div className="adm-dialog-actions">
              <Button
                variant="primary"
                disabled={!draft}
                aria-describedby={draft ? undefined : `${id}-need`}
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
          </div>
        </div>
      </Dialog>
    </div>
  );
}
