'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { formatDateTime, isSample, statusLabel } from './format';
import './inbox.css';

export default function MessageScreen({ id }: { id: string }) {
  const { messages, setMessageStatus } = useAdminStore();
  const m = messages.find((x) => x.id === id);
  const [moved, setMoved] = useState(false);
  const opened = useRef<string | null>(null);

  // Opening a new message counts as reading it; the ref keeps a manual "unread" mark from being undone.
  useEffect(() => {
    if (m?.status === 'new' && opened.current !== id) setMessageStatus(id, 'read');
    if (m) opened.current = id;
  }, [m, id, setMessageStatus]);

  if (!m) {
    return (
      <div>
        <h1 className="adm-title">Mesaj</h1>
        <EmptyState message="Mesaj bulunamadı" />
        <Link href="/yonetim/gelen-kutusu" className="tlink">
          Gelen kutusuna dön
        </Link>
      </div>
    );
  }

  const archived = m.status === 'archived';
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(`Mesajınız hakkında: ${m.projectType}`)}`;
  const fields: [label: string, value: string][] = [
    ['Gönderen', m.name],
    ['Telefon', m.phone],
    ['E-posta', m.email],
    ['Proje türü', m.projectType],
    ...(m.location ? ([['Konum', m.location]] as [string, string][]) : []),
    ['Tarih', formatDateTime(m.receivedAt)],
    ['Durum', statusLabel(m.status)],
  ];

  return (
    <div className="adm-message">
      <Link href="/yonetim/gelen-kutusu" className="tlink adm-message-back">
        Gelen kutusuna dön
      </Link>
      {moved && archived && (
        <p role="status" className="adm-row adm-message-moved">
          <span>Arşive taşındı.</span>
          <Button
            onClick={() => {
              setMessageStatus(m.id, 'read');
              setMoved(false);
            }}
          >
            Geri al
          </Button>
        </p>
      )}
      <h1 className="adm-title">
        {m.name}
        {isSample(m.id) && <span className="badge adm-inbox-sample">Örnek mesaj</span>}
      </h1>
      <dl>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="label">{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <p className="adm-message-text">{m.message}</p>
      <div className="adm-row">
        <a href={mailto} className="adm-btn">
          E-posta ile yanıtla
        </a>
        {archived ? (
          <Button onClick={() => setMessageStatus(m.id, 'read')}>Gelen kutusuna taşı</Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setMessageStatus(m.id, 'archived');
                setMoved(true);
              }}
            >
              Yanıtlandı, arşive taşı
            </Button>
            <Button onClick={() => setMessageStatus(m.id, m.status === 'new' ? 'read' : 'new')}>
              {m.status === 'new' ? 'Okundu olarak işaretle' : 'Okunmadı olarak işaretle'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
