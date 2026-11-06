import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AdminStoreProvider } from '@/admin/store/AdminStoreProvider';
import AltBilgi from './alt-bilgi/page.tsx';
import AnaSayfa from './ana-sayfa/page.tsx';
import Gezinme from './gezinme/page.tsx';
import GelenKutusu from './gelen-kutusu/page.tsx';
import Mesaj from './gelen-kutusu/[id]/page.tsx';
import Hizmetler from './hizmetler/page.tsx';
import IletisimBilgileri from './iletisim-bilgileri/page.tsx';
import IletisimSayfasi from './iletisim-sayfasi/page.tsx';
import Medya from './medya/page.tsx';
import Metinler from './metinler/page.tsx';
import ProjelerSayfasi from './projeler-sayfasi/page.tsx';
import Seo from './seo/page.tsx';
import SiteAyarlari from './site-ayarlari/page.tsx';
import Studyo from './studyo/page.tsx';
import SurecAdimlari from './surec-adimlari/page.tsx';
import Yonlendirmeler from './yonlendirmeler/page.tsx';

afterEach(cleanup);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const ROUTES: [string, () => ReactElement, string][] = [
  ['site-ayarlari', SiteAyarlari, 'Site ayarları'],
  ['iletisim-bilgileri', IletisimBilgileri, 'İletişim bilgileri'],
  ['gezinme', Gezinme, 'Gezinme'],
  ['seo', Seo, 'SEO'],
  ['metinler', Metinler, 'Metinler'],
  ['alt-bilgi', AltBilgi, 'Alt bilgi'],
  ['medya', Medya, 'Medya kütüphanesi'],
  ['gelen-kutusu', GelenKutusu, 'Gelen kutusu'],
  ['yonlendirmeler', Yonlendirmeler, 'Yönlendirmeler'],
  ['ana-sayfa', AnaSayfa, 'Ana sayfa'],
  ['hizmetler', Hizmetler, 'Hizmetler'],
  ['surec-adimlari', SurecAdimlari, 'Süreç adımları'],
  ['studyo', Studyo, 'Stüdyo'],
  ['iletisim-sayfasi', IletisimSayfasi, 'İletişim sayfası'],
  ['projeler-sayfasi', ProjelerSayfasi, 'Projeler sayfası'],
];

describe('admin screen routes', () => {
  it.each(ROUTES)('%s renders its screen', async (_route, Page, title) => {
    render(<AdminStoreProvider storage={storage}>{<Page />}</AdminStoreProvider>);
    const h1 = await screen.findByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(title);
  });

  it('opens a message by id', async () => {
    render(
      <AdminStoreProvider storage={storage}>
        {await Mesaj({ params: Promise.resolve({ id: 'sample-3' }) })}
      </AdminStoreProvider>,
    );
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByText('Mesaj bulunamadı')).toBeNull();
  });

  it('shows a not-found state for an unknown message id', async () => {
    render(
      <AdminStoreProvider storage={storage}>
        {await Mesaj({ params: Promise.resolve({ id: 'yok' }) })}
      </AdminStoreProvider>,
    );
    expect(await screen.findByText('Mesaj bulunamadı')).toBeTruthy();
  });
});
