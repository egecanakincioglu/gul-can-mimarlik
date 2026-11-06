'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminStore } from '../store/AdminStoreProvider';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { issueLink } from '../preview/issue-links';

const SHORTCUTS = [
  { href: '/yonetim/projeler/yeni', label: 'Yeni proje' },
  { href: '/yonetim/ana-sayfa', label: 'Ana sayfayı düzenle' },
  { href: '/yonetim/medya', label: 'Medya kütüphanesi' },
  { href: '/yonetim/gelen-kutusu', label: 'Gelen kutusu' },
];

const MAX_LISTED = 8;

export default function Overview() {
  const { draft, messages, issues, reset } = useAdminStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const unread = messages.filter((m) => m.status === 'new').length;
  const published = draft.projects.filter((p) => p.published).length;
  const withoutSeo = draft.projects.filter((p) => !p.seo).length;

  const counters = [
    { label: 'Projeler', value: draft.projects.length, note: `${published} yayında` },
    { label: 'Okunmamış mesaj', value: unread, note: `${messages.length} mesaj` },
    { label: 'Medya', value: draft.media.length, note: 'dosya' },
  ];

  return (
    <div className="adm-overview">
      <h1 className="adm-title">Genel bakış</h1>

      <ul className="adm-counters" aria-label="Özet">
        {counters.map((c) => (
          <li key={c.label} className="adm-counter">
            <span className="label">{c.label}</span>
            <span className="adm-counter-value">{c.value}</span>
            <span className="caption">{c.note}</span>
          </li>
        ))}
      </ul>

      <section aria-labelledby="adm-shortcuts">
        <h2 id="adm-shortcuts" className="label">
          Kısayollar
        </h2>
        <ul className="adm-shortcuts">
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
        {issues.length === 0 && withoutSeo === 0 ? (
          <p>Eksik yok.</p>
        ) : (
          <ul className="adm-missing">
            {issues.slice(0, MAX_LISTED).map((issue, i) => {
              const d = issueLink(draft, issue);
              return (
                <li key={`${issue.path}-${i}`}>
                  <Link href={d.href} className="tlink">
                    {d.text}
                  </Link>
                  <span className="caption"> {issue.path}</span>
                </li>
              );
            })}
            {issues.length > MAX_LISTED && <li>ve {issues.length - MAX_LISTED} tane daha</li>}
            {withoutSeo > 0 && (
              <li>
                <Link href="/yonetim/projeler" className="tlink">
                  {withoutSeo} projede SEO başlığı yok
                </Link>
              </li>
            )}
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
        <Button variant="destructive" onClick={() => setConfirmReset(true)}>
          Demo verisini sıfırla
        </Button>
      </section>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Demo verisi sıfırlansın mı?">
        <p>Taslak, yayın ve örnek mesajlar ilk haline döner.</p>
        <div className="adm-dialog-actions">
          <Button
            variant="destructive"
            onClick={() => {
              reset();
              setConfirmReset(false);
            }}
          >
            Sıfırla
          </Button>
          <Button onClick={() => setConfirmReset(false)}>Vazgeç</Button>
        </div>
      </Dialog>
    </div>
  );
}
