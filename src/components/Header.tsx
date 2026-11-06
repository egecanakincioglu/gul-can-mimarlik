'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';

export type HeaderTexts = {
  homeAria: string;
  mainNavAria: string;
  mobileNavAria: string;
  menu: string;
  menuClose: string;
  menuHome: string;
  nav: { href: string; label: string }[];
  phone: { label: string; href: string };
  email: { label: string; href: string };
};

export default function Header({ texts }: { texts: HeaderTexts }) {
  const { nav, phone, email } = texts;
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [under, setUnder] = useState<'dark' | 'light'>(isHome ? 'dark' : 'light');
  // The menu is open for the page it was opened on, so a route change closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (value: boolean) => setOpenAt(value ? pathname : null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  /* Header rengi, altındaki yüzeye göre belirlenir: koyu kütle → Kireç logo/metin, açık boşluk → Poşe.
     Basamaklı kenarların (::before) kütleleri de hesaba katılır. */
  useEffect(() => {
    let raf = 0;
    const isDark = (rgb: string) => {
      const m = rgb.match(/[\d.]+/g)?.map(Number);
      if (!m || (m.length > 3 && m[3] < 0.5)) return null;
      return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.28;
    };
    const probe = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const x = window.innerWidth * 0.5;
      const y = 20; // header'ın üst bandı: sınır geçişi gecikmeden algılanır

      for (const el of Array.from(document.querySelectorAll<HTMLElement>('[class*="mass-"]'))) {
        const cs = getComputedStyle(el, '::before');
        if (cs.position !== 'absolute') continue;
        const r = el.getBoundingClientRect();
        const w = parseFloat(cs.width);
        const h = parseFloat(cs.height);
        const top = r.top + (cs.top === 'auto' ? 0 : parseFloat(cs.top));
        const left = cs.left !== 'auto' ? r.left + parseFloat(cs.left) : r.right - parseFloat(cs.right) - w;
        if (x >= left && x <= left + w && y >= top && y <= top + h) {
          setUnder('dark');
          return;
        }
      }

      for (const el of document.elementsFromPoint(x, y)) {
        if (el.closest('.hdr, .menu-panel')) continue;
        for (let n: Element | null = el; n; n = n.parentElement) {
          const d = isDark(getComputedStyle(n).backgroundColor);
          if (d !== null) {
            setUnder(d ? 'dark' : 'light');
            return;
          }
        }
      }
      setUnder('light');
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    const t = window.setTimeout(probe, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [pathname]);

  // body scroll lock + focus handling for the mobile menu
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button') ?? []);
    window.setTimeout(() => focusables()[0]?.focus(), 60);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenAt(null);
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', key);
    const button = btn.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', key);
      button?.focus();
    };
  }, [open]);

  const tone = under;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <header className="hdr" data-tone={tone} data-compact={scrolled ? '1' : '0'}>
        <div className="flex h-full items-center justify-between px-[var(--pad)]">
          <Link href="/" aria-label={texts.homeAria} className="block">
            <Logo height={28} />
          </Link>

          <nav aria-label={texts.mainNavAria} className="hidden items-center gap-9 md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="navlink" aria-current={isActive(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
            <a href={phone.href} className="navlink hidden lg:inline-flex">
              {phone.label}
            </a>
          </nav>

          <button
            ref={btn}
            type="button"
            className="flex min-h-[44px] items-center gap-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobil-menu"
            onClick={() => setOpen(true)}
          >
            <span className="label">{texts.menu}</span>
            <span aria-hidden className="flex flex-col gap-[6px]">
              <span className="block h-[2px] w-7 bg-current" />
              <span className="block h-[2px] w-7 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobil-menu"
        ref={panel}
        className="menu-panel on-dark"
        data-open={open ? '1' : '0'}
        role="dialog"
        aria-modal="true"
        aria-label={texts.menu}
        aria-hidden={!open}
      >
        <div className="flex min-h-full flex-col px-5 pb-8 pt-4">
          <div className="flex items-center justify-between">
            <Logo height={30} />
            <button
              type="button"
              className="label min-h-[48px] border border-golge px-5"
              onClick={() => setOpen(false)}
            >
              {texts.menuClose}
            </button>
          </div>
          <nav aria-label={texts.mobileNavAria} className="mt-12 flex flex-col">
            {[{ href: '/', label: texts.menuHome }, ...nav].map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="m-link d-l border-b border-golge py-3"
                style={{ '--i': i } as React.CSSProperties}
                aria-current={pathname === n.href ? 'page' : undefined}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-12">
            <a href={phone.href} className="d-m flex min-h-[56px] items-center border border-golge px-5">
              {phone.label}
            </a>
            <a
              href={email.href}
              className="flex min-h-[56px] items-center break-all border border-golge px-5 text-[17px]"
            >
              {email.label}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
