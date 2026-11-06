'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
import { UPLOADED_STATUS, createMediaItem, revokeIfBlob } from './upload.ts';
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

const missingAlt = (m: MediaItem) => m.decorative !== true && !m.alt.trim();

function MediaDetail({
  item,
  name,
  size,
  focusTarget,
  onPatch,
  onAskDelete,
  onClose,
}: {
  item: MediaItem;
  name: string;
  size: number | undefined;
  /** Where focus goes when the panel opens: the heading after a tile click, the description after an upload. */
  focusTarget: 'heading' | 'alt';
  onPatch: (patch: Partial<MediaItem>) => void;
  onAskDelete: () => void;
  onClose: () => void;
}) {
  const { draft } = useAdminStore();
  const panel = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [focal, setFocal] = useState(item.focal);
  const decorative = item.decorative === true;
  const usage = mediaUsage(draft, item.id);
  const used = usage.length > 0;
  const altError = decorative
    ? undefined
    : !item.alt.trim()
      ? 'Görsel açıklaması zorunlu. Görsel yalnız süs ise Dekoratif seçin.'
      : item.alt.length > ALT_MAX
        ? `Görsel açıklaması en çok ${ALT_MAX} karakter olabilir.`
        : undefined;

  useEffect(() => {
    if (focusTarget === 'alt') panel.current?.querySelector<HTMLElement>('textarea')?.focus();
    else heading.current?.focus();
  }, [focusTarget]);

  return (
    <aside ref={panel} className="ml-detail" aria-label="Medya ayrıntıları">
      <Button onClick={onClose}>Listeye dön</Button>
      <h2 ref={heading} tabIndex={-1} className="adm-dialog-title ml-heading">
        {name}
      </h2>
      <dl className="ml-facts">
        <dt className="label">Ad</dt>
        <dd>{name}</dd>
        <dt className="label">Boyut</dt>
        <dd>{formatSize(size)}</dd>
        <dt className="label">Ölçü</dt>
        <dd>
          {item.width}×{item.height} px
        </dd>
      </dl>

      <Field
        boxed
        multiline
        rows={3}
        label="Görsel açıklaması"
        value={item.alt}
        max={ALT_MAX}
        error={altError}
        helper={
          decorative
            ? 'Dekoratif görsel ekran okuyucuya bildirilmez.'
            : 'Görme engelli ziyaretçilere ve arama motorlarına görseli anlatır. Örnek: Avlulu konutun bahçeden görünüşü.'
        }
        onChange={(alt) => !decorative && onPatch({ alt })}
      />
      <Toggle
        label="Dekoratif"
        checked={decorative}
        onChange={(on) => onPatch(on ? { decorative: true, alt: '' } : { decorative: undefined })}
      />
      <p className="caption">Yalnız süs amaçlıysa işaretleyin; ekran okuyucular atlar.</p>

      <h3 className="label ml-sub">Odak noktası</h3>
      <FocalPicker media={item} value={focal} onChange={setFocal} onCommit={(f) => onPatch({ focal: f })} alt="" />

      <h3 className="label ml-sub">Kullanıldığı yerler</h3>
      {used ? (
        <ul className="adm-reset-list ml-usage">
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
        <Button variant="destructive" disabled={used} onClick={onAskDelete}>
          Sil
        </Button>
        {used && (
          <p className="caption" role="note">
            {usage.length} yerde kullanıldığı için silinemez. Önce kullanımları değiştirin.
          </p>
        )}
      </div>
    </aside>
  );
}

export default function MediaLibraryScreen() {
  const { draft, updateDraft } = useAdminStore();
  const [view, setView] = useState<View>('grid');
  const [query, setQuery] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusAlt, setFocusAlt] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [metas, setMetas] = useState<Record<string, Meta>>({});
  const [status, setStatus] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  // Media id (or 'upload') that should receive focus once the next render has committed.
  const pendingFocus = useRef<string | null>(null);

  const nameOf = (m: MediaItem) => metas[m.id]?.name ?? fileName(m.file);
  const q = query.trim().toLowerCase();
  const items = draft.media.filter(
    (m) => (!q || [nameOf(m), m.id, m.alt].some((x) => x.toLowerCase().includes(q))) && (!onlyMissing || missingAlt(m)),
  );
  const selected = draft.media.find((m) => m.id === selectedId) ?? null;
  const confirming = draft.media.find((m) => m.id === confirmingId) ?? null;

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const all = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-media-id], [data-upload]') ?? []);
    all.find((el) => (target === 'upload' ? el.hasAttribute('data-upload') : el.dataset.mediaId === target))?.focus();
  });

  const patchMedia = (id: string, patch: Partial<MediaItem>) =>
    updateDraft((c) => ({ ...c, media: c.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  const select = (id: string) => {
    setFocusAlt(false);
    setSelectedId(id);
  };

  const removeConfirmed = (id: string) => {
    const removed = draft.media.find((m) => m.id === id);
    if (removed) revokeIfBlob(removed.file);
    const at = items.findIndex((m) => m.id === id);
    const next = items[at + 1] ?? items[at - 1];
    pendingFocus.current = next ? next.id : 'upload';
    updateDraft((c) => ({ ...c, media: c.media.filter((m) => m.id !== id) }));
    setSelectedId(null);
    setConfirmingId(null);
  };

  const addFiles = async (files: File[]) => {
    setProblem(null);
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setProblem(`${file.name} bir görsel dosyası değil.`);
        continue;
      }
      try {
        const item = await createMediaItem(file, added);
        updateDraft((c) => ({ ...c, media: [...c.media, item] }));
        setMetas((m) => ({ ...m, [item.id]: { name: file.name, size: file.size } }));
        setFocusAlt(true);
        setSelectedId(item.id);
        added += 1;
      } catch {
        setProblem(`${file.name} okunamadı.`);
      }
    }
    if (added) setStatus(UPLOADED_STATUS);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    void addFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="ml" ref={root}>
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
        <Button data-upload onClick={() => input.current?.click()}>
          Dosya seç
        </Button>
      </div>
      <p role="status" className="adm-notice adm-notice-info ml-note">
        {status}
      </p>
      {problem && (
        <p role="alert" className="err">
          {problem}
        </p>
      )}

      <div className="ml-bar">
        <Field boxed label="Ara" type="search" value={query} onChange={setQuery} />
        <Toggle label="Yalnız açıklaması eksikler" checked={onlyMissing} onChange={setOnlyMissing} />
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
            <EmptyState
              message={
                q ? 'Aramanıza uyan görsel yok.' : onlyMissing ? 'Açıklaması eksik görsel yok.' : 'Henüz görsel yok.'
              }
            />
          ) : view === 'grid' ? (
            <ul className="adm-reset-list ml-grid" aria-label="Görseller">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="ml-tile"
                    data-media-id={m.id}
                    aria-pressed={m.id === selectedId}
                    onClick={() => select(m.id)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs cannot go through the image optimizer */}
                    <img src={m.file} alt="" loading="lazy" decoding="async" />
                    <span className="ml-name">{nameOf(m)}</span>
                    {missingAlt(m) && <span className="ml-badge label">Açıklaması eksik</span>}
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
                      <img src={m.file} alt="" className="ml-thumb" loading="lazy" decoding="async" />
                    </td>
                    <td data-label="Ad">
                      <button
                        type="button"
                        className="tlink ml-link"
                        data-media-id={m.id}
                        aria-pressed={m.id === selectedId}
                        onClick={() => select(m.id)}
                      >
                        {nameOf(m)}
                      </button>
                      {missingAlt(m) && <span className="ml-badge label">Açıklaması eksik</span>}
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
            name={nameOf(selected)}
            size={metas[selected.id]?.size}
            focusTarget={focusAlt ? 'alt' : 'heading'}
            onPatch={(patch) => patchMedia(selected.id, patch)}
            onAskDelete={() => setConfirmingId(selected.id)}
            onClose={() => {
              pendingFocus.current = selected.id;
              setSelectedId(null);
            }}
          />
        )}
      </div>

      <Dialog open={confirming !== null} onClose={() => setConfirmingId(null)} title="Görsel silinsin mi?">
        <div className="ml-confirm">
          <p>{confirming ? nameOf(confirming) : ''} medya kütüphanesinden kaldırılır.</p>
          <div className="adm-dialog-actions">
            <Button onClick={() => setConfirmingId(null)}>Vazgeç</Button>
            <Button variant="destructive" onClick={() => confirming && removeConfirmed(confirming.id)}>
              Evet, sil
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
