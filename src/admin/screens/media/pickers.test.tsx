import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { ImageRef, MediaItem } from '@/content/types';
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

function FocalHarness({ onValue }: { onValue?: (f: { x: number; y: number }) => void }) {
  const [f, setF] = useState({ x: 50, y: 50 });
  return (
    <FocalPicker
      media={photo}
      value={f}
      onChange={(n) => {
        setF(n);
        onValue?.(n);
      }}
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

  it('accepts numeric input, clamps it and ignores empty input', () => {
    render(<FocalHarness />);
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '25' } });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('25');
    fireEvent.change(screen.getByLabelText('Y (%)'), { target: { value: '250' } });
    expect((screen.getByLabelText('Y (%)') as HTMLInputElement).value).toBe('100');
    fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '' } });
    expect((screen.getByLabelText('X (%)') as HTMLInputElement).value).toBe('25');
  });

  it('follows a pointer drag', () => {
    const seen = vi.fn();
    const { container } = render(<FocalHarness onValue={seen} />);
    const stage = container.querySelector('.mf-stage') as HTMLElement;
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    fireEvent.pointerMove(stage, { clientX: 10, clientY: 10 });
    expect(seen).not.toHaveBeenCalled();
    fireEvent.pointerDown(stage, { clientX: 100, clientY: 25 });
    expect(seen).toHaveBeenLastCalledWith({ x: 50, y: 25 });
    fireEvent.pointerMove(stage, { clientX: 150, clientY: 75 });
    expect(seen).toHaveBeenLastCalledWith({ x: 75, y: 75 });
    fireEvent.pointerUp(stage);
    fireEvent.pointerMove(stage, { clientX: 0, clientY: 0 });
    expect(seen).toHaveBeenCalledTimes(2);
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

describe('ImagePicker', () => {
  const setup = async (value: ImageRef | null = null) => {
    const content = await getContent();
    const onChange = vi.fn();
    render(
      <ImagePicker label="Kapak" value={value} media={content.media} slot={RATIOS.landscape} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Kapak/ }));
    return onChange;
  };

  it('shows the ratio label strip under the slot', async () => {
    const content = await getContent();
    render(<ImagePicker label="Kapak" value={null} media={content.media} slot={RATIOS.wide} onChange={() => {}} />);
    expect(screen.getByText('21:9 · Geniş')).not.toBeNull();
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
    fireEvent.change(screen.getByLabelText(/Bu kullanım için alt metni/), { target: { value: 'Giriş cephesi' } });
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
      <ImagePicker
        label="Kapak"
        value={{ media: 'p1-cover' }}
        media={content.media}
        slot={RATIOS.landscape}
        removable={false}
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Kapak/ }));
    expect(screen.queryByRole('button', { name: 'Görseli kaldır' })).toBeNull();
  });
});
