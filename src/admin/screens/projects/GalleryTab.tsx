'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { keyed } from './model';
import type { Working } from './model';
import Button from '../../ui/Button';
import ImagePicker from '../media/ImagePicker';
import { RATIOS } from '../media/ratios';
import SelectField from '../../ui/SelectField';
import { LongField, TextField } from '../pages/common';
import KeyedList from './KeyedList';
import type { GallerySlot } from '@/content/types';
import type { TabProps } from './tab-props';

const SLOTS: GallerySlot[] = ['wide', 'landscape', 'portrait', 'square'];

const revoke = (file: string | undefined) => {
  if (file?.startsWith('blob:') && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(file);
};

export default function GalleryTab({ w, set, draft, errors }: TabProps) {
  const fileId = useId();
  const { media, labels } = draft;
  const [videoError, setVideoError] = useState('');
  const [removedVideo, setRemovedVideo] = useState<Working['video']>(null);
  // Mirrors `removedVideo` so the unmount cleanup sees the latest value.
  const pending = useRef<Working['video']>(null);
  useEffect(() => {
    pending.current = removedVideo;
  }, [removedVideo]);

  // Once the tab is left, a removed video can no longer be restored, so its object URL is released.
  useEffect(() => () => revoke(pending.current?.file), []);

  const addVideo = (file: File | undefined) => {
    if (!file) return;
    if (typeof URL.createObjectURL !== 'function') {
      setVideoError('Bu tarayıcı video dosyasını açamıyor. Başka bir tarayıcı deneyin.');
      return;
    }
    setVideoError('');
    revoke(w.video?.file);
    revoke(removedVideo?.file);
    setRemovedVideo(null);
    set({ video: { file: URL.createObjectURL(file), poster: w.video?.poster ?? null } });
  };

  const removeVideo = () => {
    revoke(removedVideo?.file);
    setRemovedVideo(w.video);
    set({ video: null });
  };

  const restoreVideo = () => {
    set({ video: removedVideo });
    setRemovedVideo(null);
  };

  return (
    <div className="pj-body">
      <div data-pj-field="cover">
        <ImagePicker
          label="Kapak görseli"
          slot={RATIOS.landscape}
          media={media}
          value={w.cover}
          removable={false}
          onChange={(cover) => cover && set({ cover })}
        />
      </div>
      <div data-pj-field="hero">
        <ImagePicker
          label="Ana görsel"
          slot={RATIOS.wide}
          otherRatios={[RATIOS.portrait]}
          media={media}
          value={w.hero}
          removable={false}
          onChange={(hero) => hero && set({ hero })}
        />
      </div>

      <KeyedList
        title="Galeri"
        noun="Görsel"
        accusative="görseli"
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
                label={`Görsel açıklaması, bu kullanım ${i + 1}`}
                value={item.image.alt ?? ''}
                max={140}
                helper="Boş bırakılırsa görselin kendi açıklaması kullanılır."
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

      <div className="pj-video" data-pj-field="video">
        <h2 className="label pj-sub">Video (isteğe bağlı)</h2>
        <p className="caption">
          Video eklenirse projede &ldquo;{labels.video}&rdquo; rozeti kendiliğinden görünür; ayrı bir ayar yoktur.
        </p>
        <div className="field adm-field adm-boxed">
          <label htmlFor={fileId} className="label adm-field-label">
            Video dosyası
          </label>
          <input id={fileId} type="file" accept="video/*" onChange={(e) => addVideo(e.target.files?.[0])} />
        </div>
        {videoError && (
          <p className="err" role="alert">
            {videoError}
          </p>
        )}
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
            <Button variant="destructive" onClick={removeVideo}>
              Videoyu kaldır
            </Button>
          </>
        )}
        <div role="status" className="pj-undo">
          {removedVideo && !w.video && (
            <>
              <span>Kaldırıldı.</span>
              <button type="button" className="adm-btn" onClick={restoreVideo}>
                Geri al
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
