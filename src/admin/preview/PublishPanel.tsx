'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { useAdminActions, useAdminSelector } from '../store/AdminStoreProvider';
import { changedAreas } from './changes';
import { issueLabel, issueLink } from './issue-links';

const NOTHING_TO_PUBLISH = 'Yayınlanacak değişiklik yok.';

const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Dialog body; mounted only while the dialog is open, so the diff is computed on demand. */
function PublishDetails({ onNavigate }: { onNavigate: () => void }) {
  const draft = useAdminSelector((s) => s.draft);
  const published = useAdminSelector((s) => s.published);
  const issues = useAdminSelector((s) => s.issues);
  const areas = useMemo(() => changedAreas(draft, published), [draft, published]);

  if (issues.length > 0) {
    return (
      <div role="alert" className="adm-publish-issues">
        <p>Yayınlamadan önce {issues.length} sorun düzeltilmeli.</p>
        <ul>
          {issues.map((issue) => {
            const { href } = issueLink(draft, issue);
            return (
              <li key={`${issue.path}:${issue.code}`}>
                <Link href={href} className="tlink" onClick={onNavigate}>
                  {issueLabel(issue, draft)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  return (
    <>
      <p>Şu değişiklikler sitede görünür olur:</p>
      <ul className="adm-publish-areas">
        {areas.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </>
  );
}

/** Top bar controls: discard the draft and publish it, each behind a confirm dialog. */
export default function PublishPanel() {
  const { publish, discardDraft } = useAdminActions();
  const dirty = useAdminSelector((s) => s.dirty);
  const issueCount = useAdminSelector((s) => s.issues.length);
  const lastPublishedAt = useAdminSelector((s) => s.lastPublishedAt);
  const [confirm, setConfirm] = useState<'publish' | 'discard' | null>(null);
  const [justPublished, setJustPublished] = useState(false);
  const [failed, setFailed] = useState(false);
  const statusId = useId();
  const blocked = issueCount > 0;

  const doPublish = async () => {
    setConfirm(null);
    setFailed(false);
    const result = await publish();
    setFailed(!result.ok);
    setJustPublished(result.ok);
  };

  const showPublished = justPublished && lastPublishedAt !== null && !dirty;
  // The disabled button needs the reason, but the save status already says it on screen.
  const reasonOnly = !failed && !showPublished && !dirty;

  return (
    <>
      <p id={statusId} role="status" className={reasonOnly ? 'sr-only' : 'adm-save-status'}>
        {failed
          ? ''
          : showPublished
            ? `Yayınlandı ${hhmm(lastPublishedAt ?? 0)}. Değişiklikler sitede.`
            : dirty
              ? ''
              : NOTHING_TO_PUBLISH}
        {!failed && showPublished && (
          <>
            {' '}
            <Link href="/" target="_blank" rel="noopener noreferrer" className="tlink">
              Siteyi görüntüle <span className="caption">(yeni sekme)</span>
            </Link>
          </>
        )}
      </p>
      {failed && (
        <p role="alert" className="adm-save-status">
          Yayınlanamadı. Tekrar deneyin.
        </p>
      )}
      <Button variant="secondary" disabled={!dirty} onClick={() => setConfirm('discard')}>
        Değişiklikleri geri al
      </Button>
      <Button
        variant="primary"
        disabled={!dirty}
        aria-describedby={dirty ? undefined : statusId}
        onClick={() => setConfirm('publish')}
      >
        {blocked ? `Yayınla (${issueCount} sorun)` : 'Yayınla'}
      </Button>

      <Dialog
        open={confirm === 'publish'}
        onClose={() => setConfirm(null)}
        title={blocked ? 'Yayınlamadan önce düzeltilmeli' : 'Değişiklikler yayınlansın mı?'}
      >
        {confirm === 'publish' && <PublishDetails onNavigate={() => setConfirm(null)} />}
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(null)}>{blocked ? 'Kapat' : 'Vazgeç'}</Button>
          {!blocked && (
            <Button variant="primary" onClick={() => void doPublish()}>
              Yayınla
            </Button>
          )}
        </div>
      </Dialog>
      <Dialog open={confirm === 'discard'} onClose={() => setConfirm(null)} title="Değişiklikler geri alınsın mı?">
        <p>Yayınlanmamış bütün değişiklikler silinir, site son yayınlanan hâline döner.</p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(null)}>Vazgeç</Button>
          <Button
            variant="destructive"
            onClick={() => {
              discardDraft();
              setConfirm(null);
              setJustPublished(false);
              setFailed(false);
            }}
          >
            Değişiklikleri geri al
          </Button>
        </div>
      </Dialog>
    </>
  );
}
