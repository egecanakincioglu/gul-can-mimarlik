'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { mediaUsage } from '@/content/select';
import type { MediaItem } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import EmptyState from '../../ui/EmptyState';
import Field from '../../ui/Field';
import Toggle from '../../ui/Toggle';
import FocalPicker from './FocalPicker.tsx';
import { fileName } from './ratios.ts';
import { describeUsage } from './usage.ts';
import './media.css';

type Meta = { name: string; size: number };
type View = 'grid' | 'list';

const ALT_MAX = 140;

const formatSize = (bytes: number | undefined) => {
  if (bytes === undefined) return 'Bilinmiyor';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const slugify = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gorsel';

const readDimensions = (url: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('unreadable'));
    img.src = url;
  });

function MediaDetail({
  item,
  meta,
  onPatch,
  onDelete,
}: {
  item: MediaItem;
  meta: Meta | undefined;
  onPatch: (patch: Partial<MediaItem>) => void;
  onDelete: () => void;
}) {
  const { draft } = useAdminStore();
  const [confirming, setConfirming] = useState(false);
  const decorative = item.decorative === true;
  const usage = mediaUsage(draft, item.id);
  const used = usage.length > 0;
  const altError = decorative
    ? undefined
    : !item.alt.trim()
      ? 'Alt metni zorunlu. Görsel yalnız süs ise Dekoratif seçin.'
      : item.alt.length > ALT_MAX
        ? `Alt metni en çok ${ALT_MAX} karakter olabilir.`
        : undefined;
  const name = meta?.name ?? fileName(item.file);

  return (
    <aside className="ml-detail" aria-label="Medya ayrıntıları">
      <h2 className="adm-dialog-title">{name}</h2>
      <dl className="ml-facts">
        <dt className="label">Ad</dt>
        <dd>{name}</dd>
        <dt className="label">Boyut</dt>
        <dd>{formatSize(meta?.size)}</dd>
        <dt className="label">Ölçü</dt>
        <dd>
          {item.width}×{item.height} px
        </dd>
      </dl>

      <Field
        boxed
        multiline
        rows={3}
        label="Varsayılan alt metni"
        value={item.alt}
        max={ALT_MAX}
        error={altError}
        helper={decorative ? 'Dekoratif görsel ekran okuyucuya bildirilmez.' : undefined}
        onChange={(alt) => !decorative && onPatch({ alt })}
      />
      <Toggle
        label="Dekoratif"
        checked={decorative}
        onChange={(on) => onPatch(on ? { decorative: true, alt: '' } : { decorative: undefined })}
      />

      <h3 className="label ml-sub">Odak noktası</h3>
      <FocalPicker media={item} value={item.focal} onChange={(focal) => onPatch({ focal })} alt="" />

      <h3 className="label ml-sub">Kullanıldığı yerler</h3>
      {used ? (
        <ul className="ml-usage">
          {usage.map((path) => {
            const u = describeUsage(draft, path);
            return (
              <li key={path}>
                <Link href={u.href} className="tlink">
                  {u.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="caption">Bu görsel hiçbir yerde kullanılmıyor.</p>
      )}

      <div className="ml-delete">
        <Button variant="destructive" disabled={used} onClick={() => setConfirming(true)}>
          Sil
        </Button>
        {used && (
          <p className="caption" role="note">
            {usage.length} yerde kullanıldığı için silinemez. Önce kullanımları değiştirin.
          </p>
        )}
      </div>
      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Görsel silinsin mi?">
        <p>{name} medya kütüphanesinden kaldırılır.</p>
        <div className="adm-dialog-actions">
          <Button
            variant="destructive"
            onClick={() => {
              setConfirming(false);
              onDelete();
            }}
          >
            Evet, sil
          </Button>
          <Button onClick={() => setConfirming(false)}>Vazgeç</Button>
        </div>
      </Dialog>
    </aside>
  );
}

export default function MediaLibraryScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [view, setView] = useState<View>('grid');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metas, setMetas] = useState<Record<string, Meta>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const nameOf = (m: MediaItem) => metas[m.id]?.name ?? fileName(m.file);
  const q = query.trim().toLowerCase();
  const items = draft.media.filter((m) => !q || [nameOf(m), m.id, m.alt].some((s) => s.toLowerCase().includes(q)));
  const selected = draft.media.find((m) => m.id === selectedId) ?? null;

  const patchMedia = (id: string, patch: Partial<MediaItem>) =>
    updateDraft((c) => ({ ...c, media: c.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  const addFiles = async (files: File[]) => {
    setProblem(null);
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setProblem(`${file.name} bir görsel dosyası değil.`);
        continue;
      }
      const url = URL.createObjectURL(file);
      try {
        const { width, height } = await readDimensions(url);
        const base = slugify(file.name);
        const id = `${base}-${Date.now().toString(36)}${added}`;
        const item: MediaItem = { id, file: url, width, height, alt: '', focal: { x: 50, y: 50 }, illustrative: null };
        updateDraft((c) => ({ ...c, media: [...c.media, item] }));
        setMetas((m) => ({ ...m, [id]: { name: file.name, size: file.size } }));
        setSelectedId(id);
        added += 1;
      } catch {
        URL.revokeObjectURL(url);
        setProblem(`${file.name} okunamadı.`);
      }
    }
    if (added) {
      setNotice(
        'Üretici üst verisi temizlendi. Bu bir simülasyondur: demo sürümünde dosya tarayıcıdan çıkmaz ve gerçek bir temizlik yapılmaz.',
      );
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    void addFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="ml">
      <h1 className="adm-title">Medya kütüphanesi</h1>

      <div
        className="ml-drop"
        data-over={over || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <p>Görselleri buraya bırakın veya dosya seçin.</p>
        <p className="caption">Demo: dosya yalnız tarayıcıda kalır, sunucuya gönderilmez.</p>
        <p className="caption">Demo: yüklenen görsel bu tarayıcıda tutulur ve sayfa yenilenince görünmeyebilir.</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Görsel dosyası"
          tabIndex={-1}
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <Button variant="primary" onClick={() => input.current?.click()}>
          Dosya seç
        </Button>
      </div>
      {notice && (
        <p role="status" className="ml-note">
          {notice}
        </p>
      )}
      {problem && (
        <p role="alert" className="err">
          {problem}
        </p>
      )}

      <div className="ml-bar">
        <Field boxed label="Ara" type="search" value={query} onChange={setQuery} />
        <div className="seg" role="group" aria-label="Görünüm">
          <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            Izgara
          </button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            Liste
          </button>
        </div>
      </div>

      <div className="ml-body" data-open={selected ? true : undefined}>
        <div>
          {items.length === 0 ? (
            <EmptyState message={q ? 'Aramanıza uyan görsel yok.' : 'Henüz görsel yok.'} />
          ) : view === 'grid' ? (
            <ul className="ml-grid" aria-label="Görseller">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="ml-tile"
                    aria-pressed={m.id === selectedId}
                    onClick={() => setSelectedId(m.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
                    <img src={m.file} alt="" />
                    <span className="ml-name">{nameOf(m)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <table className="adm-table">
              <caption className="sr-only">Görseller</caption>
              <thead>
                <tr>
                  <th scope="col" className="label">
                    Önizleme
                  </th>
                  <th scope="col" className="label">
                    Ad
                  </th>
                  <th scope="col" className="label">
                    Ölçü
                  </th>
                  <th scope="col" className="label">
                    Kullanım
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id}>
                    <td data-label="Önizleme">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
                      <img src={m.file} alt="" className="ml-thumb" />
                    </td>
                    <td data-label="Ad">
                      <button
                        type="button"
                        className="tlink"
                        aria-pressed={m.id === selectedId}
                        onClick={() => setSelectedId(m.id)}
                      >
                        {nameOf(m)}
                      </button>
                    </td>
                    <td data-label="Ölçü">
                      {m.width}×{m.height}
                    </td>
                    <td data-label="Kullanım">{mediaUsage(draft, m.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selected && (
          <MediaDetail
            key={selected.id}
            item={selected}
            meta={metas[selected.id]}
            onPatch={(patch) => patchMedia(selected.id, patch)}
            onDelete={() => {
              updateDraft((c) => ({ ...c, media: c.media.filter((m) => m.id !== selected.id) }));
              setSelectedId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
