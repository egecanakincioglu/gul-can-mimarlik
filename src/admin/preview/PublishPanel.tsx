'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { useAdminStore } from '../store/AdminStoreProvider';
import { issueLink } from './issue-links';

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Top bar controls: discard the draft and publish it, each behind a confirm dialog. */
export default function PublishPanel() {
  const { draft, issues, dirty, saveState, publish, discardDraft } = useAdminStore();
  const [confirm, setConfirm] = useState<'publish' | 'discard' | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const blocked = issues.length > 0;

  const doPublish = async () => {
    setConfirm(null);
    const result = await publish();
    setFailed(!result.ok);
    if (result.ok) setPublishedAt(hhmm(new Date()));
  };

  const message = failed ? 'Yayınlanamadı. Tekrar deneyin.' : publishedAt && !dirty ? `Yayınlandı ${publishedAt}` : '';

  return (
    <>
      {message && (
        <p role="status" aria-live="polite" className="adm-save-status">
          {message}
        </p>
      )}
      <Button variant="secondary" disabled={!dirty} onClick={() => setConfirm('discard')}>
        Taslağı at
      </Button>
      <Button variant="primary" disabled={saveState.kind === 'saving'} onClick={() => setConfirm('publish')}>
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
                const { text, href } = issueLink(draft, issue);
                return (
                  <li key={`${issue.path}:${issue.code}`}>
                    <Link href={href} className="tlink" onClick={() => setConfirm(null)}>
                      {text}
                    </Link>{' '}
                    <code>{issue.path}</code>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p>Taslaktaki bütün değişiklikler sitede görünür olur.</p>
        )}
        <div className="adm-dialog-actions">
          {!blocked && (
            <Button variant="primary" onClick={() => void doPublish()}>
              Yayınla
            </Button>
          )}
          <Button onClick={() => setConfirm(null)}>{blocked ? 'Kapat' : 'Vazgeç'}</Button>
        </div>
      </Dialog>
      <Dialog open={confirm === 'discard'} onClose={() => setConfirm(null)} title="Taslak atılsın mı?">
        <p>Yayınlanmamış değişiklikler silinir ve yayındaki sürüme dönülür.</p>
        <div className="adm-dialog-actions">
          <Button
            variant="destructive"
            onClick={() => {
              discardDraft();
              setConfirm(null);
              setPublishedAt(null);
              setFailed(false);
            }}
          >
            Taslağı at
          </Button>
          <Button onClick={() => setConfirm(null)}>Vazgeç</Button>
        </div>
      </Dialog>
    </>
  );
}
