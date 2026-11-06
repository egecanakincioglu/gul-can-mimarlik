import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { renameSlug } from '@/content/select';
import type { SiteContent } from '@/content/types';
import { createAdminStore } from '../../store/admin-store';
import type { StorageLike } from '../../store/admin-store';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import RedirectsScreen from './RedirectsScreen';
import { checkRedirect } from './redirect-rules';

afterEach(cleanup);

let seed: SiteContent;
let live: string;
beforeAll(async () => {
  seed = await getContent();
  live = `/projeler/${seed.projects.find((p) => p.published)!.slug}`;
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const storageWith = (content: SiteContent): StorageLike => {
  const data = new Map<string, string>();
  const io: StorageLike = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
  const store = createAdminStore(seed, io);
  store.updateDraft(content);
  store.flush();
  return io;
};

const open = async (content: SiteContent) => {
  render(
    <AdminStoreProvider storage={storageWith(content)}>
      <RedirectsScreen />
    </AdminStoreProvider>,
  );
  await screen.findByRole('heading', { level: 1 });
};

const openDialog = () => {
  const el = document.querySelector<HTMLElement>('dialog[open]');
  if (!el) throw new Error('No open dialog');
  return el;
};

const fill = (from: string, to: string) => {
  const dialog = openDialog();
  fireEvent.change(within(dialog).getByLabelText('Eski adres'), { target: { value: from } });
  fireEvent.change(within(dialog).getByLabelText('Yeni adres'), { target: { value: to } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Kaydet' }));
  return dialog;
};

describe('RedirectsScreen', () => {
  it('shows the empty state', async () => {
    await open({ ...seed, redirects: [] });
    expect(screen.getByText('Henüz eski adres yok.')).toBeTruthy();
    expect(screen.getByText(/otomatik eklenir; elle de ekleyebilirsiniz/)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Eski adresler (yönlendirme)');
    expect(screen.getByRole('button', { name: 'Yönlendirme ekle' })).toBeTruthy();
  });

  it('marks rename redirects as Otomatik and gives them no edit action', async () => {
    const p = seed.projects.find((x) => x.published)!;
    const renamed = renameSlug({ ...seed, redirects: [] }, p.id, 'yeni-ornek-ad');
    await open({
      ...renamed,
      redirects: [...renamed.redirects, { id: 'manual-1', from: '/eski', to: '/projeler/yeni-ornek-ad' }],
    });
    expect(screen.getAllByText('Otomatik')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /düzenle/ })).toHaveLength(1);
  });

  it('removes an automatic redirect only after warning that old links stop working', async () => {
    const p = seed.projects.find((x) => x.published)!;
    const renamed = renameSlug({ ...seed, redirects: [] }, p.id, 'yeni-ornek-ad');
    await open(renamed);
    fireEvent.click(screen.getByRole('button', { name: /yönlendirmesini sil/ }));
    const dialog = openDialog();
    expect(within(dialog).getByText(/eski bağlantılar çalışmayı bırakır/)).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Vazgeç' }));
    expect(screen.getByText('Otomatik')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /yönlendirmesini sil/ }));
    fireEvent.click(within(openDialog()).getByRole('button', { name: 'Sil' }));
    expect(screen.getByText('Henüz eski adres yok.')).toBeTruthy();
  });

  it('fills the target from a public path suggestion', async () => {
    await open({ ...seed, redirects: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Yönlendirme ekle' }));
    const dialog = openDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: '/hizmetler' }));
    expect((within(dialog).getByLabelText('Yeni adres') as HTMLInputElement).value).toBe('/hizmetler');
    fireEvent.change(within(dialog).getByLabelText('Eski adres'), { target: { value: '/eski-hizmet' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kaydet' }));
    expect(screen.getByText('/eski-hizmet')).toBeTruthy();
  });

  it('adds a valid redirect', async () => {
    await open({ ...seed, redirects: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Yönlendirme ekle' }));
    fill('/eski-sayfa', live);
    expect(screen.getByText('/eski-sayfa')).toBeTruthy();
    expect(screen.getByText('Elle eklendi')).toBeTruthy();
  });

  it('rejects a bad path, a duplicate and a loop', async () => {
    await open({ ...seed, redirects: [{ id: 'manual-1', from: '/eski', to: live }] });
    fireEvent.click(screen.getByRole('button', { name: 'Yönlendirme ekle' }));

    const dialog = fill('eski', live);
    expect(within(dialog).getAllByText(/ile başlamalı/)).toHaveLength(2);
    expect(within(dialog).getByLabelText('Eski adres').getAttribute('aria-invalid')).toBe('true');

    fill('/eski', live);
    expect(within(dialog).getAllByText(/zaten bir yönlendirme var/)).toHaveLength(2);

    fill(live, live);
    expect(within(dialog).getAllByText(/döngü/)).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('focuses the first invalid field and lists errors by label as buttons', async () => {
    await open({ ...seed, redirects: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Yönlendirme ekle' }));
    const dialog = fill('eski', 'yeni');
    const from = within(dialog).getByLabelText('Eski adres');
    expect(document.activeElement).toBe(from);
    const alert = within(dialog).getByRole('alert');
    const items = within(alert).getAllByRole('button');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toMatch(/^Eski adres: .*ile başlamalı/);
    expect(items[1].textContent).toMatch(/^Yeni adres: /);
    fireEvent.click(items[1]);
    expect(document.activeElement).toBe(within(dialog).getByLabelText('Yeni adres'));
  });

  it('puts Vazgeç before the destructive action in the delete dialog', async () => {
    await open({ ...seed, redirects: [{ id: 'manual-1', from: '/eski', to: live }] });
    fireEvent.click(screen.getByRole('button', { name: '/eski yönlendirmesini sil' }));
    const names = within(openDialog())
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(names.indexOf('Vazgeç')).toBeGreaterThanOrEqual(0);
    expect(names.indexOf('Vazgeç')).toBeLessThan(names.indexOf('Sil'));
  });

  it('edits and removes a manual redirect after confirming', async () => {
    await open({ ...seed, redirects: [{ id: 'manual-1', from: '/eski', to: live }] });
    fireEvent.click(screen.getByRole('button', { name: '/eski yönlendirmesini düzenle' }));
    fill('/baska', live);
    expect(screen.getByText('/baska')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '/baska yönlendirmesini sil' }));
    const dialog = openDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sil' }));
    expect(screen.getByText('Henüz eski adres yok.')).toBeTruthy();
  });
});

describe('checkRedirect', () => {
  const base = (redirects: SiteContent['redirects']): SiteContent => ({ ...seed, redirects });

  it('flags chains in both directions and dangling targets', () => {
    const c = base([{ id: 'manual-1', from: '/a', to: live }]);
    expect(checkRedirect(c, { id: 'n', from: '/b', to: '/a' }).to).toMatch(/Zincir/);
    expect(checkRedirect(c, { id: 'n', from: live, to: '/b' }).from).toBeTruthy();
    expect(checkRedirect(c, { id: 'n', from: '/c', to: '/yok' }).to).toMatch(/sayfa veya/);
  });

  it('accepts a valid entry and ignores problems that already exist', () => {
    const c = base([{ id: 'manual-1', from: '/a', to: '/yok' }]);
    expect(checkRedirect(c, { id: 'n', from: '/b', to: live })).toEqual({});
  });
});
