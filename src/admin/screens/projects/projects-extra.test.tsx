import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { AdminStoreProvider, useAdminStore } from '../../store/AdminStoreProvider';
import { STORAGE_NAME } from '../../store/admin-store';
import type { StorageLike } from '../../store/admin-store';
import ProjectEditScreen from './ProjectEditScreen';
import ProjectsListScreen from './ProjectsListScreen';

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

let current: SiteContent;
function Probe() {
  const { draft } = useAdminStore();
  useLayoutEffect(() => {
    current = draft;
  });
  return null;
}

const memory = (draft?: SiteContent): StorageLike => {
  const data = new Map<string, string>();
  if (draft) data.set(STORAGE_NAME, JSON.stringify({ version: 1, draft, published: seed, messages: [] }));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const mount = async (ui: ReactNode, draft?: SiteContent) => {
  render(
    <AdminStoreProvider storage={memory(draft)}>
      <Probe />
      {ui}
    </AdminStoreProvider>,
  );
  await screen.findByRole('heading', { level: 1 });
};

const change = (label: string, value: string) =>
  act(async () => {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  });
const click = (el: HTMLElement) =>
  act(async () => {
    fireEvent.click(el);
  });
const tab = (name: string) => click(screen.getByRole('tab', { name }));
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const flush = (ms = 80) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
const paragraphs = () => (screen.queryAllByLabelText(/^Paragraf \d+$/) as HTMLTextAreaElement[]).map((p) => p.value);

describe('save feedback', () => {
  it('lists errors, jumps to the first invalid tab and focuses the field', async () => {
    await mount(<ProjectEditScreen isNew />);
    await tab('Galeri');
    await click(screen.getByRole('button', { name: 'Projeyi oluştur' }));
    await flush();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Bilgiler: Başlık: Başlık boş bırakılamaz.');
    expect(alert.textContent).toContain('Bilgiler: Sayfa adresi (URL): Adres boş bırakılamaz.');
    expect(screen.getByRole('tab', { name: /Bilgiler \(2 hata\)/ })).toBeTruthy();
    expect(document.activeElement).toBe(field('Başlık'));
    await click(within(alert).getByRole('button', { name: /Sayfa adresi/ }));
    await flush();
    expect(document.activeElement).toBe(field('Sayfa adresi (URL)'));
    expect(current.projects).toHaveLength(seed.projects.length);
  });

  it('shows saved and unsaved status copy', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    const status = () =>
      screen
        .getAllByRole('status')
        .map((s) => s.textContent)
        .join('|');
    expect(status()).not.toContain('Kaydedilmemiş');
    await change('Başlık', 'Yeni Başlık');
    expect(status()).toContain('Kaydedilmemiş değişiklikler');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(status()).not.toContain('Kaydedilmemiş');
    expect(status()).toContain('Proje kaydedildi. Siteye almak için üstteki Yayınla’ya basın.');
  });

  it('shows the state row and the missing-for-publish checklist', async () => {
    await mount(<ProjectEditScreen isNew />);
    expect(screen.getByText('Durum: Taslak')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Yayın için eksikler' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Galeri: kapak görseli' })).toBeTruthy();
    cleanup();
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    expect(screen.getByText('Durum: Yayında')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Yayın için eksikler' })).toBeNull();
  });

  it('fills the address from the title until the address is edited', async () => {
    await mount(<ProjectEditScreen isNew />);
    await change('Başlık', 'Çamlık Köşkü');
    expect(field('Sayfa adresi (URL)').value).toBe('camlik-kosku');
    await change('Sayfa adresi (URL)', 'elle-yazildi');
    await change('Başlık', 'Başka Ad');
    expect(field('Sayfa adresi (URL)').value).toBe('elle-yazildi');
  });
});

describe('leave guard', () => {
  const unload = () => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  };

  it('stays silent while nothing changed', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    expect(unload()).toBe(false);
    const link = screen.getByRole('link', { name: 'Tüm projelere dön' });
    link.addEventListener('click', (e) => e.preventDefault());
    await click(link);
    expect(screen.queryByText(/Sayfadan ayrılırsanız/)).toBeNull();
  });

  it('warns on unload and asks before an in-app link is followed', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await change('Başlık', 'Yeni Başlık');
    expect(unload()).toBe(true);

    const link = screen.getByRole('link', { name: 'Tüm projelere dön' });
    const followed = vi.fn((e: Event) => e.preventDefault());
    link.addEventListener('click', followed);
    await click(link);
    expect(followed).not.toHaveBeenCalled();
    const dialog = document.querySelector('dialog[open]') as HTMLElement;
    expect(within(dialog).getByText('Sayfadan ayrılırsanız bu değişiklikler kaybolur.')).toBeTruthy();
    const buttons = within(dialog).getAllByRole('button', { hidden: true });
    expect(buttons[0].textContent).toBe('Vazgeç');

    await click(buttons[0]);
    expect(followed).not.toHaveBeenCalled();
    await click(link);
    const again = document.querySelector('dialog[open]') as HTMLElement;
    await click(within(again).getByRole('button', { name: 'Değişiklikleri bırak', hidden: true }));
    expect(followed).toHaveBeenCalledTimes(1);
  });

  it('lets a saved editor leave without asking', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await change('Başlık', 'Yeni Başlık');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(unload()).toBe(false);
  });
});

