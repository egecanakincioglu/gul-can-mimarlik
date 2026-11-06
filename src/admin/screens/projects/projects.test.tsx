import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { AdminStoreProvider, useAdminStore } from '../../store/AdminStoreProvider';
import { STORAGE_NAME } from '../../store/admin-store';
import type { StorageLike } from '../../store/admin-store';
import CategoriesScreen from './CategoriesScreen';
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

describe('new project', () => {
  it('starts empty, with no sample text and no rows', async () => {
    await mount(<ProjectEditScreen isNew />);
    expect(field('Başlık').value).toBe('');
    expect(field('Adres (slug)').value).toBe('');
    expect(field('Özet').value).toBe('');
    expect(screen.queryByLabelText('Paragraf 1')).toBeNull();
    expect(screen.getByRole('switch', { name: 'Yayında' }).getAttribute('aria-checked')).toBe('false');
    expect((screen.getByRole('button', { name: 'Projeyi oluştur' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('generates the address from the title with Turkish letters transliterated', async () => {
    await mount(<ProjectEditScreen isNew />);
    await change('Başlık', 'Çamlık Köşkü');
    await click(screen.getByRole('button', { name: 'Başlıktan üret' }));
    expect(field('Adres (slug)').value).toBe('camlik-kosku');
  });

  it('shows slug errors for reserved and taken addresses', async () => {
    await mount(<ProjectEditScreen isNew />);
    await change('Adres (slug)', 'yeni');
    expect(screen.getByText(/ayrılmış bir adres/)).toBeTruthy();
    await change('Adres (slug)', 'avlulu-konut');
    expect(screen.getByText('Bu adres başka bir projede var.')).toBeTruthy();
    await change('Adres (slug)', 'iyi-adres');
    expect(screen.queryByText(/ayrılmış|başka bir projede/)).toBeNull();
  });

  it('refuses to publish while things are missing and lists them', async () => {
    await mount(<ProjectEditScreen isNew />);
    await click(screen.getByRole('switch', { name: 'Yayında' }));
    expect(screen.getByRole('switch', { name: 'Yayında' }).getAttribute('aria-checked')).toBe('false');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Yayınlamak için eksik');
    expect(alert.textContent).toContain('kapak görseli');
    expect(alert.textContent).toContain('kategori');
  });

  it('creates a draft project in the content and reports its address', async () => {
    const onSaved = vi.fn();
    await mount(<ProjectEditScreen isNew onSaved={onSaved} />);
    await change('Başlık', 'Sahil Evi');
    await click(screen.getByRole('button', { name: 'Başlıktan üret' }));
    await click(screen.getByRole('button', { name: 'Projeyi oluştur' }));
    const created = current.projects.find((p) => p.slug === 'sahil-evi');
    expect(created?.published).toBe(false);
    expect(created?.title).toBe('Sahil Evi');
    expect(created?.summary).toBe('');
    expect(onSaved).toHaveBeenCalledWith('sahil-evi');
  });

  it('hides location and year when the concept switch is on', async () => {
    await mount(<ProjectEditScreen isNew />);
    expect(screen.getByLabelText('Konum')).toBeTruthy();
    await tab('Konsept');
    await click(screen.getByRole('switch', { name: 'Konsept çalışma' }));
    await tab('Bilgiler');
    expect(screen.queryByLabelText('Konum')).toBeNull();
  });
});

describe('existing project', () => {
  it('does not change the content until it is saved', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await change('Başlık', 'Yeni Başlık');
    expect(current.projects[0].title).toBe(seed.projects[0].title);
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[0].title).toBe('Yeni Başlık');
  });

  it('reorders gallery rows from the keyboard', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await tab('Galeri');
    const rows = document.querySelectorAll('.adm-sortable-row');
    expect(rows.length).toBeGreaterThan(1);
    await act(async () => {
      fireEvent.keyDown(rows[0], { key: 'ArrowDown', altKey: true });
    });
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    const before = seed.projects[0].gallery.map((g) => g.image.media);
    const after = current.projects[0].gallery.map((g) => g.image.media);
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it('requires both pair images or none', async () => {
    await mount(<ProjectEditScreen slug="daire-yenileme" />);
    await tab('Önce/Sonra');
    await click(screen.getByRole('button', { name: /^Önce görseli/ }));
    await click(screen.getByRole('button', { name: 'Görseli kaldır' }));
    expect(screen.getByRole('alert').textContent).toContain('birlikte');
    expect((screen.getByRole('button', { name: 'Kaydet' }) as HTMLButtonElement).disabled).toBe(true);

    await click(screen.getByRole('button', { name: /^Sonra görseli/ }));
    await click(screen.getByRole('button', { name: 'Görseli kaldır' }));
    expect(screen.queryByRole('alert')).toBeNull();
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[1].beforeAfter).toBeUndefined();
  });

  it('saves the before/after format only when it is the toggle', async () => {
    await mount(<ProjectEditScreen slug="daire-yenileme" />);
    await tab('Önce/Sonra');
    await change('Biçim', 'toggle');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[1].beforeAfter?.mode).toBe('toggle');
    await change('Biçim', 'slider');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[1].beforeAfter).not.toHaveProperty('mode');
  });

  it('asks before changing the address of a published project and adds a redirect', async () => {
    await mount(<ProjectEditScreen slug="daire-yenileme" />);
    await change('Adres (slug)', 'daire-donusumu');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[1].slug).toBe('daire-yenileme');
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(within(dialog).getByText(/otomatik olarak yeni adrese/)).toBeTruthy();
    await click(within(dialog).getByRole('button', { name: 'Adresi değiştir', hidden: true }));
    expect(current.projects[1].slug).toBe('daire-donusumu');
    expect(current.redirects).toContainEqual(
      expect.objectContaining({ from: '/projeler/daire-yenileme', to: '/projeler/daire-donusumu' }),
    );
  });

  it('changes the address of a draft project without a redirect', async () => {
    const draft: SiteContent = {
      ...seed,
      projects: seed.projects.map((p) => (p.id === 'kose-kafe' ? { ...p, published: false } : p)),
    };
    await mount(<ProjectEditScreen slug="kose-kafe" />, draft);
    await change('Adres (slug)', 'kose-kahve');
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects.find((p) => p.id === 'kose-kafe')?.slug).toBe('kose-kahve');
    expect(current.redirects).toHaveLength(seed.redirects.length);
  });

  it('shows a not-found message for an unknown address', async () => {
    await mount(<ProjectEditScreen slug="yok" />);
    expect(screen.getByText('Bu adreste bir proje yok.')).toBeTruthy();
  });

  it('warns about SEO lengths without blocking', async () => {
    await mount(<ProjectEditScreen slug="avlulu-konut" />);
    await tab('SEO');
    await change('SEO başlığı', 'Kısa');
    expect(screen.getByText(/10-60 karakter önerilir/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Kaydet' }) as HTMLButtonElement).disabled).toBe(false);
    await click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(current.projects[0].seo?.title).toBe('Kısa');
  });
});

describe('ProjectsListScreen', () => {
  const titles = () => Array.from(document.querySelectorAll('.pj-row-main a')).map((a) => a.textContent);

  it('lists projects with status and a link to create one', async () => {
    await mount(<ProjectsListScreen />);
    expect(titles()).toEqual(seed.projects.map((p) => p.title));
    expect(screen.getAllByText('Yayında').length).toBe(seed.projects.length);
    expect(screen.getByRole('link', { name: 'Yeni proje' }).getAttribute('href')).toBe('/yonetim/projeler/yeni');
  });

  it('filters by search and category', async () => {
    await mount(<ProjectsListScreen />);
    await change('Ara', 'avlulu');
    expect(titles()).toEqual(['Avlulu Konut']);
    await change('Ara', '');
    await change('Kategori', 'ic-mimarlik');
    expect(titles()).toEqual(seed.projects.filter((p) => p.categoryId === 'ic-mimarlik').map((p) => p.title));
  });

  it('moves a project and stores the new order', async () => {
    await mount(<ProjectsListScreen />);
    await click(screen.getByRole('button', { name: `Aşağı taşı: ${seed.projects[0].title}` }));
    expect(current.projects.map((p) => p.id).slice(0, 2)).toEqual([seed.projects[1].id, seed.projects[0].id]);
  });
});

describe('CategoriesScreen', () => {
  it('blocks deleting a category that is in use and lists where', async () => {
    await mount(<CategoriesScreen />);
    await click(screen.getByRole('button', { name: 'Kategoriyi sil: Mimari' }));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Proje: Avlulu Konut');
    expect(alert.textContent).toContain('Filtre: Mimari');
    expect(current.projectCategories).toHaveLength(seed.projectCategories.length);
  });

  it('deletes an unused category after confirmation', async () => {
    await mount(<CategoriesScreen />);
    await click(screen.getByRole('button', { name: 'Kategori ekle' }));
    expect(current.projectCategories).toHaveLength(seed.projectCategories.length + 1);
    await change('Kategori adı: kategori-1', 'Deneme');
    await click(screen.getByRole('button', { name: 'Kategoriyi sil: Deneme' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    await click(within(dialog).getByRole('button', { name: 'Sil', hidden: true }));
    expect(current.projectCategories).toHaveLength(seed.projectCategories.length);
  });

  it('shows filter rules as text and keeps the all-projects filter', async () => {
    await mount(<CategoriesScreen />);
    expect(screen.getByText('Tüm projeler')).toBeTruthy();
    expect(screen.getByText(/Kapsamında uygulama olan projeler/)).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Filtreyi sil: Tümü' }));
    expect(screen.getByRole('alert').textContent).toContain('Tümü silinemez');
    expect(current.projectFilters.some((f) => f.rule.kind === 'all')).toBe(true);
  });

  it('flags a filter address that is not valid', async () => {
    await mount(<CategoriesScreen />);
    await change('Filtre adresi: mimari', 'Büyük Harf');
    expect(screen.getByText('Yalnız küçük harf, rakam ve tire kullanın.')).toBeTruthy();
  });

  it('reorders categories', async () => {
    await mount(<CategoriesScreen />);
    await click(screen.getAllByRole('button', { name: 'Aşağı taşı: Mimari' })[0]);
    expect(current.projectCategories[0].id).toBe(seed.projectCategories[1].id);
  });
});
