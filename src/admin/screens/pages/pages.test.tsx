import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { STORAGE_NAME } from '../../store/admin-store';
import type { StorageLike } from '../../store/admin-store';
import { RATIOS, fileName, fitsRatio } from '../media/ratios';
import { AdminStoreProvider, useAdminStore } from '../../store/AdminStoreProvider';
import ContactPageScreen from './ContactPageScreen';
import HomeScreen from './HomeScreen';
import ProcessStepsScreen from './ProcessStepsScreen';
import ProjectsPageScreen from './ProjectsPageScreen';
import ServicesScreen from './ServicesScreen';
import StudioScreen from './StudioScreen';

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
  if (draft) {
    data.set(STORAGE_NAME, JSON.stringify({ version: 1, draft, published: seed, messages: [] }));
  }
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

describe('EmphasisField', () => {
  it('stores typed marks as weight 800 segments', async () => {
    await mount(<HomeScreen />);
    await change('Cümle', 'Bir *boş* alan');
    expect(current.home.intro.sentence).toEqual([{ text: 'Bir ' }, { text: 'boş', weight: 800 }, { text: ' alan' }]);
  });
});

describe('HomeScreen', () => {
  it('shows seed values and updates the draft on edit', async () => {
    await mount(<HomeScreen />);
    expect((screen.getAllByLabelText('Giriş cümlesi')[0] as HTMLTextAreaElement).value).toBe(seed.home.hero.lead);
    await change('Aşağı bağlantısı', 'Aşağı');
    expect(current.home.hero.anchor).toBe('Aşağı');
    expect(seed.home.hero.anchor).not.toBe('Aşağı');
  });

  it('lists the sections in page order and shows derived figures read-only', async () => {
    await mount(<HomeScreen />);
    const titles = Array.from(document.querySelectorAll('summary')).map((s) => s.textContent);
    expect(titles).toEqual([
      '1. Karşılama',
      '2. Giriş',
      '3. Seçili çalışmalar',
      '4. Önce / Sonra',
      '5. Malzemeler',
      '6. Hizmetler',
      '7. Süreç',
      '8. Stüdyo',
    ]);
    expect(screen.getAllByText('Otomatik, düzenlenemez.').length).toBeGreaterThan(2);
  });

  it('changes the featured project from the slot picker', async () => {
    await mount(<HomeScreen />);
    const picker = screen.getByLabelText('1. kart: proje') as HTMLSelectElement;
    expect(picker.value).toBe(seed.home.featured.slots[0].projectId);
    await change('1. kart: proje', 'kose-kafe');
    expect(current.home.featured.slots[0].projectId).toBe('kose-kafe');
    expect(current.home.featured.slots).toHaveLength(4);
  });

  it('warns for an unpublished project and does not offer it for other slots', async () => {
    const draft = {
      ...seed,
      projects: seed.projects.map((p) => (p.id === 'yamac-evi' ? { ...p, published: false } : p)),
    };
    await mount(<HomeScreen />, draft);
    expect(screen.getByText(/ana sayfada yayınlanamaz/)).toBeTruthy();
    const first = screen.getByLabelText('1. kart: proje') as HTMLSelectElement;
    expect(Array.from(first.options).map((o) => o.value)).not.toContain('yamac-evi');
  });

  it('lists only projects with complete pairs and hides the section with Gösterme', async () => {
    await mount(<HomeScreen />);
    const picker = screen.getByLabelText('Karşılaştırma çifti') as HTMLSelectElement;
    expect(Array.from(picker.options).map((o) => o.value)).toEqual(['', 'daire-yenileme']);
    await change('Karşılaştırma çifti', '');
    expect(current.home.beforeAfter.projectId).toBeNull();
    await change('Karşılaştırma çifti', 'daire-yenileme');
    expect(current.home.beforeAfter.projectId).toBe('daire-yenileme');
  });

  it('edits a materials item project and image', async () => {
    await mount(<HomeScreen />);
    await change('1. malzeme: proje', 'kose-kafe');
    expect(current.home.materials.items[0].projectId).toBe('kose-kafe');
    const square = seed.media.find(
      (m) => fitsRatio(m, RATIOS.square) && m.id !== current.home.materials.items[0].image.media,
    );
    if (!square) throw new Error('seed has no square image');
    fireEvent.click(screen.getByRole('button', { name: '1. malzeme görseli' }));
    fireEvent.click(screen.getByRole('button', { name: fileName(square.file) }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    });
    expect(current.home.materials.items[0].image.media).toBe(square.id);
  });
});