describe('editor details', () => {
  it('asks before the concept switch clears location and year', async () => {
    const draft: SiteContent = {
      ...seed,
      projects: seed.projects.map((p) =>
        p.slug === 'avlulu-konut' ? { ...p, concept: false, location: 'Konum', year: 2020 } : p,
      ),
    };
    await mount(<ProjectEditScreen slug="avlulu-konut" />, draft);
    await tab('Konsept');
    await click(screen.getByRole('switch', { name: 'Konsept çalışma' }));
    let dialog = document.querySelector('dialog[open]') as HTMLElement;
    expect(within(dialog).getAllByRole('button', { hidden: true })[0].textContent).toBe('Vazgeç');
    await click(within(dialog).getByRole('button', { name: 'Vazgeç', hidden: true }));
    expect(screen.getByRole('switch', { name: 'Konsept çalışma' }).getAttribute('aria-checked')).toBe('false');
    await click(screen.getByRole('switch', { name: 'Konsept çalışma' }));
    dialog = document.querySelector('dialog[open]') as HTMLElement;
    await click(within(dialog).getByRole('button', { name: 'Konsepti aç', hidden: true }));
    expect(screen.getByRole('switch', { name: 'Konsept çalışma' }).getAttribute('aria-checked')).toBe('true');
    await tab('Bilgiler');
    expect(screen.getByText(/Konsept çalışmada konum ve yıl gösterilmez/)).toBeTruthy();
  });

  it('removes a row with an undo that restores it in place', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    const before = paragraphs();
    expect(before.length).toBeGreaterThan(1);
    await click(screen.getByRole('button', { name: '1. paragrafı kaldır' }));
    expect(paragraphs()).toEqual(before.slice(1));
    expect(screen.getByText('Kaldırıldı.')).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Geri al' }));
    expect(paragraphs()).toEqual(before);
    expect(screen.queryByText('Kaldırıldı.')).toBeNull();
  });

  it('moves rows with named inline buttons', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    const before = paragraphs();
    expect((screen.getByRole('button', { name: '1. paragrafı yukarı taşı' }) as HTMLButtonElement).disabled).toBe(true);
    await click(screen.getByRole('button', { name: '1. paragrafı aşağı taşı' }));
    expect(paragraphs().slice(0, 2)).toEqual([before[1], before[0]]);
  });

  it('uses the agreed labels', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    expect(screen.getByLabelText('Proje türü (örn. Konut)')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Yapılan hizmetler' })).toBeTruthy();
    expect(screen.getByText(/Sitede görünen adres: \/projeler\/avlulu-konut/)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Anlatım' })).toBeTruthy();
    await tab('Galeri');
    expect(screen.getByLabelText('Görsel açıklaması, bu kullanım 1')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Galeri' })).toBeTruthy();
  });
});

describe('gallery video', () => {
  const upload = (file: File) =>
    act(async () => {
      fireEvent.change(screen.getByLabelText('Video dosyası'), { target: { files: [file] } });
    });
  const file = new File(['x'], 'film.mp4', { type: 'video/mp4' });

  const originals = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };
  const stub = (create: unknown, revoke: unknown) => {
    Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true, writable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revoke, configurable: true, writable: true });
  };
  afterEach(() => stub(originals.create, originals.revoke));

  it('shows an error instead of storing a file name when object URLs are unavailable', async () => {
    stub(undefined, undefined);
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await tab('Galeri');
    await upload(file);
    expect(screen.getByRole('alert').textContent).toContain('video dosyasını açamıyor');
    expect(screen.queryByRole('button', { name: 'Videoyu kaldır' })).toBeNull();
  });

  it('undoes a removal and releases the object URL once the tab is left', async () => {
    const revoke = vi.fn();
    stub(
      vi.fn(() => 'blob:film'),
      revoke,
    );
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await tab('Galeri');
    await upload(file);
    await click(screen.getByRole('button', { name: 'Videoyu kaldır' }));
    expect(revoke).not.toHaveBeenCalled();
    await click(screen.getAllByRole('button', { name: 'Geri al' }).at(-1) as HTMLElement);
    expect(screen.getByRole('button', { name: 'Videoyu kaldır' })).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Videoyu kaldır' }));
    await tab('SEO');
    expect(revoke).toHaveBeenCalledWith('blob:film');
  });
});

describe('project list controls', () => {
  it('publishes and unpublishes from the row and tells apart the badges', async () => {
    const first = seed.projects[0];
    await mount(<ProjectsListScreen />);
    await click(screen.getByRole('switch', { name: `Yayında: ${first.title}` }));
    expect(current.projects[0].published).toBe(false);
    expect(screen.getAllByText('Taslak')).toHaveLength(1);
    await click(screen.getByRole('switch', { name: `Yayında: ${first.title}` }));
    expect(current.projects[0].published).toBe(true);
    expect(document.querySelector('.pj-badge-on')).toBeTruthy();
    expect(document.querySelector('.pj-thumb img')?.getAttribute('loading')).toBe('lazy');
  });

  it('refuses to publish an incomplete project and says what is missing', async () => {
    const draft: SiteContent = {
      ...seed,
      projects: seed.projects.map((p, i) => (i === 0 ? { ...p, published: false, categoryId: 'yok' } : p)),
    };
    await mount(<ProjectsListScreen />, draft);
    await click(screen.getByRole('switch', { name: `Yayında: ${seed.projects[0].title}` }));
    expect(screen.getByRole('alert').textContent).toContain('kategori');
    expect(current.projects[0].published).toBe(false);
  });

  it('explains an empty list and offers the first project', async () => {
    await mount(<ProjectsListScreen />, { ...seed, projects: [] });
    expect(screen.getByText('İlk projenizi ekleyince burada listelenir.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Yeni proje' }).getAttribute('href')).toBe('/yonetim/projeler/yeni');
  });
});
