'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminStore } from '../../store/AdminStoreProvider';
import EmptyState from '../../ui/EmptyState';
import { formatDate, isSample, statusLabel } from './format';
import './inbox.css';

type Filter = 'inbox' | 'archive';

export default function InboxScreen() {
  const { messages } = useAdminStore();
  const [filter, setFilter] = useState<Filter>('inbox');

  const shown = messages
    .filter((m) => (filter === 'archive' ? m.status === 'archived' : m.status !== 'archived'))
    .toSorted((a, b) => b.receivedAt.localeCompare(a.receivedAt));

  const empty =
    filter === 'archive'
      ? { message: 'Arşivde mesaj yok.', hint: 'Arşive taşıdığınız mesajlar burada görünür.' }
      : messages.length > 0
        ? { message: 'Gelen kutusu boş.', hint: 'Yeni mesajlar geldiğinde burada görünür.' }
        : { message: 'Henüz mesaj yok.', hint: 'Ziyaretçi iletişim formunu gönderince mesajlar burada görünür.' };

  return (
    <div>
      <h1 className="adm-title">Gelen kutusu</h1>
      <div className="adm-inbox-bar">
        <div className="seg" role="group" aria-label="Mesaj filtresi">
          <button type="button" aria-pressed={filter === 'inbox'} onClick={() => setFilter('inbox')}>
            Gelen
          </button>
          <button type="button" aria-pressed={filter === 'archive'} onClick={() => setFilter('archive')}>
            Arşiv
          </button>
        </div>
      </div>
      {shown.length === 0 ? (
        <>
          <EmptyState message={empty.message} />
          <p className="caption adm-inbox-hint">{empty.hint}</p>
        </>
      ) : (
        <ul className="adm-inbox-list" aria-label={filter === 'archive' ? 'Arşivlenen mesajlar' : 'Gelen mesajlar'}>
          {shown.map((m) => {
            const unread = m.status === 'new';
            return (
              <li key={m.id}>
                <Link href={`/yonetim/gelen-kutusu/${m.id}`} className="adm-inbox-row" data-unread={unread}>
                  {unread ? (
                    <span className="adm-unread" aria-hidden="true" data-testid="unread-marker" />
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <span className="adm-inbox-sender">
                    {m.name}
                    {isSample(m.id) && <span className="badge adm-inbox-sample">Örnek mesaj</span>}
                  </span>
                  <span className="adm-inbox-type">{m.projectType}</span>
                  <span className="badge">{statusLabel(m.status)}</span>
                  <span className="adm-inbox-date">{formatDate(m.receivedAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