describe('ServicesScreen', () => {
  it('shows page texts and edits them', async () => {
    await mount(<ServicesScreen />);
    expect((screen.getByLabelText('Dipnot') as HTMLTextAreaElement).value).toBe(seed.servicesPage.footnote);
    await change('Dipnot', 'Yeni dipnot');
    expect(current.servicesPage.footnote).toBe('Yeni dipnot');
  });

  it('blocks deleting a category that projects use and lists the usage', async () => {
    await mount(<ServicesScreen />);
    fireEvent.click(screen.getByRole('button', { name: `Düzenle: ${seed.serviceCategories[0].name}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Kategoriyi sil' }));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Proje: ');
    expect(current.serviceCategories).toHaveLength(seed.serviceCategories.length);
  });

  it('deletes an unused category after confirmation', async () => {
    const draft: SiteContent = {
      ...seed,
      projects: seed.projects.map((p) => ({ ...p, scope: [] })),
      projectFilters: seed.projectFilters.filter((f) => f.rule.kind !== 'service'),
    };
    await mount(<ServicesScreen />, draft);
    const name = seed.serviceCategories[0].name;
    fireEvent.click(screen.getByRole('button', { name: `Düzenle: ${name}` }));
    fireEvent.click(screen.getByRole('button', { name: 'Kategoriyi sil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sil' }));
    expect(current.serviceCategories.map((c) => c.name)).not.toContain(name);
  });

  it('edits the category, validates the slug and reorders services', async () => {
    await mount(<ServicesScreen />);
    const first = seed.serviceCategories[0];
    fireEvent.click(screen.getByRole('button', { name: `Düzenle: ${first.name}` }));
    await change('Adres (slug)', 'Kötü Adres');
    expect(screen.getByText('Yalnız küçük harf, rakam ve tire kullanın.')).toBeTruthy();
    await change('Ad', 'Yeni ad');
    expect(current.serviceCategories[0].name).toBe('Yeni ad');
    await change('İlgili proje', '');
    expect(current.serviceCategories[0].projectId).toBeNull();
    const down = screen.getAllByRole('button', { name: `Aşağı taşı: ${first.services[0].name}` })[0];
    fireEvent.click(down);
    expect(current.serviceCategories[0].services[1].id).toBe(first.services[0].id);
  });

  it('reorders categories', async () => {
    await mount(<ServicesScreen />);
    fireEvent.click(screen.getByRole('button', { name: `Aşağı taşı: ${seed.serviceCategories[0].name}` }));
    expect(current.serviceCategories[1].id).toBe(seed.serviceCategories[0].id);
  });
});

describe('ProcessStepsScreen', () => {
  it('shows the count and reorders by keyboard', async () => {
    await mount(<ProcessStepsScreen />);
    expect(screen.getByText(String(seed.processSteps.length))).toBeTruthy();
    const row = document.querySelector(`[data-id="${seed.processSteps[0].id}"]`) as HTMLElement;
    fireEvent.keyDown(row, { key: 'ArrowDown', altKey: true });
    expect(current.processSteps[1].id).toBe(seed.processSteps[0].id);
    expect(current.processSteps[0].id).toBe(seed.processSteps[1].id);
  });

  it('edits a step title', async () => {
    await mount(<ProcessStepsScreen />);
    await change('1. adım', 'Yeni adım');
    expect(current.processSteps[0].title).toBe('Yeni adım');
  });
});

describe('StudioScreen', () => {
  it('shows seed values and edits text, image and principles', async () => {
    await mount(<StudioScreen />);
    expect((screen.getByLabelText('Ofis başlığı') as HTMLInputElement).value).toBe(seed.studioPage.officeHeading);
    await change('Ofis başlığı', 'Büro');
    expect(current.studioPage.officeHeading).toBe('Büro');
    await change('Görsel açıklaması', 'Yeni açıklama');
    expect(current.studioPage.image.alt).toBe('Yeni açıklama');
    await change('Görsel alt yazısı', '');
    expect(current.studioPage.imageCaption).toBeUndefined();
    const p = seed.studioPage.principles[0];
    await change(`İlke başlığı: ${p.title}`, 'Yeni');
    expect(current.studioPage.principles[0].title).toBe('Yeni');
    fireEvent.click(screen.getByRole('button', { name: `Aşağı taşı: Yeni` }));
    expect(current.studioPage.principles[1].id).toBe(p.id);
  });
});

describe('ContactPageScreen', () => {
  it('edits labels, messages and the project types', async () => {
    await mount(<ContactPageScreen />);
    expect((screen.getByLabelText('Gönder düğmesi') as HTMLInputElement).value).toBe(seed.contactPage.form.submit);
    await change('Gönder düğmesi', 'Yolla');
    expect(current.contactPage.form.submit).toBe('Yolla');
    await change('İleti: Ad', 'Adınız?');
    expect(current.contactPage.form.errors.name).toBe('Adınız?');
    await change('Alan etiketi: Telefon', 'Tel');
    expect(current.contactPage.form.fields.phone).toBe('Tel');
    fireEvent.click(screen.getByRole('button', { name: 'Tür ekle' }));
    expect(current.contactPage.form.projectTypes).toHaveLength(seed.contactPage.form.projectTypes.length + 1);
    fireEvent.click(screen.getByRole('switch', { name: 'Konum alanı' }));
    expect(current.contactPage.form.locationEnabled).toBe(!seed.contactPage.form.locationEnabled);
  });

  it('warns about an empty recipient and rejects a malformed one', async () => {
    await mount(<ContactPageScreen />);
    expect(screen.queryByText(/Mesajlar yalnız gelen kutusuna düşer/)).toBeNull();
    await change('Alıcı e-posta', 'bozuk');
    expect(screen.getByText('Geçerli bir e-posta adresi yazın.')).toBeTruthy();
    await change('Alıcı e-posta', '');
    expect(screen.getByText(/Mesajlar yalnız gelen kutusuna düşer/)).toBeTruthy();
  });
});

describe('ProjectsPageScreen', () => {
  it('shows and edits the title and lead', async () => {
    await mount(<ProjectsPageScreen />);
    expect((screen.getByLabelText('Başlık') as HTMLInputElement).value).toBe(seed.projectsPage.title);
    await change('Başlık', 'Çalışmalar');
    await change('Giriş cümlesi', 'Kısa');
    expect(current.projectsPage).toEqual({ title: 'Çalışmalar', lead: 'Kısa' });
  });

  it('flags a lead over 220 characters', async () => {
    await mount(<ProjectsPageScreen />);
    await change('Giriş cümlesi', 'a'.repeat(221));
    expect(screen.getByText('En çok 220 karakter olmalı.')).toBeTruthy();
  });
});
