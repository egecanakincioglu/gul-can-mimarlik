'use client';

import { useId } from 'react';
import { keyed } from './model';
import Button from '../../ui/Button';
import ImagePicker from '../media/ImagePicker';
import { RATIOS } from '../media/ratios';
import { LongField, SelectField, TextField } from '../pages/common';
import KeyedList from './KeyedList';
import type { GallerySlot } from '@/content/types';
import type { TabProps } from './tab-props';

const SLOTS: GallerySlot[] = ['wide', 'landscape', 'portrait', 'square'];

export default function GalleryTab({ w, set, draft, errors }: TabProps) {
  const fileId = useId();
  const { media, labels } = draft;

  const addVideo = (file: File | undefined) => {
    if (!file) return;
    const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : file.name;
    set({ video: { file: url, poster: w.video?.poster ?? null } });
  };

  return (
    <div className="pg-section-body">
      <ImagePicker
        label="Kapak görseli"
        slot={RATIOS.landscape}
        media={media}
        value={w.cover}
        removable={false}
        onChange={(cover) => cover && set({ cover })}
      />
      <ImagePicker
        label="Ana görsel"
        slot={RATIOS.wide}
        otherRatios={[RATIOS.portrait]}
        media={media}
        value={w.hero}
        removable={false}
        onChange={(hero) => hero && set({ hero })}
      />

      <KeyedList
        title="Galeri"
        noun="Görsel"
        items={w.gallery}
        onChange={(gallery) => set({ gallery })}
        addSlot={
          <ImagePicker
            label="Galeriye görsel ekle"
            slot={RATIOS.landscape}
            media={media}
            value={null}
            onChange={(image) => image && set({ gallery: [...w.gallery, keyed({ image, slot: 'landscape' })] })}
          />
        }
        renderRow={(item, i, setItem) => {
          const key = w.gallery[i]?.key ?? '';
          return (
            <>
              <ImagePicker
                label={`Galeri görseli ${i + 1}`}
                slot={RATIOS[item.slot]}
                media={media}
                value={item.image}
                removable={false}
                onChange={(image) => image && setItem({ ...item, image })}
              />
              <SelectField
                label={`Alan ${i + 1}`}
                value={item.slot}
                options={SLOTS.map((s) => ({ value: s, label: `${RATIOS[s].name} (${RATIOS[s].label})` }))}
                onChange={(slot) => setItem({ ...item, slot: slot as GallerySlot })}
                warning={errors.gallery[key]}
              />
              <TextField
                label={`Alt metni, bu kullanım ${i + 1}`}
                value={item.image.alt ?? ''}
                max={140}
                helper="Boş bırakılırsa görselin varsayılan alt metni kullanılır."
                onChange={(alt) => {
                  const { media: id, focal } = item.image;
                  setItem({ ...item, image: { media: id, ...(focal ? { focal } : {}), ...(alt ? { alt } : {}) } });
                }}
              />
              <TextField
                label={`Açıklama yazısı ${i + 1}`}
                value={item.caption ?? ''}
                onChange={(caption) => {
                  setItem({ image: item.image, slot: item.slot, ...(caption ? { caption } : {}) });
                }}
              />
            </>
          );
        }}
      />
      <LongField label="Galeri notu" value={w.galleryNote} rows={2} onChange={(galleryNote) => set({ galleryNote })} />

      <div className="pj-video">
        <h3 className="label">Video (isteğe bağlı)</h3>
        <p className="caption">
          Video eklenirse projede &ldquo;{labels.video}&rdquo; rozeti kendiliğinden görünür; ayrı bir ayar yoktur.
        </p>
        <div className="field adm-field adm-boxed">
          <label htmlFor={fileId} className="label adm-field-label">
            Video dosyası
          </label>
          <input id={fileId} type="file" accept="video/*" onChange={(e) => addVideo(e.target.files?.[0])} />
        </div>
        {w.video && (
          <>
            <p className="caption">Seçili video: {w.video.file.split('/').pop()}</p>
            <ImagePicker
              label="Video kapağı"
              slot={RATIOS.video}
              media={media}
              value={w.video.poster}
              removable={false}
              onChange={(poster) => poster && set({ video: { file: w.video?.file ?? '', poster } })}
            />
            {errors.video && <p className="err">{errors.video}</p>}
            <Button variant="destructive" onClick={() => set({ video: null })}>
              Videoyu kaldır
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
