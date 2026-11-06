import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import MediaLibraryScreen from './MediaLibraryScreen';

afterEach(cleanup);

let saved = '';
const storage = {
  getItem: () => null,
  setItem: (_: string, v: string) => {
    saved = v;
  },
  removeItem: () => {},
};
const savedMedia = () =>
  (JSON.parse(saved) as { draft: { media: { id: string; alt: string; decorative?: boolean }[] } }).draft.media;

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:demo-1');
  URL.revokeObjectURL = vi.fn();
  class FakeImage {
    naturalWidth = 800;
    naturalHeight = 600;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_: string) {
      queueMicrotask(() => this.onload?.());
    }
  }
  vi.stubGlobal('Image', FakeImage);
});

const renderScreen = async () => {
  render(
    <AdminStoreProvider storage={storage}>
      <MediaLibraryScreen />
    </AdminStoreProvider>,
  );
  await screen.findByRole('heading', { name: 'Medya kütüphanesi' });
};

const upload = async (file = new File(['x'], 'Yeni Görsel.png', { type: 'image/png' })) => {
  fireEvent.change(screen.getByLabelText('Görsel dosyası'), { target: { files: [file] } });
  await screen.findByRole('complementary', { name: 'Medya ayrıntıları' });
};

describe('MediaLibraryScreen', () => {
  it('lists media, filters by search and toggles between grid and list', async () => {
    await renderScreen();
    expect(screen.getByRole('button', { name: /hero-poster\.png/ })).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Ara'), { target: { value: 'p1-cover' } });
    expect(screen.queryByRole('button', { name: /hero-poster\.png/ })).toBeNull();
    expect(screen.getByRole('button', { name: /p1-cover\.png/ })).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Ara'), { target: { value: 'zzzz-yok' } });
    expect(screen.getByText('Aramanıza uyan görsel yok.')).not.toBeNull();
    fireEvent.change(screen.getByLabelText('Ara'), { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Liste' }));
    expect(screen.getByRole('button', { name: 'Liste' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('table')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Izgara' }));
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('blocks deleting a used image and explains why, with usage links', async () => {
    await renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /hero-poster\.png/ }));
    const panel = screen.getByRole('complementary', { name: 'Medya ayrıntıları' });
    expect((within(panel).getByRole('button', { name: 'Sil' }) as HTMLButtonElement).disabled).toBe(true);
    expect(within(panel).getByRole('note').textContent).toMatch(/kullanıldığı için silinemez/);
    expect(
      within(panel)
        .getByRole('link', { name: /Ana sayfa/ })
        .getAttribute('href'),
    ).toBe('/yonetim/ana-sayfa');
    expect(within(panel).getByText('1536×1024 px')).not.toBeNull();
  });

  it('requires an alt text unless the image is marked Dekoratif', async () => {
    await renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /hero-poster\.png/ }));
    const alt = screen.getByLabelText('Varsayılan alt metni');
    fireEvent.change(alt, { target: { value: '' } });
    expect(screen.getByText(/Alt metni zorunlu/)).not.toBeNull();
    expect(alt.getAttribute('aria-invalid')).toBe('true');

    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    expect(screen.queryByText(/Alt metni zorunlu/)).toBeNull();
    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    expect(screen.getByText(/Alt metni zorunlu/)).not.toBeNull();

    fireEvent.change(alt, { target: { value: 'a'.repeat(141) } });
    expect(screen.getByText(/en çok 140/)).not.toBeNull();
    fireEvent.change(alt, { target: { value: 'Kısa metin' } });
    expect(alt.getAttribute('aria-invalid')).toBeNull();
  });

  it('stores the Dekoratif switch on the media item and reads it back', async () => {
    await renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /hero-poster.png/ }));
    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    const item = () => savedMedia().find((m) => m.id === 'hero-poster');
    expect(item()?.decorative).toBe(true);
    expect(item()?.alt).toBe('');
    expect(screen.getByRole('switch', { name: 'Dekoratif' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    expect(item()?.decorative).toBeUndefined();
  });

  it('tells that uploads are kept in this browser only', async () => {
    await renderScreen();
    expect(screen.getByText(/yüklenen görsel bu tarayıcıda tutulur/)).not.toBeNull();
  });

  it('edits the focal point of the selected image', async () => {
    await renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /hero-poster\.png/ }));
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '12' } });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('12');
  });

  it('adds an uploaded file to the draft, shows the simulated notice, and allows deleting it', async () => {
    await renderScreen();
    await upload();
    expect(URL.createObjectURL).toHaveBeenCalled();
    const panel = screen.getByRole('complementary', { name: 'Medya ayrıntıları' });
    expect(within(panel).getByText('800×600 px')).not.toBeNull();
    expect(within(panel).getAllByText('Yeni Görsel.png').length).toBeGreaterThan(0);
    expect(within(panel).getByText('1 KB')).not.toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/Üretici üst verisi temizlendi.*simülasyon/);
    expect(screen.getByText(/Alt metni zorunlu/)).not.toBeNull();
    expect(screen.getByRole('button', { name: /Yeni Görsel\.png/ })).not.toBeNull();

    const del = within(panel).getByRole('button', { name: 'Sil' });
    expect((del as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(del);
    fireEvent.click(screen.getByRole('button', { name: 'Evet, sil' }));
    await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull());
    expect(screen.queryByRole('button', { name: /Yeni Görsel\.png/ })).toBeNull();
  });

  it('rejects files that are not images', async () => {
    await renderScreen();
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'not.txt', { type: 'text/plain' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toMatch('not.txt bir görsel dosyası değil.');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('reports a file that cannot be read as an image', async () => {
    class BrokenImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal('Image', BrokenImage);
    await renderScreen();
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'bad.png', { type: 'image/png' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toMatch('bad.png okunamadı.');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:demo-1');
  });

  it('accepts files dropped on the drop zone', async () => {
    await renderScreen();
    const zone = screen.getByText(/buraya bırakın/).closest('div') as HTMLElement;
    fireEvent.dragOver(zone);
    expect(zone.getAttribute('data-over')).not.toBeNull();
    fireEvent.drop(zone, { dataTransfer: { files: [new File(['x'], 'drop.png', { type: 'image/png' })] } });
    await screen.findByRole('complementary', { name: 'Medya ayrıntıları' });
    expect(zone.getAttribute('data-over')).toBeNull();
  });
});
