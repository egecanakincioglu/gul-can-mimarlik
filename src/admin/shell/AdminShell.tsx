'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAdminSelector } from '../store/AdminStoreProvider';
import PublishPanel from '../preview/PublishPanel';
import SaveStatus from '../ui/SaveStatus';
import type { Crumb } from './nav';
import { INBOX_HREF, crumbsFor, currentState, labelFor, navGroups } from './nav';

// Subscribing here keeps the shell itself from re-rendering on every save state change.
function ShellSaveStatus() {
  const saveState = useAdminSelector((s) => s.saveState);
  const dirty = useAdminSelector((s) => s.dirty);
  return <SaveStatus state={saveState} dirty={dirty} />;
}

const sameCrumbs = (a: Crumb[], b: Crumb[]) =>
  a.length === b.length && a.every((c, i) => c.label === b[i]?.label && c.href === b[i]?.href);

export default function AdminShell({
  pathname,
  onLogout,
  children,
}: {
  pathname: string;
  onLogout?: () => void;
  children: ReactNode;
}) {
  const unread = useAdminSelector((s) => s.messages.filter((m) => m.status === 'new').length);
  const crumbs = useAdminSelector(
    (s) =>
      crumbsFor(
        pathname,
        (slug) => s.draft.projects.find((p) => p.slug === slug)?.title,
        (id) => s.messages.find((m) => m.id === id)?.name,
      ),
    sameCrumbs,
  );
  // The menu is open for the route it was opened on, so navigating closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const menuOpen = openFor === pathname;
  const wasOpen = useRef(false);
  const main = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);

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

  const last = crumbs.at(-1)?.label;
  const screenLabel = (crumbs.length > 1 ? last : (labelFor(pathname) ?? last)) ?? null;
  const title = screenLabel ? `${screenLabel} | Yönetim` : 'Yönetim';

  // The framework may write its own title after hydration, so the screen title is re-applied when it changes.
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);

  // Client navigation moves focus to the screen heading; the first load keeps the browser default.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const heading = main.current?.querySelector<HTMLElement>('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    } else main.current?.focus();
  }, [pathname]);

  return (
    <div className="adm">
      <a href="#icerik" className="skip">
        İçeriğe geç
      </a>

      {menuOpen && (
        <button type="button" className="adm-scrim" aria-label="Menüyü kapat" onClick={() => setOpenFor(null)} />
      )}

      <div
        ref={sidebar}
        id="adm-sidebar"
        className="adm-side on-dark"
        data-open={menuOpen}
        role={menuOpen ? 'dialog' : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-label={menuOpen ? 'Menü' : undefined}
      >
        <div className="adm-side-head">
          <p className="adm-brand">Gül CAN Mimarlık</p>
          <button type="button" className="adm-side-close label" onClick={() => setOpenFor(null)}>
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
            Siteyi görüntüle <span className="caption">(yeni sekme)</span>
          </a>
          <button type="button" onClick={onLogout}>
            Çıkış
          </button>
        </div>
      </div>

      <div className="adm-col" inert={menuOpen}>
        <p className="adm-banner">Demo: düzenlemeler bu tarayıcıda tutulur, canlı siteye gitmez.</p>
        <header className="adm-top">
          <div className="adm-bar">
            <button
              ref={menuButton}
              type="button"
              className="adm-btn adm-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="adm-sidebar"
              onClick={() => setOpenFor(pathname)}
            >
              Menü
            </button>
            <nav aria-label="Konum" className="adm-crumbs">
              <ol>
                <li>
                  <Link href="/yonetim">Yönetim</Link>
                </li>
                {crumbs.map((c, i) => (
                  <li key={c.label} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                    {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
                  </li>
                ))}
              </ol>
            </nav>
            <ShellSaveStatus />
            <PublishPanel />
          </div>
        </header>
        <main ref={main} id="icerik" className="adm-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
