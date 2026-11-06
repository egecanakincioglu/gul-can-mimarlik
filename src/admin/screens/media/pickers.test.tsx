import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { ImageRef, MediaItem } from '@/content/types';
import { AdminStoreProvider, useAdminStore } from '../../store/AdminStoreProvider';
import FocalPicker, { cropBox } from './FocalPicker.tsx';
import ImagePicker from './ImagePicker.tsx';
import { RATIOS } from './ratios.ts';

afterEach(cleanup);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const photo: MediaItem = {
  id: 'a',
  file: '/images/a.png',
  width: 1500,
  height: 1000,
  alt: 'Örnek',
  focal: { x: 50, y: 50 },
  illustrative: null,
};

function FocalHarness({
  onValue,
  onCommit,
}: {
  onValue?: (f: { x: number; y: number }) => void;
  onCommit?: (f: { x: number; y: number }) => void;
}) {
  const [f, setF] = useState({ x: 50, y: 50 });
  return (
    <FocalPicker
      media={photo}
      value={f}
      onChange={(n) => {
        setF(n);
        onValue?.(n);
      }}
      onCommit={onCommit}
      ratios={[RATIOS.wide, RATIOS.portrait]}
      alt=""
    />
  );
}

describe('FocalPicker', () => {
  it('moves with arrows by 1 and with Shift by 10, clamped to 0..100', () => {
    render(<FocalHarness />);
    const marker = screen.getByRole('button', { name: 'Odak noktası' });
    fireEvent.keyDown(marker, { key: 'ArrowRight' });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('51');
    fireEvent.keyDown(marker, { key: 'ArrowDown', shiftKey: true });
    expect((screen.getByLabelText('Y (%)') as HTMLInputElement).value).toBe('60');
    for (let i = 0; i < 7; i += 1) fireEvent.keyDown(marker, { key: 'ArrowLeft', shiftKey: true });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('0');
    fireEvent.keyDown(marker, { key: 'a' });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('0');
  });

  it('accepts numeric input, clamps it and lets the field be cleared while typing', () => {
    render(<FocalHarness />);
    const x = screen.getByLabelText('X (%)') as HTMLInputElement;
    fireEvent.change(x, { target: { value: '25' } });
    expect(x.value).toBe('25');
    fireEvent.change(screen.getByLabelText('Y (%)'), { target: { value: '250' } });
    expect((screen.getByLabelText('Y (%)') as HTMLInputElement).value).toBe('100');
    fireEvent.change(x, { target: { value: '' } });
    expect(x.value).toBe('');
    fireEvent.blur(x);
    expect(x.value).toBe('25');
  });

  it('sets the point from a tap on the stage and commits it', () => {
    const seen = vi.fn();
    const committed = vi.fn();
    const { container } = render(<FocalHarness onValue={seen} onCommit={committed} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    fireEvent.click(stage, { clientX: 100, clientY: 25 });
    expect(seen).toHaveBeenLastCalledWith({ x: 50, y: 25 });
    expect(committed).toHaveBeenLastCalledWith({ x: 50, y: 25 });
  });

  it('drags only from the handle, committing once on release', () => {
    const seen = vi.fn();
    const committed = vi.fn();
    const { container } = render(<FocalHarness onValue={seen} onCommit={committed} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    const handle = screen.getByRole('button', { name: 'Odak noktası' });
    fireEvent.pointerMove(handle, { clientX: 10, clientY: 10, isPrimary: true });
    fireEvent.pointerDown(stage, { clientX: 100, clientY: 25, isPrimary: true, button: 0 });
    expect(seen).not.toHaveBeenCalled();
    fireEvent.pointerDown(handle, { clientX: 100, clientY: 50, isPrimary: true, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 150, clientY: 75, isPrimary: true });
    expect(seen).toHaveBeenLastCalledWith({ x: 75, y: 75 });
    expect(committed).not.toHaveBeenCalled();
    fireEvent.pointerUp(handle);
    fireEvent.pointerUp(handle);
    expect(committed).toHaveBeenCalledOnce();
    expect(committed).toHaveBeenLastCalledWith({ x: 75, y: 75 });
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 0, isPrimary: true });
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('commits when the pointer capture is lost', () => {
    const committed = vi.fn();
    const { container } = render(<FocalHarness onCommit={committed} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    const handle = screen.getByRole('button', { name: 'Odak noktası' });
    fireEvent.pointerDown(handle, { isPrimary: true, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 40, clientY: 50, isPrimary: true });
    fireEvent.lostPointerCapture(handle);
    expect(committed).toHaveBeenCalledWith({ x: 20, y: 50 });
  });

  it('ignores non-primary pointers and non-left buttons on the handle', () => {
    const seen = vi.fn();
    const { container } = render(<FocalHarness onValue={seen} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    const handle = screen.getByRole('button', { name: 'Odak noktası' });
    fireEvent.pointerDown(handle, { isPrimary: false, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 150, clientY: 75, isPrimary: true });
    fireEvent.pointerUp(handle);
    fireEvent.pointerDown(handle, { isPrimary: true, button: 2 });
    fireEvent.pointerMove(handle, { clientX: 150, clientY: 75, isPrimary: true });
    expect(seen).not.toHaveBeenCalled();
  });

  it('does not report a change when the clamped value equals the current one', () => {
    const seen = vi.fn();
    const { container } = render(<FocalHarness onValue={seen} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    fireEvent.click(stage, { clientX: 100.2, clientY: 50.1 });
    expect(seen).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '50' } });
    expect(seen).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '20' } });
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('shows a crop strip for every used ratio and a crop box for the first', () => {
    render(<FocalHarness />);
    const strip = screen.getByRole('list', { name: 'Kırpma önizlemeleri' });
    expect(
      within(strip)
        .getAllByRole('img')
        .map((e) => e.getAttribute('aria-label')),
    ).toEqual(['21:9 kırpma', '4:5 kırpma']);
    expect(screen.getByTestId('crop-box')).not.toBeNull();
  });

  it('computes the crop box inside the image', () => {
    const wide = cropBox(photo, 21 / 9, { x: 50, y: 0 });
    expect(wide.width).toBe(100);
    expect(wide.top).toBe(0);
    const tall = cropBox(photo, 4 / 5, { x: 100, y: 50 });
    expect(tall.height).toBe(100);
    expect(tall.left + tall.width).toBeCloseTo(100);
  });
});

const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

describe('ImagePicker', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:picker-1');
    URL.revokeObjectURL = vi.fn();
    class FakeImage {
      naturalWidth = 1500;
      naturalHeight = 1000;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);
  });

  const setup = async (value: ImageRef | null = null) => {
    const content = await getContent();
    const onChange = vi.fn();
    render(
      <AdminStoreProvider storage={storage}>
        <ImagePicker label="Kapak" value={value} media={content.media} slot={RATIOS.landscape} onChange={onChange} />
      </AdminStoreProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /Kapak/ }));
    return onChange;
  };

  it('shows the ratio label strip under the slot', async () => {
    const content = await getContent();
    render(
      <AdminStoreProvider storage={storage}>
        <ImagePicker label="Kapak" value={null} media={content.media} slot={RATIOS.wide} onChange={() => {}} />
      </AdminStoreProvider>,
    );
    expect(await screen.findByText('21:9 · Geniş')).not.toBeNull();
  });

  it('blocks unfit items with a reason and returns an ImageRef for a fit one', async () => {
    const onChange = await setup();
    const unfit = screen.getByRole('button', { name: 'hero-poster-m.png' });
    expect(unfit.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(unfit);
    expect(screen.queryByText('Seçili')).toBeNull();
    expect(screen.getAllByText(/Oran uymuyor/).length).toBeGreaterThan(0);

    const fit = screen.getByRole('button', { name: 'p1-cover.png' });
    expect(fit.getAttribute('aria-disabled')).toBeNull();
    fireEvent.click(fit);
    expect(screen.getByText('Seçili')).not.toBeNull();
    fireEvent.change(screen.getByLabelText(/Bu sayfada farklı açıklama/), { target: { value: 'Giriş cephesi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Odak noktası' }));
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]![0]).toMatchObject({ media: 'p1-cover', alt: 'Giriş cephesi', focal: { x: 30 } });
  });

  it('returns a bare reference when no override is typed and can clear the image', async () => {
    const onChange = await setup({ media: 'p1-cover' });
    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    expect(onChange).toHaveBeenLastCalledWith({ media: 'p1-cover' });
    fireEvent.click(screen.getByRole('button', { name: /Kapak/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Görseli kaldır' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('links each unfit item to its reason', async () => {
    await setup();
    const unfit = screen.getByRole('button', { name: 'hero-poster-m.png' });
    const reason = document.getElementById(unfit.getAttribute('aria-describedby') ?? '');
    expect(reason?.textContent).toMatch(/Oran uymuyor/);
    expect(screen.getByRole('button', { name: 'p1-cover.png' }).getAttribute('aria-describedby')).toBeNull();
  });

  it('hides the remove action when the slot is required', async () => {
    const content = await getContent();
    render(
      <AdminStoreProvider storage={storage}>
        <ImagePicker
          label="Kapak"
          value={{ media: 'p1-cover' }}
          media={content.media}
          slot={RATIOS.landscape}
          removable={false}
          onChange={() => {}}
        />
      </AdminStoreProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /Kapak/ }));
    expect(screen.queryByRole('button', { name: 'Görseli kaldır' })).toBeNull();
  });

  it('names the trigger by label and state and announces the dialog', async () => {
    const content = await getContent();
    const { rerender } = render(
      <AdminStoreProvider storage={storage}>
        <ImagePicker label="Kapak" value={null} media={content.media} slot={RATIOS.landscape} onChange={() => {}} />
      </AdminStoreProvider>,
    );
    const trigger = await screen.findByRole('button', { name: 'Kapak Görsel seçilmedi' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    rerender(
      <AdminStoreProvider storage={storage}>
        <ImagePicker
          label="Kapak"
          value={{ media: 'p1-cover' }}
          media={content.media}
          slot={RATIOS.landscape}
          onChange={() => {}}
        />
      </AdminStoreProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Kapak p1-cover.png' })).not.toBeNull();
  });

  it('loads its images lazily', async () => {
    await setup({ media: 'p1-cover' });
    for (const img of Array.from(screen.getByRole('list', { name: 'Medya' }).querySelectorAll('img'))) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
    }
  });

  it('explains why Seç is disabled until an image is chosen', async () => {
    await setup();
    const choose = screen.getByRole('button', { name: 'Seç' }) as HTMLButtonElement;
    expect(choose.disabled).toBe(true);
    const reason = document.getElementById(choose.getAttribute('aria-describedby') ?? '');
    expect(reason?.textContent).toBe('Önce bir görsel seçin');
    fireEvent.click(screen.getByRole('button', { name: 'p1-cover.png' }));
    expect(screen.queryByText('Önce bir görsel seçin')).toBeNull();
    expect((screen.getByRole('button', { name: 'Seç' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('uploads into the library from the dialog and selects the new image', async () => {
    const onChange = vi.fn();
    function Harness() {
      const { draft } = useAdminStore();
      return <ImagePicker label="Kapak" value={null} media={draft.media} slot={RATIOS.landscape} onChange={onChange} />;
    }
    render(
      <AdminStoreProvider storage={storage}>
        <Harness />
      </AdminStoreProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /Kapak/ }));
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'Yeni.png', { type: 'image/png' })] },
    });
    await screen.findByText('Seçili');
    expect(screen.getByRole('status').textContent).toMatch(/^Yüklendi ve seçildi/);
    expect(screen.getAllByText('Yeni.png').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Seç' }));
    expect(onChange.mock.calls[0]![0]).toMatchObject({ media: expect.stringMatching(/^yeni-/) });
  });

  it('adds an upload that does not fit the slot but does not select it', async () => {
    class SquareImage {
      naturalWidth = 500;
      naturalHeight = 500;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', SquareImage);
    await setup();
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'kare.png', { type: 'image/png' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toMatch(/Oran uymuyor/);
    expect(screen.queryByText('Seçili')).toBeNull();
  });

  it('rejects a non-image upload', async () => {
    await setup();
    fireEvent.change(screen.getByLabelText('Görsel dosyası'), {
      target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] },
    });
    expect((await screen.findByRole('alert')).textContent).toMatch('a.txt bir görsel dosyası değil.');
  });
});
