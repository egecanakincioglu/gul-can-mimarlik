'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Project } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import Tabs from '../../ui/Tabs';
import { Screen } from '../pages/common';
import ConceptTab from './ConceptTab';
import GalleryTab from './GalleryTab';
import InfoTab from './InfoTab';
import PairTab from './PairTab';
import SeoTab from './SeoTab';
import { applyProject, emptyWorking, fieldErrors, fromProject, hasErrors, publishGaps } from './model';
import type { Working } from './model';
import './projects.css';

type Props = { slug?: string; isNew?: boolean; onSaved?: (slug: string) => void };

function Editor({ original, onSaved }: { original: Project | null; onSaved?: (slug: string) => void }) {
  const { draft, updateDraft } = useAdminStore();
  const [w, setW] = useState<Working>(() => (original ? fromProject(original) : emptyWorking()));
  const [dirty, setDirty] = useState(false);
  const [blockedPublish, setBlockedPublish] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const errors = useMemo(() => fieldErrors(draft, w), [draft, w]);
  const gaps = useMemo(() => publishGaps(draft, w), [draft, w]);

  const set = (patch: Partial<Working>) => {
    if (patch.published === true && gaps.length) {
      setBlockedPublish(true);
      return;
    }
    setBlockedPublish(false);
    setDirty(true);
    setW((prev) => ({ ...prev, ...patch }));
  };

  const renaming = original !== null && original.published && original.slug !== w.slug;
  const canSave = !hasErrors(errors) && (!w.published || gaps.length === 0);

  const save = () => {
    updateDraft((c) => applyProject(c, w, original));
    setConfirm(false);
    setDirty(false);
    onSaved?.(w.slug);
  };

  const tabProps = { w, set, draft, errors, gaps, blockedPublish };
  const tabs = [
    { id: 'info', label: 'Bilgiler', panel: <InfoTab {...tabProps} /> },
    { id: 'concept', label: 'Konsept', panel: <ConceptTab {...tabProps} /> },
    { id: 'gallery', label: 'Galeri', panel: <GalleryTab {...tabProps} /> },
    { id: 'pair', label: 'Önce/Sonra', panel: <PairTab {...tabProps} /> },
    { id: 'seo', label: 'SEO', panel: <SeoTab {...tabProps} /> },
  ];

  return (
    <Screen
      title={original ? original.title : 'Yeni proje'}
      preview={original ? `/yonetim/onizleme/projeler/${original.slug}` : undefined}
    >
      <p>
        <Link href="/yonetim/projeler" className="tlink">
          Tüm projelere dön
        </Link>
      </p>
      <Tabs label="Proje bölümleri" tabs={tabs} />
      <div className="pj-actions">
        <Button variant="primary" disabled={!canSave} onClick={() => (renaming ? setConfirm(true) : save())}>
          {original ? 'Kaydet' : 'Projeyi oluştur'}
        </Button>
        {dirty && <p role="status">Kaydedilmemiş proje değişiklikleri</p>}
        {!canSave && (
          <p className="caption">
            {hasErrors(errors)
              ? 'Hatalı alanlar düzeltilmeden kaydedilemez.'
              : 'Yayında kalması için eksikler tamamlanmalı.'}
          </p>
        )}
      </div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Adres değişsin mi?">
        <p>
          /projeler/{original?.slug} adresi /projeler/{w.slug} olarak değişir. Eski adres otomatik olarak yeni adrese
          yönlendirilir.
        </p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(false)}>Vazgeç</Button>
          <Button variant="primary" onClick={save}>
            Adresi değiştir
          </Button>
        </div>
      </Dialog>
    </Screen>
  );
}

export default function ProjectEditScreen({ slug, isNew, onSaved }: Props) {
  const { draft } = useAdminStore();
  // The project is followed by id, so a saved address change does not make it vanish.
  const [id] = useState(() => draft.projects.find((p) => p.slug === slug)?.id);
  if (isNew) return <Editor key="new" original={null} onSaved={onSaved} />;
  const project = draft.projects.find((p) => p.id === id);
  if (!project)
    return (
      <Screen title="Proje bulunamadı">
        <div className="adm-empty">
          <p>Bu adreste bir proje yok.</p>
          <Link href="/yonetim/projeler" className="btn">
            Tüm projeler
          </Link>
        </div>
      </Screen>
    );
  return <Editor key={project.id} original={project} onSaved={onSaved} />;
}
