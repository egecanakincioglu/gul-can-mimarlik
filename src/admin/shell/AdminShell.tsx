'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAdminStore } from '../store/AdminStoreProvider';
import PublishPanel from '../preview/PublishPanel';
import SaveStatus from '../ui/SaveStatus';
import { INBOX_HREF, crumbsFor, currentState, navGroups } from './nav';

export default function AdminShell({
  pathname,
  onLogout,
  children,
}: {
  pathname: string;
  onLogout?: () => void;
  children: ReactNode;
}) {
  const { messages, dirty, saveState } = useAdminStore();
  // The menu is open for the route it was opened on, so navigating closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const menuOpen = openFor === pathname;
  const wasOpen = useRef(false);

  useEffect(() => {
    if (menuOpen) {
      sidebar.current?.querySelector<HTMLElement>('button, a')?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpenFor(null);
        if (e.key !== 'Tab' || !sidebar.current) return;
        const items = sidebar.current.querySelectorAll<HTMLElement>('button, a[href]');
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (!sidebar.current.contains(active)) {
          e.preventDefault();
          first?.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first?.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      wasOpen.current = true;
      return () => document.removeEventListener('keydown', onKey);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButton.current?.focus();
    }
  }, [menuOpen]);

  const unread = messages.filter((m) => m.status === 'new').length;
  const crumbs = crumbsFor(pathname);

  return (
    <div className="adm">
      <a href="#icerik" className="skip">
        İçeriğe geç
      </a>

      {menuOpen && (
        <button type="button" className="adm-scrim" aria-label="Menüyü kapat" onClick={() => setOpenFor(null)} />
      )}

      <div ref={sidebar} id="adm-sidebar" className="adm-side on-dark" data-open={menuOpen}>
        <div className="adm-side-head">
          <p className="adm-brand">Gül CAN Mimarlık</p>
          <button
            type="button"
            className="adm-side-close label"
            data-collapsed-only="true"
            onClick={() => setOpenFor(null)}
          >
            Kapat
          </button>
        </div>
        <nav aria-label="Yönetim" className="adm-nav">
          {navGroups.map((group, g) => (
            <div key={group.label ?? g} className="adm-group">
              {group.label && (
                <p id={`adm-group-${g}`} className="label muted">
                  {group.label}
                </p>
              )}
              <ul aria-labelledby={group.label ? `adm-group-${g}` : undefined}>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={currentState(item.href, pathname)}>
                      {item.label}
                      {item.href === INBOX_HREF && unread > 0 && (
                        <>
                          <span className="adm-count" aria-hidden="true">
                            {unread}
                          </span>
                          <span className="sr-only"> ({unread} okunmamış)</span>
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Siteyi görüntüle
          </a>
          <button type="button" onClick={onLogout}>
            Çıkış
          </button>
        </div>
      </div>

      <div className="adm-col">
        <header className="adm-top">
          <p className="adm-banner">Demo: düzenlemeler bu tarayıcıda tutulur, canlı siteye gitmez.</p>
          <div className="adm-bar">
            <button
              ref={menuButton}
              type="button"
              className="adm-btn adm-btn-secondary adm-menu-btn"
              data-collapsed-only="true"
              aria-expanded={menuOpen}
              aria-controls="adm-sidebar"
              onClick={() => setOpenFor(pathname)}
            >
              Menü
            </button>
            <nav aria-label="Konum" className="adm-crumbs">
              <ol>
                <li>Yönetim</li>
                {crumbs.map((c, i) => (
                  <li key={c} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                    {c}
                  </li>
                ))}
              </ol>
            </nav>
            <SaveStatus state={saveState} dirty={dirty} />
            <PublishPanel />
          </div>
        </header>
        <main id="icerik" className="adm-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
