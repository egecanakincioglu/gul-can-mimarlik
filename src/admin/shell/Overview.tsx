'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminActions, useAdminSelector } from '../store/AdminStoreProvider';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { issueLabel, issueLink } from '../preview/issue-links';

const SHORTCUTS = [
  { href: '/yonetim/projeler/yeni', label: 'Yeni proje' },
  { href: '/yonetim/ana-sayfa', label: 'Ana sayfayı düzenle' },
  { href: '/yonetim/medya', label: 'Medya kütüphanesi' },
  { href: '/yonetim/gelen-kutusu', label: 'Gelen kutusu' },
];

const formatPublished = (ms: number) => {
  const d = new Date(ms);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${d.toLocaleDateString('tr-TR')} ${time}`;
};

const MAX_LISTED = 8;
const MAX_UNREAD = 3;

export default function Overview() {
  const { reset } = useAdminActions();
  const draft = useAdminSelector((s) => s.draft);
  const messages = useAdminSelector((s) => s.messages);
  const issues = useAdminSelector((s) => s.issues);
  const dirty = useAdminSelector((s) => s.dirty);
  const lastPublishedAt = useAdminSelector((s) => s.lastPublishedAt);
  const [confirmReset, setConfirmReset] = useState(false);

  const unreadMessages = messages
    .filter((m) => m.status === 'new')
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  const unread = unreadMessages.length;
  const published = draft.projects.filter((p) => p.published).length;

  const counters = [
    { label: 'Projeler', value: draft.projects.length, note: `${published} yayında` },
    { label: 'Okunmamış mesaj', value: unread, note: `${messages.length} mesaj` },
    { label: 'Medya', value: draft.media.length, note: 'dosya' },
  ];

  return (
    <div className="adm-overview">
      <h1 className="adm-title">Genel bakış</h1>

      <section className="adm-site-status" aria-labelledby="adm-site-status">
        <h2 id="adm-site-status" className="label">
          Site durumu
        </h2>
        <p>{dirty ? 'Yayınlanmamış değişiklikler var' : 'Yayında, değişiklik yok'}</p>
        <p className="caption">
          {lastPublishedAt === null ? 'Henüz yayınlanmadı' : `Son yayın: ${formatPublished(lastPublishedAt)}`}
        </p>
        <a href="/" target="_blank" rel="noopener noreferrer" className="tlink">
          Siteyi görüntüle <span className="caption">(yeni sekme)</span>
        </a>
      </section>

      <ul className="adm-reset-list adm-counters" aria-label="Özet">
        {counters.map((c) => (
          <li key={c.label} className="adm-counter">
            <span className="label">{c.label}</span>
            <span className="adm-counter-value">{c.value}</span>
            <span className="caption">{c.note}</span>
          </li>
        ))}
      </ul>

      {unread > 0 && (
        <section aria-labelledby="adm-unread">
          <h2 id="adm-unread" className="label">
            Okunmamış mesajlar
          </h2>
          <ul className="adm-reset-list adm-shortcuts">
            {unreadMessages.slice(0, MAX_UNREAD).map((m) => (
              <li key={m.id}>
                <Link href={`/yonetim/gelen-kutusu/${m.id}`} className="tlink">
                  {m.name}
                </Link>{' '}
                <span className="caption">{new Date(m.receivedAt).toLocaleDateString('tr-TR')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="adm-shortcuts">
        <h2 id="adm-shortcuts" className="label">
          Kısayollar
        </h2>
        <ul className="adm-reset-list adm-shortcuts">
          {SHORTCUTS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="tlink">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="adm-missing">
        <h2 id="adm-missing" className="label">
          Eksik olanlar
        </h2>
        {issues.length === 0 ? (
          <p>Eksik yok.</p>
        ) : (
          <ul className="adm-reset-list adm-missing">
            {issues.slice(0, MAX_LISTED).map((issue, i) => {
              const { href } = issueLink(draft, issue);
              return (
                <li key={`${issue.path}-${i}`}>
                  <Link href={href} className="tlink">
                    {issueLabel(issue, draft)}
                  </Link>
                </li>
              );
            })}
            {issues.length > MAX_LISTED && <li>ve {issues.length - MAX_LISTED} tane daha</li>}
          </ul>
        )}
      </section>

      <section aria-labelledby="adm-demo">
        <h2 id="adm-demo" className="label">
          Demo verisi
        </h2>
        <p className="caption">
          Düzenlemeler bu tarayıcıda tutulur. Sıfırlamak taslağı ve yayını örnek içeriğe döndürür.
        </p>
        <Button onClick={() => setConfirmReset(true)}>Demo verisini sıfırla</Button>
      </section>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Demo verisi sıfırlansın mı?">
        <p>Taslak, yayın ve örnek mesajlar ilk haline döner.</p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirmReset(false)}>Vazgeç</Button>
          <Button
            variant="destructive"
            onClick={() => {
              reset();
              setConfirmReset(false);
            }}
          >
            Sıfırla
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
