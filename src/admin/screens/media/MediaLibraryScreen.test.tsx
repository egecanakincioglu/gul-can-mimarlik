import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
const savedMedia = () => {
  // The store debounces writes; leaving the page flushes them.
  act(() => {
    window.dispatchEvent(new Event('pagehide'));
  });
  return (
    JSON.parse(saved) as {
      draft: { media: { id: string; alt: string; decorative?: boolean; focal?: { x: number; y: number } }[] };
    }
  ).draft.media;
};

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
    const alt = screen.getByLabelText('Görsel açıklaması');
    fireEvent.change(alt, { target: { value: '' } });
    expect(screen.getByText(/Görsel açıklaması zorunlu/)).not.toBeNull();
    expect(alt.getAttribute('aria-invalid')).toBe('true');

    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    expect(screen.queryByText(/Görsel açıklaması zorunlu/)).toBeNull();
    fireEvent.click(screen.getByRole('switch', { name: 'Dekoratif' }));
    expect(screen.getByText(/Görsel açıklaması zorunlu/)).not.toBeNull();

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
    expect(screen.getByRole('status').textContent).toBe('Yüklendi. Şimdi görsel açıklamasını yazın.');
    expect(screen.getByText(/Görsel açıklaması zorunlu/)).not.toBeNull();
    expect(screen.getByRole('button', { name: /Yeni Görsel\.png/ })).not.toBeNull();

    const del = within(panel).getByRole('button', { name: 'Sil' });
    expect((del as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(del);
    fireEvent.click(screen.getByRole('button', { name: 'Evet, sil' }));
    await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull());
    expect(screen.queryByRole('button', { name: /Yeni Görsel\.png/ })).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:demo-1');
  });

  it('rejects files that are not images', async () => {
    await renderScreen();
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'not.txt', { type: 'text/plain' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toMatch('not.txt bir görsel dosyası değil.');
    expect(screen.getByRole('status').textContent).toBe('');
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

  it('loads grid and list images lazily', async () => {
    await renderScreen();
    const grid = screen.getByRole('list', { name: 'Görseller' });
    for (const img of Array.from(grid.querySelectorAll('img'))) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Liste' }));
    const thumb = screen.getByRole('table').querySelector('img') as HTMLImageElement;
    expect(thumb.getAttribute('loading')).toBe('lazy');
  });

  it('moves focus to the detail heading on select and back to the tile on Listeye dön', async () => {
    await renderScreen();
    const tile = screen.getByRole('button', { name: /hero-poster\.png/ });
    fireEvent.click(tile);
    const panel = screen.getByRole('complementary', { name: 'Medya ayrıntıları' });
    expect(document.activeElement).toBe(within(panel).getByRole('heading', { level: 2 }));
    fireEvent.click(within(panel).getByRole('button', { name: 'Listeye dön' }));
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /hero-poster\.png/ }));
  });

  it('puts Vazgeç first in the delete dialog and focuses the next tile after deleting', async () => {
    await renderScreen();
    await upload();
    fireEvent.click(screen.getByRole('button', { name: 'Sil' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    const buttons = within(dialog).getAllByRole('button', { hidden: true });
    expect(buttons.map((b) => b.textContent)).toEqual(['Vazgeç', 'Evet, sil']);
    fireEvent.click(screen.getByRole('button', { name: 'Evet, sil' }));
    await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull());
    const tiles = within(screen.getByRole('list', { name: 'Görseller' })).getAllByRole('button');
    expect(document.activeElement).toBe(tiles[tiles.length - 1]);
  });

  it('focuses the upload button after deleting the last visible tile', async () => {
    await renderScreen();
    await upload();
    fireEvent.click(screen.getByLabelText('Yalnız açıklaması eksikler'));
    fireEvent.click(screen.getByRole('button', { name: 'Sil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Evet, sil' }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dosya seç' })));
  });

  it('announces the upload and focuses the description of the new item', async () => {
    await renderScreen();
    await upload();
    expect(screen.getByRole('status').textContent).toBe('Yüklendi. Şimdi görsel açıklamasını yazın.');
    expect(document.activeElement).toBe(screen.getByLabelText('Görsel açıklaması'));
  });

  it('flags tiles without a description and filters to them', async () => {
    await renderScreen();
    expect(screen.queryByText('Açıklaması eksik')).toBeNull();
    await upload();
    expect(screen.getAllByText('Açıklaması eksik')).toHaveLength(1);
    fireEvent.click(screen.getByLabelText('Yalnız açıklaması eksikler'));
    const tiles = within(screen.getByRole('list', { name: 'Görseller' })).getAllByRole('button');
    expect(tiles).toHaveLength(1);
    expect(tiles[0]!.textContent).toMatch(/Yeni Görsel\.png/);
  });

  it('keeps a drag local and commits the focal point once the pointer is released', async () => {
    await renderScreen();
    fireEvent.click(screen.getByRole('button', { name: /hero-poster\.png/ }));
    const stage = document.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    const marker = screen.getByRole('button', { name: 'Odak noktası' });
    fireEvent.pointerDown(marker, { clientX: 100, clientY: 50, isPrimary: true, button: 0 });
    fireEvent.pointerMove(marker, { clientX: 20, clientY: 20, isPrimary: true });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('10');
    expect(savedMedia().find((m) => m.id === 'hero-poster')?.focal).not.toEqual({ x: 10, y: 20 });
    fireEvent.pointerUp(marker);
    expect(savedMedia().find((m) => m.id === 'hero-poster')).toMatchObject({ focal: { x: 10, y: 20 } });
  });
});
