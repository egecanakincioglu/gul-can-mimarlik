import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { STORAGE_NAME } from '../../store/admin-store';
import type { StorageLike } from '../../store/admin-store';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import { RATIOS, fileName, fitsRatio } from '../media/ratios';
import ContactInfoScreen from './ContactInfoScreen';
import FooterScreen from './FooterScreen';
import NavigationScreen from './NavigationScreen';
import SeoScreen from './SeoScreen';
import SiteSettingsScreen from './SiteSettingsScreen';
import TextsScreen from './TextsScreen';

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

const memory = () => {
  const data = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
  const draft = () => {
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    return (JSON.parse(data.get(STORAGE_NAME) ?? '{}') as { draft: SiteContent }).draft;
  };
  return { storage, draft };
};

const show = async (ui: ReactNode) => {
  const m = memory();
  render(<AdminStoreProvider storage={m.storage}>{ui}</AdminStoreProvider>);
  await screen.findByRole('heading', { level: 1 });
  await act(async () => {}); // let the store subscription settle before the first event
  return m;
};

const input = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('SiteSettingsScreen', () => {
  it('shows the seed values', async () => {
    await show(<SiteSettingsScreen />);
    expect(input('Site adı').value).toBe(seed.site.name);
    expect(input('Kuruluş yılı').value).toBe(String(seed.site.founded.year));
    expect(input('Konsept rozeti').value).toBe(seed.labels.concept);
    expect(
      screen.getByText(`Telif yılı: ${new Date().getFullYear()} (her yıl kendiliğinden güncellenir)`),
    ).toBeTruthy();
  });

  it('writes the name to the draft and flags an empty one', async () => {
    const m = await show(<SiteSettingsScreen />);
    change('Site adı', 'Yeni ad');
    expect(m.draft().site.name).toBe('Yeni ad');
    change('Site adı', ' ');
    expect(screen.getByText('Bu alan boş bırakılamaz.')).toBeTruthy();
    expect(input('Site adı').getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps an invalid year out of the draft and shows why', async () => {
    const m = await show(<SiteSettingsScreen />);
    change('Kuruluş yılı', '19');
    expect(screen.getByText(/dört haneli bir yıl/)).toBeTruthy();
    expect(m.draft()?.site.founded.year ?? seed.site.founded.year).toBe(seed.site.founded.year);
    change('Kuruluş yılı', '2019');
    expect(m.draft().site.founded.year).toBe(2019);
    change('Kuruluş ayı', '3');
    expect(m.draft().site.founded.month).toBe(3);
  });

  it('switches demo mode and reports how many places it affects', async () => {
    const m = await show(<SiteSettingsScreen />);
    const count = Object.values(seed.demo).filter((t) => t.trim()).length;
    expect(screen.getByRole('status').textContent).toBe(`${count} yerde not görünür`);
    fireEvent.click(screen.getByRole('switch', { name: 'Demo modu' }));
    expect(m.draft().site.demoMode).toBe(false);
    expect(screen.getByRole('status').textContent).toBe(`${count} yerde not gizlenir`);
    change('Form notu', '');
    expect(screen.getByRole('status').textContent).toBe(`${count - 1} yerde not gizlenir`);
  });

  it('counts and limits the concept labels', async () => {
    const m = await show(<SiteSettingsScreen />);
    change('Konsept rozeti', 'x'.repeat(25));
    expect(screen.getByText('25/24')).toBeTruthy();
    expect(screen.getByText('En çok 24 karakter olabilir.')).toBeTruthy();
    change('Konsept rozeti', 'Konsept');
    expect(m.draft().labels.concept).toBe('Konsept');
  });

  it('sets and clears the share image through the picker', async () => {
    const m = await show(<SiteSettingsScreen />);
    const fit = seed.media.find((x) => fitsRatio(x, RATIOS.og));
    if (!fit) throw new Error('seed has no image for the share ratio');
    fireEvent.click(screen.getByRole('button', { name: /^Varsayılan paylaşım görseli/ }));
    fireEvent.click(screen.getByRole('button', { name: fileName(fit.file) }));
    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    await act(async () => {});
    expect(m.draft().seo.ogImage).toEqual({ media: fit.id });
    fireEvent.click(screen.getByRole('button', { name: /^Varsayılan paylaşım görseli/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Görseli kaldır' }));
    await act(async () => {});
    expect(m.draft().seo.ogImage).toBeUndefined();
  });
});

describe('ContactInfoScreen', () => {
  it('shows the seed values and the derived call link', async () => {
    await show(<ContactInfoScreen />);
    expect(input('Telefon').value).toBe(seed.contact.phone);
    expect(input('E-posta').value).toBe(seed.contact.email);
    expect(input('Adres satırı 1').value).toBe(seed.contact.address[0]);
    expect(screen.getByText(/^Arama bağlantısı: tel:\+90\d+$/)).toBeTruthy();
  });

  it('writes valid values and reports invalid phone and e-mail', async () => {
    const m = await show(<ContactInfoScreen />);
    change('Telefon', '0212 000 00 00');
    expect(m.draft().contact.phone).toBe('0212 000 00 00');
    change('Telefon', 'abc');
    expect(screen.getByText('Telefon yalnızca rakam ve boşluk içerebilir.')).toBeTruthy();
    expect(screen.queryByText(/Arama bağlantısı/)).toBeNull();
    change('E-posta', 'yanlis');
    expect(screen.getByText('Geçerli bir e-posta adresi yazın.')).toBeTruthy();
  });

  it('removes a line at once, offers undo at the same position and explains the last line', async () => {
    const m = await show(<ContactInfoScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Sil: Adres satırı 2' }));
    expect(m.draft().contact.address).toEqual(seed.contact.address.filter((_, k) => k !== 1));
    expect(screen.getByRole('status').textContent).toContain('Satır kaldırıldı.');
    fireEvent.click(screen.getByRole('button', { name: 'Geri al' }));
    expect(m.draft().contact.address).toEqual(seed.contact.address);
    expect(screen.getByRole('status').textContent).toBe('');
    expect(screen.queryByText('En az bir adres satırı gerekir.')).toBeNull();
    for (let i = seed.contact.address.length; i > 1; i--)
      fireEvent.click(screen.getByRole('button', { name: `Sil: Adres satırı ${i}` }));
    expect(screen.getByText('En az bir adres satırı gerekir.')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Sil: Adres satırı 1' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('adds and removes address lines but keeps one', async () => {
    const m = await show(<ContactInfoScreen />);
    const lines = seed.contact.address.length;
    fireEvent.click(screen.getByRole('button', { name: 'Satır ekle' }));
    expect(m.draft().contact.address).toHaveLength(lines + 1);
    expect(screen.getByText('Bu alan boş bırakılamaz.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `Sil: Adres satırı ${lines + 1}` }));
    expect(m.draft().contact.address).toEqual(seed.contact.address);
    for (let i = lines; i > 1; i--) fireEvent.click(screen.getByRole('button', { name: `Sil: Adres satırı ${i}` }));
    expect((screen.getByRole('button', { name: 'Sil: Adres satırı 1' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('NavigationScreen', () => {
  const order = (m: ReturnType<typeof memory>) => m.draft().navigation.map((n) => n.id);

  it('lists the seed links', async () => {
    await show(<NavigationScreen />);
    seed.navigation.forEach((n, i) => {
      expect(input(`Etiket (${i + 1}. öğe)`).value).toBe(n.label);
      expect(input(`Bağlantı (${i + 1}. öğe)`).value).toBe(n.href);
    });
  });

  it('is usable at any width: no wide-screen notice, labelled link fields', async () => {
    await show(<NavigationScreen />);
    expect(screen.queryByText(/geniş ekran/i)).toBeNull();
    expect(screen.queryByRole('link', { name: 'Genel bakışa dön' })).toBeNull();
    expect(screen.getAllByText('Örnek: /projeler veya https://…')).toHaveLength(seed.navigation.length);
    expect(screen.queryByLabelText(/^Adres/)).toBeNull();
  });

  it('uses the shared warning', async () => {
    await show(<NavigationScreen />);
    for (const n of seed.navigation) fireEvent.click(screen.getByRole('switch', { name: `Görünür: ${n.label}` }));
    expect(document.querySelector('.adm-notice-warning')).not.toBeNull();
  });

  it('reorders with the keyboard and the buttons', async () => {
    const m = await show(<NavigationScreen />);
    const ids = seed.navigation.map((n) => n.id);
    const first = seed.navigation[0].label;
    fireEvent.keyDown(screen.getByRole('button', { name: `Aşağı taşı: ${first}` }), { key: 'ArrowDown', altKey: true });
    expect(order(m)).toEqual([ids[1], ids[0], ...ids.slice(2)]);
    fireEvent.click(screen.getByRole('button', { name: `Yukarı taşı: ${first}` }));
    expect(order(m)).toEqual(ids);
  });

  it('toggles visibility and warns when nothing is visible', async () => {
    const m = await show(<NavigationScreen />);
    for (const n of seed.navigation) fireEvent.click(screen.getByRole('switch', { name: `Görünür: ${n.label}` }));
    expect(m.draft().navigation.every((n) => !n.visible)).toBe(true);
    expect(screen.getByText(/Hiçbir bağlantı görünür değil/)).toBeTruthy();
  });

  it('limits the label and checks the address', async () => {
    const m = await show(<NavigationScreen />);
    change('Etiket (1. öğe)', 'x'.repeat(17));
    expect(screen.getByText('17/16')).toBeTruthy();
    expect(screen.getByText('En çok 16 karakter olabilir.')).toBeTruthy();
    change('Bağlantı (1. öğe)', 'projeler');
    expect(screen.getByText(/ile başlamalıdır/)).toBeTruthy();
    change('Etiket (1. öğe)', 'Çalışmalar');
    expect(m.draft().navigation[0].label).toBe('Çalışmalar');
  });

  it('edits the mobile home label', async () => {
    const m = await show(<NavigationScreen />);
    change('Ana sayfa bağlantısı', 'Giriş');
    expect(m.draft().ui.menuHome).toBe('Giriş');
  });
});

describe('SeoScreen', () => {
  it('lists the pages and counts the warnings', async () => {
    await show(<SeoScreen />);
    const table = screen.getByRole('table', { name: 'Sayfa başlıkları ve açıklamaları' });
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(within(table).getByText('Gül CAN Mimarlık')).toBeTruthy();
    expect(input('Başlık şablonu (arama sonuçlarında)').value).toBe(seed.seo.titleTemplate);
  });

  it('is titled like the menu item and is usable at any width', async () => {
    await show(<SeoScreen />);
    expect(screen.getByRole('heading', { level: 1, name: 'Arama sonuçları (SEO)' })).toBeTruthy();
    expect(screen.queryByText(/geniş ekran/i)).toBeNull();
    expect(screen.queryByRole('link', { name: 'Genel bakışa dön' })).toBeNull();
  });

  it('opens the row editor with a search result preview', async () => {
    await show(<SeoScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle: Hizmetler' }));
    const preview = screen.getByRole('group', { name: 'Arama sonucu önizlemesi' });
    expect(preview.textContent).toContain(`Hizmetler · ${seed.site.name}`);
    expect(preview.textContent).toContain('/hizmetler');
    expect(screen.getByText('9/60')).toBeTruthy();
  });

  it('writes the page title and removes an emptied description', async () => {
    const m = await show(<SeoScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle: Stüdyo' }));
    change('Sayfa başlığı (arama sonuçlarında)', 'Stüdyomuz hakkında');
    expect(m.draft().seo.pages.studio.title).toBe('Stüdyomuz hakkında');
    change('Kısa açıklama (arama sonuçlarında)', 'x'.repeat(100));
    expect(m.draft().seo.pages.studio.description).toHaveLength(100);
    change('Kısa açıklama (arama sonuçlarında)', '');
    expect('description' in m.draft().seo.pages.studio).toBe(false);
  });

  it('warns about length without blocking the edit', async () => {
    const m = await show(<SeoScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle: İletişim' }));
    change('Sayfa başlığı (arama sonuçlarında)', 'x'.repeat(70));
    expect(document.querySelector('.adm-notice-warning')).not.toBeNull();
    expect(m.draft().seo.pages.contact.title).toHaveLength(70);
    change('Varsayılan kısa açıklama (arama sonuçlarında)', 'kısa');
    expect(screen.getByText('4/160')).toBeTruthy();
    expect(m.draft().seo.description).toBe('kısa');
  });

  it('requires the title placeholder', async () => {
    const m = await show(<SeoScreen />);
    change('Başlık şablonu (arama sonuçlarında)', 'Başlık');
    expect(screen.getByText(/%s içermelidir/)).toBeTruthy();
    expect(m.draft().seo.titleTemplate).toBe('Başlık');
  });
});

describe('TextsScreen', () => {
  const published = () => seed.projects.filter((p) => p.published).length;

  it('groups the strings and shows the seed text', async () => {
    await show(<TextsScreen />);
    for (const g of ['Genel', 'Erişilebilirlik', 'Proje', 'Önce/Sonra', 'Footer', 'Etiketler']) {
      expect(screen.getByRole('heading', { level: 2, name: g })).toBeTruthy();
    }
    expect(input('İçeriğe geç bağlantısı').value).toBe(seed.ui.skipLink);
  });

  it('shows how many places a text affects', async () => {
    await show(<TextsScreen />);
    const pages = Object.keys(seed.seo.pages).length;
    const row = screen.getByLabelText('İçeriğe geç bağlantısı').closest('tr') as HTMLElement;
    expect(within(row).getByText(`${pages + published()} yerde`)).toBeTruthy();
    const project = screen.getByLabelText('Tür').closest('tr') as HTMLElement;
    expect(within(project).getByText(`${published()} yerde`)).toBeTruthy();
  });

  it('writes an edit to the draft', async () => {
    const m = await show(<TextsScreen />);
    change('Menü düğmesi', 'Menüyü aç');
    expect(m.draft().ui.menu).toBe('Menüyü aç');
    change('Video rozeti', 'Film');
    expect(m.draft().labels.video).toBe('Film');
  });

  it('reports empty strings and unknown placeholders', async () => {
    await show(<TextsScreen />);
    change('Menü düğmesi', '');
    expect(screen.getByText('Bu alan boş bırakılamaz.')).toBeTruthy();
    change('Menü düğmesi', '{yok}');
    expect(screen.getByText(/^Bilinmeyen ifade: \{yok\}\. Kullanılabilenler: /)).toBeTruthy();
    expect(input('Menü düğmesi').getAttribute('aria-invalid')).toBe('true');
  });

  it('lists the tokens a string may use and rejects others', async () => {
    await show(<TextsScreen />);
    expect(screen.getAllByText('Bu metinde şu ifadeler otomatik doldurulur: {n}').length).toBeGreaterThan(0);
    expect(input('Gösterilen proje sayısı').getAttribute('aria-describedby')).toBeTruthy();
    change('Gösterilen proje sayısı', '{n} / {year}');
    expect(screen.getByText('Bilinmeyen ifade: {year}. Kullanılabilenler: {n}')).toBeTruthy();
    change('Gösterilen proje sayısı', '{n} proje');
    expect(screen.queryByText(/Bilinmeyen ifade/)).toBeNull();
  });
});

describe('FooterScreen', () => {
  it('shows the heading with its emphasis marks', async () => {
    await show(<FooterScreen />);
    expect(input('Başlık').value).toBe('Bir sonraki mekânı *birlikte* çizelim.');
    expect(input('Düğme metni').value).toBe(seed.footer.cta.label);
  });

  it('stores the heading as weighted segments', async () => {
    const m = await show(<FooterScreen />);
    change('Başlık', 'Hadi *çizelim*.');
    expect(m.draft().footer.ctaHeading).toEqual([{ text: 'Hadi ' }, { text: 'çizelim', weight: 800 }, { text: '.' }]);
    change('Başlık', '');
    expect(screen.getByText('Bu alan boş bırakılamaz.')).toBeTruthy();
  });

  it('edits the button and validates the address', async () => {
    const m = await show(<FooterScreen />);
    change('Düğme metni', 'Yazın');
    expect(m.draft().footer.cta.label).toBe('Yazın');
    change('Düğme bağlantısı', 'iletisim');
    expect(screen.getByText(/ile başlamalıdır/)).toBeTruthy();
  });

  it('toggles the call per page', async () => {
    const m = await show(<FooterScreen />);
    const studio = screen.getByRole('switch', { name: 'Çağrıyı göster: Stüdyo' });
    expect(studio.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(studio);
    expect(m.draft().footer.showCta.studio).toBe(true);
    expect(m.draft().footer.showCta.home).toBe(true);
    fireEvent.click(screen.getByRole('switch', { name: 'Çağrıyı göster: Proje sayfaları' }));
    expect(m.draft().footer.showCta.project).toBe(true);
  });
});
