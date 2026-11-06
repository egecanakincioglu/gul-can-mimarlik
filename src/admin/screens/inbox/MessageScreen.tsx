'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { formatDateTime, isSample } from './format';
import './inbox.css';

export default function MessageScreen({ id }: { id: string }) {
  const { messages, setMessageStatus } = useAdminStore();
  const m = messages.find((x) => x.id === id);

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
    ['Durum', archived ? 'Arşivde' : m.status === 'new' ? 'Okunmadı' : 'Okundu'],
  ];

  return (
    <div className="adm-message">
      <Link href="/yonetim/gelen-kutusu" className="tlink adm-message-back">
        Gelen kutusuna dön
      </Link>
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
      <div className="adm-message-actions">
        <a href={mailto} className="adm-btn adm-btn-secondary">
          E-posta ile yanıtla
        </a>
        {!archived && (
          <Button onClick={() => setMessageStatus(m.id, m.status === 'new' ? 'read' : 'new')}>
            {m.status === 'new' ? 'Okundu olarak işaretle' : 'Okunmadı olarak işaretle'}
          </Button>
        )}
        <Button onClick={() => setMessageStatus(m.id, archived ? 'read' : 'archived')}>
          {archived ? 'Gelen kutusuna taşı' : 'Arşivle'}
        </Button>
      </div>
    </div>
  );
}
