'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { useAdminStore } from '../store/AdminStoreProvider';
import { changedAreas } from './changes';
import { issueLabel, issueLink } from './issue-links';

const NOTHING_TO_PUBLISH = 'Yayınlanacak değişiklik yok.';

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Top bar controls: discard the draft and publish it, each behind a confirm dialog. */
export default function PublishPanel() {
  const { draft, published, issues, dirty, publish, discardDraft } = useAdminStore();
  const [confirm, setConfirm] = useState<'publish' | 'discard' | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const statusId = useId();
  const blocked = issues.length > 0;
  const areas = useMemo(() => (dirty ? changedAreas(draft, published) : []), [dirty, draft, published]);

  const doPublish = async () => {
    setConfirm(null);
    setFailed(false);
    const result = await publish();
    setFailed(!result.ok);
    if (result.ok) setPublishedAt(hhmm(new Date()));
  };

  const showPublished = publishedAt !== null && !dirty;
  // The disabled button needs the reason, but the save status already says it on screen.
  const reasonOnly = !failed && !showPublished && !dirty;

  return (
    <>
      <p id={statusId} role="status" className={reasonOnly ? 'sr-only' : 'adm-save-status'}>
        {failed
          ? ''
          : showPublished
            ? `Yayınlandı ${publishedAt}. Değişiklikler sitede.`
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
        {blocked ? `Yayınla (${issues.length} sorun)` : 'Yayınla'}
      </Button>

      <Dialog
        open={confirm === 'publish'}
        onClose={() => setConfirm(null)}
        title={blocked ? 'Yayınlamadan önce düzeltilmeli' : 'Değişiklikler yayınlansın mı?'}
      >
        {blocked ? (
          <div role="alert" className="adm-publish-issues">
            <p>Yayınlamadan önce {issues.length} sorun düzeltilmeli.</p>
            <ul>
              {issues.map((issue) => {
                const { href } = issueLink(draft, issue);
                return (
                  <li key={`${issue.path}:${issue.code}`}>
                    <Link href={href} className="tlink" onClick={() => setConfirm(null)}>
                      {issueLabel(issue, draft)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            <p>Şu değişiklikler sitede görünür olur:</p>
            <ul className="adm-publish-areas">
              {areas.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </>
        )}
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
              setPublishedAt(null);
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
