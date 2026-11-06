'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import EmptyState from '../../ui/EmptyState';
import Notice from '../../ui/Notice';
import Tabs from '../../ui/Tabs';
import Toggle from '../../ui/Toggle';
import { Screen } from '../pages/common';
import ConceptTab from './ConceptTab';
import GalleryTab from './GalleryTab';
import InfoTab from './InfoTab';
import PairTab from './PairTab';
import SeoTab from './SeoTab';
import { TAB_LABEL, errorIssues, focusSelector, gapIssue } from './issues';
import type { Issue, TabId } from './issues';
import { applyProject, emptyWorking, fieldErrors, fromProject, publishGaps } from './model';
import type { Working } from './model';
import { slugify } from './slug';
import { useLeaveGuard } from './useLeaveGuard';
import './projects.css';

type Props = { slug?: string; isNew?: boolean; onSaved?: (slug: string) => void };

const TAB_ORDER: TabId[] = ['info', 'concept', 'gallery', 'pair', 'seo'];

function Editor({ original, onSaved }: { original: Project | null; onSaved?: (slug: string) => void }) {
  const { draft, updateDraft } = useAdminStore();
  const [w, setW] = useState<Working>(() => (original ? fromProject(original) : emptyWorking()));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [blockedPublish, setBlockedPublish] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ target: string } | null>(null);
  const slugTouched = useRef(false);
  const tabsRoot = useRef<HTMLDivElement>(null);
  const guard = useLeaveGuard(dirty);

  const errors = useMemo(() => fieldErrors(draft, w), [draft, w]);
  const gaps = useMemo(() => publishGaps(draft, w), [draft, w]);
  const gapIssues = useMemo(() => gaps.map((g) => ({ gap: g, issue: gapIssue(g) })), [gaps]);

  // Title and address problems are already reported as field errors, so only the other gaps are added.
  const blocking: Issue[] = [
    ...errorIssues(errors, w),
    ...(w.published ? gapIssues.map((x) => x.issue).filter((i) => i.target !== 'title' && i.target !== 'slug') : []),
  ];
  const summary = attempted ? blocking : [];

  useEffect(() => {
    if (!focusRequest) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = () => {
      const el = tabsRoot.current?.querySelector<HTMLElement>(focusSelector(focusRequest.target));
      if (el) el.focus();
      else if (tries++ < 5) timer = setTimeout(attempt, 20);
    };
    attempt();
    return () => clearTimeout(timer);
  }, [focusRequest]);

  const goTo = (issue: Issue) => {
    tabsRoot.current?.querySelectorAll<HTMLElement>('[role="tab"]')[TAB_ORDER.indexOf(issue.tab)]?.click();
    setFocusRequest({ target: issue.target });
  };

  const set = (patch: Partial<Working>) => {
    if (patch.published === true && gaps.length) {
      setBlockedPublish(true);
      return;
    }
    const next = { ...patch };
    if ('slug' in patch) slugTouched.current = true;
    else if (!original && patch.title !== undefined && !slugTouched.current) next.slug = slugify(patch.title);
    setBlockedPublish(false);
    setDirty(true);
    setSaved(false);
    setW((prev) => ({ ...prev, ...next }));
  };

  const renaming = original !== null && original.published && original.slug !== w.slug;

  const save = () => {
    updateDraft((c) => applyProject(c, w, original));
    setConfirm(false);
    setDirty(false);
    setSaved(true);
    setAttempted(false);
    onSaved?.(w.slug);
  };

  const trySave = () => {
    if (blocking.length) {
      setAttempted(true);
      goTo(blocking[0]);
      return;
    }
    if (renaming) setConfirm(true);
    else save();
  };

  const countFor = (tab: TabId) => summary.filter((i) => i.tab === tab).length;
  const tabProps = { w, set, draft, errors };
  const tabs = [
    { id: 'info', panel: <InfoTab {...tabProps} /> },
    { id: 'concept', panel: <ConceptTab {...tabProps} /> },
    { id: 'gallery', panel: <GalleryTab {...tabProps} /> },
    { id: 'pair', panel: <PairTab {...tabProps} /> },
    { id: 'seo', panel: <SeoTab {...tabProps} /> },
  ].map((t) => ({ ...t, label: TAB_LABEL[t.id as TabId], errorCount: countFor(t.id as TabId) }));

  const formStatus = dirty
    ? 'Kaydedilmemiş değişiklikler'
    : saved
      ? 'Proje kaydedildi. Siteye almak için üstteki Yayınla’ya basın.'
      : '';

  const gapBody = (
    <>
      <h2 className="label pj-sub">Yayın için eksikler</h2>
      {blockedPublish && <p>Yayınlamak için eksik olanları tamamlayın.</p>}
      <ul className="pj-issues">
        {gapIssues.map(({ gap, issue }) => (
          <li key={gap}>
            <button type="button" className="pj-issue-btn" onClick={() => goTo(issue)}>
              {`${TAB_LABEL[issue.tab]}: ${gap}`}
            </button>
          </li>
        ))}
      </ul>
    </>
  );

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
      <p className="pj-state">
        <span>Durum: {original?.published ? 'Yayında' : 'Taslak'}</span>
        {w.concept && <span className="pj-tag">Konsept çalışma</span>}
      </p>

      {gaps.length > 0 &&
        (blockedPublish ? <Notice variant="error">{gapBody}</Notice> : <div className="pj-gaps">{gapBody}</div>)}

      {summary.length > 0 && (
        <Notice variant="error">
          <p>Kaydedilemedi. Şu alanları düzeltin:</p>
          <ul className="pj-issues">
            {summary.map((issue) => (
              <li key={`${issue.target}-${issue.message}`}>
                <button type="button" className="pj-issue-btn" onClick={() => goTo(issue)}>
                  {`${TAB_LABEL[issue.tab]}: ${issue.field}: ${issue.message}`}
                </button>
              </li>
            ))}
          </ul>
        </Notice>
      )}

      <div ref={tabsRoot}>
        <Tabs label="Proje bölümleri" tabs={tabs} />
      </div>

      <div className="pj-savebar">
        <Button variant="primary" onClick={trySave}>
          {original ? 'Kaydet' : 'Projeyi oluştur'}
        </Button>
        <Toggle checked={w.published} label="Yayında" onChange={(published) => set({ published })} />
        <p role="status" className="pj-form-status">
          {formStatus}
        </p>
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

      <Dialog open={guard.asking} onClose={guard.stay} title="Kaydedilmemiş değişiklikler var">
        <p>Sayfadan ayrılırsanız bu değişiklikler kaybolur.</p>
        <div className="adm-dialog-actions">
          <Button onClick={guard.stay}>Vazgeç</Button>
          <Button variant="destructive" onClick={guard.leave}>
            Değişiklikleri bırak
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
        <EmptyState
          message="Bu adreste bir proje yok."
          description="Adres değişmiş ya da proje silinmiş olabilir."
          actionLabel="Tüm projeler"
          href="/yonetim/projeler"
        />
      </Screen>
    );
  return <Editor key={project.id} original={project} onSaved={onSaved} />;
}
