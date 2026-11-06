import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { STORAGE_NAME, createAdminStore } from '../store/admin-store';
import type { StorageLike } from '../store/admin-store';
import { AdminStoreProvider, useAdminStore } from '../store/AdminStoreProvider';
import { sampleMessages } from '../store/sample-messages';
import AdminShell from './AdminShell';
import LoginForm from './LoginForm';
import { navGroups } from './nav';
import Overview from './Overview';

afterEach(cleanup);

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const storageWith = (content?: SiteContent): StorageLike => {
  const data = new Map<string, string>();
  if (content) {
    const store = createAdminStore(seed, {
      getItem: () => null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: () => {},
    });
    store.updateDraft(content);
    store.flush();
  }
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const openDialog = () => document.querySelector('dialog[open]') as HTMLElement;

const renderShell = async (pathname: string, storage: StorageLike = storageWith()) => {
  render(
    <AdminStoreProvider storage={storage}>
      <AdminShell pathname={pathname}>
        <p>İçerik</p>
      </AdminShell>
    </AdminStoreProvider>,
  );
  await screen.findByRole('main');
};

describe('AdminShell', () => {
  it('lists every route up front with the right href', async () => {
    await renderShell('/yonetim');
    const nav = screen.getByRole('navigation', { name: 'Yönetim' });
    const items = navGroups.flatMap((g) => g.items);
    expect(items).toHaveLength(18);
    for (const item of items) {
      const link = within(nav).getByRole('link', { name: new RegExp(`^${item.label.replace(/[()]/g, '\\$&')}`) });
      expect(link.getAttribute('href')).toBe(item.href);
    }
    expect(within(nav).getAllByRole('link')).toHaveLength(items.length);
  });

  it('marks the active item and only that one', async () => {
    await renderShell('/yonetim/medya');
    const nav = screen.getByRole('navigation', { name: 'Yönetim' });
    const current = within(nav)
      .getAllByRole('link')
      .filter((l) => l.hasAttribute('aria-current'));
    expect(current.map((l) => l.getAttribute('href'))).toEqual(['/yonetim/medya']);
    expect(current[0].getAttribute('aria-current')).toBe('page');
  });

  it('keeps projeler and projeler-sayfasi apart and marks a parent for nested routes', async () => {
    await renderShell('/yonetim/projeler/yeni');
    const nav = screen.getByRole('navigation', { name: 'Yönetim' });
    expect(within(nav).getByRole('link', { name: 'Tüm projeler' }).getAttribute('aria-current')).toBe('true');
    expect(within(nav).getByRole('link', { name: 'Projeler sayfası' }).hasAttribute('aria-current')).toBe(false);
  });

  it('has the skip link, main landmark, demo banner, bottom links and unread count', async () => {
    await renderShell('/yonetim');
    expect(screen.getByRole('link', { name: 'İçeriğe geç' }).getAttribute('href')).toBe('#icerik');
    expect(screen.getByRole('main').id).toBe('icerik');
    expect(screen.getByText('Demo: düzenlemeler bu tarayıcıda tutulur, canlı siteye gitmez.')).toBeTruthy();
    const view = screen.getByRole('link', { name: /^Siteyi görüntüle/ });
    expect(view.getAttribute('target')).toBe('_blank');
    expect(view.textContent).toContain('(yeni sekme)');
    expect(screen.getByRole('button', { name: 'Çıkış' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Gelen kutusu/ }).textContent).toContain('2');
  });

  it('updates the unread count when a message changes status', async () => {
    const Toggle = () => {
      const { messages, setMessageStatus } = useAdminStore();
      const fresh = messages.find((m) => m.status === 'new');
      return (
        <>
          <button onClick={() => fresh && setMessageStatus(fresh.id, 'read')}>Okundu</button>
          <button onClick={() => fresh && setMessageStatus(fresh.id, 'archived')}>Arşivle</button>
          <button onClick={() => setMessageStatus('sample-3', 'new')}>Okunmadı</button>
        </>
      );
    };
    render(
      <AdminStoreProvider storage={storageWith()}>
        <AdminShell pathname="/yonetim">
          <Toggle />
        </AdminShell>
      </AdminStoreProvider>,
    );
    await screen.findByRole('main');
    const count = () => screen.getByRole('link', { name: /Gelen kutusu/ }).textContent;
    expect(count()).toContain('2');
    fireEvent.click(screen.getByRole('button', { name: 'Okundu' }));
    expect(count()).toContain('1');
    fireEvent.click(screen.getByRole('button', { name: 'Arşivle' }));
    expect(count()).not.toMatch(/\d/);
    fireEvent.click(screen.getByRole('button', { name: 'Okunmadı' }));
    expect(count()).toContain('1');
  });

  it('shows the breadcrumb for the current route', async () => {
    await renderShell('/yonetim/projeler/yeni');
    const crumbs = screen.getByRole('navigation', { name: 'Konum' });
    expect(
      within(crumbs)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Yönetim', 'Projeler', 'Yeni proje']);
    expect(within(crumbs).getByRole('link', { name: 'Yönetim' }).getAttribute('href')).toBe('/yonetim');
    expect(within(crumbs).getByRole('link', { name: 'Projeler' }).getAttribute('href')).toBe('/yonetim/projeler');
    expect(within(crumbs).queryByRole('link', { name: 'Yeni proje' })).toBeNull();
  });

  it('shows the project title instead of the slug in the breadcrumb', async () => {
    const project = seed.projects[0];
    await renderShell(`/yonetim/projeler/${project.slug}`);
    const crumbs = screen.getByRole('navigation', { name: 'Konum' });
    expect(within(crumbs).getByText(project.title).getAttribute('aria-current')).toBe('page');
    expect(within(crumbs).queryByText(project.slug)).toBeNull();
    expect(document.title).toBe(`${project.title} | Yönetim`);
  });

  it('uses the plain-language nav labels', async () => {
    await renderShell('/yonetim');
    const nav = screen.getByRole('navigation', { name: 'Yönetim' });
    expect(within(nav).getByRole('link', { name: 'Arama sonuçları (SEO)' }).getAttribute('href')).toBe('/yonetim/seo');
    expect(within(nav).getByRole('link', { name: 'Eski adresler (yönlendirme)' }).getAttribute('href')).toBe(
      '/yonetim/yonlendirmeler',
    );
  });

  it('sets the document title on first render and keeps it when the framework rewrites it', async () => {
    document.title = 'Gül CAN Mimarlık';
    render(
      <AdminStoreProvider storage={storageWith()}>
        <AdminShell pathname="/yonetim/gelen-kutusu">
          <h1>Gelen kutusu</h1>
        </AdminShell>
      </AdminStoreProvider>,
    );
    await screen.findByRole('main');
    await waitFor(() => expect(document.title).toBe('Gelen kutusu | Yönetim'));
    expect(document.activeElement).toBe(document.body);
    document.title = 'Gül CAN Mimarlık';
    await waitFor(() => expect(document.title).toBe('Gelen kutusu | Yönetim'));
  });

  it('uses the sender name for a message route in the crumb and title', async () => {
    const name = sampleMessages().find((m) => m.id === 'sample-3')?.name ?? '';
    const view = (path: string) => (
      <AdminStoreProvider storage={storageWith()}>
        <AdminShell pathname={path}>
          <h1>Mesaj</h1>
        </AdminShell>
      </AdminStoreProvider>
    );
    const { rerender } = render(view('/yonetim/gelen-kutusu/sample-3'));
    const crumbs = await screen.findByRole('navigation', { name: 'Konum' });
    expect(within(crumbs).getByText(name).getAttribute('aria-current')).toBe('page');
    await waitFor(() => expect(document.title).toBe(`${name} | Yönetim`));
    rerender(view('/yonetim/gelen-kutusu/yok'));
    expect(document.title).toBe('Mesaj | Yönetim');
  });

  it('sets the document title and moves focus to the heading only on client navigation', async () => {
    const storage = storageWith();
    const tree = (path: string, heading: string) => (
      <AdminStoreProvider storage={storage}>
        <AdminShell pathname={path}>
          <h1>{heading}</h1>
        </AdminShell>
      </AdminStoreProvider>
    );
    const { rerender } = render(tree('/yonetim/medya', 'Medya'));
    await screen.findByRole('main');
    await waitFor(() => expect(document.title).toBe('Medya kütüphanesi | Yönetim'));
    expect(document.activeElement).toBe(document.body);
    rerender(tree('/yonetim/seo', 'SEO'));
    expect(document.title).toBe('Arama sonuçları (SEO) | Yönetim');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1, name: 'SEO' }));
  });

  it('focuses the main region on navigation when the screen has no heading', async () => {
    const storage = storageWith();
    const tree = (path: string) => (
      <AdminStoreProvider storage={storage}>
        <AdminShell pathname={path}>
          <p>x</p>
        </AdminShell>
      </AdminStoreProvider>
    );
    const { rerender } = render(tree('/yonetim/medya'));
    await screen.findByRole('main');
    rerender(tree('/yonetim/seo'));
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it('enables Yayınla when valid and shows the issue count when blocked', async () => {
    await renderShell('/yonetim');
    expect((screen.getByRole('button', { name: 'Yayınla' }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    await renderShell('/yonetim', storageWith({ ...seed, site: { ...seed.site, name: 'Değişti' } }));
    const publish = screen.getByRole('button', { name: 'Yayınla' }) as HTMLButtonElement;
    expect(publish.disabled).toBe(false);
    cleanup();

    const broken: SiteContent = { ...seed, media: seed.media.map((m, i) => (i === 0 ? { ...m, alt: '' } : m)) };
    await renderShell('/yonetim', storageWith(broken));
    const blocked = screen.getByRole('button', { name: /^Yayınla \(\d+ sorun\)$/ }) as HTMLButtonElement;
    expect(blocked.disabled).toBe(false);
    fireEvent.click(blocked);
    const dialog = openDialog();
    expect(within(dialog).getByRole('link', { name: /Görsel açıklaması boş$/, hidden: true })).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'Yayınla', hidden: true })).toBeNull();
  });

  it('confirms before discarding the draft', async () => {
    const changed: SiteContent = { ...seed, site: { ...seed.site, name: 'Değişti' } };
    const storage = storageWith(changed);
    await renderShell('/yonetim', storage);
    expect(document.querySelector('.adm-save-status')?.textContent).toBe('Yayınlanmamış değişiklikler var');
    fireEvent.click(screen.getByRole('button', { name: 'Değişiklikleri geri al' }));
    const dialog = openDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Değişiklikleri geri al', hidden: true }));
    window.dispatchEvent(new Event('pagehide'));
    expect(JSON.parse(storage.getItem(STORAGE_NAME) as string).draft.site.name).toBe(seed.site.name);
  });

  it('opens the menu panel with the Menü button and closes it with Escape', async () => {
    await renderShell('/yonetim');
    const button = screen.getByRole('button', { name: 'Menü' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Menüyü kapat' })).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('makes the open menu a modal dialog and the page behind it inert', async () => {
    await renderShell('/yonetim');
    const col = document.querySelector('.adm-col') as HTMLElement;
    expect(col.hasAttribute('inert')).toBe(false);
    expect(document.getElementById('adm-sidebar')?.getAttribute('role')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Menü' }));
    const dialog = screen.getByRole('dialog', { name: 'Menü' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(col.hasAttribute('inert')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(col.hasAttribute('inert')).toBe(false);
    expect(screen.queryByRole('dialog', { name: 'Menü' })).toBeNull();
  });

  it('closes the panel with Kapat and returns focus to Menü', async () => {
    await renderShell('/yonetim');
    const button = screen.getByRole('button', { name: 'Menü' });
    fireEvent.click(button);
    const close = screen.getByRole('button', { name: 'Kapat' });
    expect(document.activeElement).toBe(close);
    fireEvent.click(close);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('closes the panel when the backdrop is clicked', async () => {
    await renderShell('/yonetim');
    const button = screen.getByRole('button', { name: 'Menü' });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'Menüyü kapat' }));
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Menüyü kapat' })).toBeNull();
  });

  it('keeps Tab focus inside the open panel', async () => {
    await renderShell('/yonetim');
    fireEvent.click(screen.getByRole('button', { name: 'Menü' }));
    const panel = document.getElementById('adm-sidebar') as HTMLElement;
    const items = panel.querySelectorAll<HTMLElement>('button, a[href]');
    const first = items[0] as HTMLElement;
    const last = items[items.length - 1] as HTMLElement;
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    (screen.getByRole('button', { name: 'Menü' }) as HTMLElement).focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('calls onLogout from the sidebar', async () => {
    const onLogout = vi.fn();
    render(
      <AdminStoreProvider storage={storageWith()}>
        <AdminShell pathname="/yonetim" onLogout={onLogout}>
          <p>x</p>
        </AdminShell>
      </AdminStoreProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Çıkış' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe('Overview', () => {
  it('shows derived counters', async () => {
    render(
      <AdminStoreProvider storage={storageWith()}>
        <Overview />
      </AdminStoreProvider>,
    );
    const counters = within(await screen.findByRole('list', { name: 'Özet' }));
    const cell = (label: string) => counters.getByText(label).closest('li') as HTMLElement;
    expect(within(cell('Projeler')).getByText(String(seed.projects.length))).toBeTruthy();
    expect(
      within(cell('Projeler')).getByText(`${seed.projects.filter((p) => p.published).length} yayında`),
    ).toBeTruthy();
    expect(within(cell('Okunmamış mesaj')).getByText('2')).toBeTruthy();
    expect(within(cell('Medya')).getByText(String(seed.media.length))).toBeTruthy();
  });

  it('lists missing items with links to the screen that fixes them', async () => {
    const broken: SiteContent = { ...seed, media: seed.media.map((m, i) => (i === 0 ? { ...m, alt: '' } : m)) };
    render(
      <AdminStoreProvider storage={storageWith(broken)}>
        <Overview />
      </AdminStoreProvider>,
    );
    const link = await screen.findByRole('link', { name: 'Görsel açıklaması boş' });
    expect(link.getAttribute('href')).toBe('/yonetim/medya');
  });

  it('does not flag optional SEO fields as missing', async () => {
    render(
      <AdminStoreProvider storage={storageWith()}>
        <Overview />
      </AdminStoreProvider>,
    );
    await screen.findByRole('list', { name: 'Özet' });
    expect(screen.queryByText(/SEO başlığı yok/)).toBeNull();
  });

  it('shows the site status and the three latest unread messages', async () => {
    render(
      <AdminStoreProvider storage={storageWith({ ...seed, site: { ...seed.site, name: 'Değişti' } })}>
        <Overview />
      </AdminStoreProvider>,
    );
    const status = await screen.findByRole('region', { name: 'Site durumu' });
    expect(within(status).getByText('Yayınlanmamış değişiklikler var')).toBeTruthy();
    const view = within(status).getByRole('link', { name: /^Siteyi görüntüle/ });
    expect(view.getAttribute('target')).toBe('_blank');
    const unread = within(screen.getByRole('region', { name: 'Okunmamış mesajlar' })).getAllByRole('link');
    expect(unread.length).toBeGreaterThan(0);
    expect(unread.length).toBeLessThanOrEqual(3);
    expect(unread[0].getAttribute('href')).toMatch(/^\/yonetim\/gelen-kutusu\/.+/);
  });

  it('says there are no changes when the draft matches the published site', async () => {
    render(
      <AdminStoreProvider storage={storageWith()}>
        <Overview />
      </AdminStoreProvider>,
    );
    expect(await screen.findByText('Yayında, değişiklik yok')).toBeTruthy();
  });

  it('resets after confirmation with Vazgeç as the first dialog action', async () => {
    const storage = storageWith({ ...seed, site: { ...seed.site, name: 'Değişti' } });
    const Reset = () => {
      const { flush } = useAdminStore();
      return <button onClick={flush}>Yaz</button>;
    };
    render(
      <AdminStoreProvider storage={storage}>
        <Overview />
        <Reset />
      </AdminStoreProvider>,
    );
    const open = await screen.findByRole('button', { name: 'Demo verisini sıfırla' });
    expect(open.className).not.toContain('destructive');
    fireEvent.click(open);
    const buttons = within(openDialog()).getAllByRole('button', { hidden: true });
    expect(buttons.map((b) => b.textContent)).toEqual(['Vazgeç', 'Sıfırla']);
    fireEvent.click(buttons[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Yaz' }));
    expect(JSON.parse(storage.getItem(STORAGE_NAME) as string).draft.site.name).toBe(seed.site.name);
  });
});

describe('LoginForm', () => {
  it('accepts any input and shows the demo caption', () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByText('Demo oturumu')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Giriş' }));
    expect(onLogin).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('E-posta'), { target: { value: 'a@example.com' } });
    fireEvent.change(screen.getByLabelText('Parola'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Giriş' }));
    expect(onLogin).toHaveBeenLastCalledWith('a@example.com');
  });
});
