import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import EditPreviewLayout from './EditPreviewLayout';
import PreviewFrame from './PreviewFrame';
import PreviewPane, { PREVIEW_WIDTHS, fitScale } from './PreviewPane';
import { DRAFT_MESSAGE } from './messages';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const stageSize = (w: number, h: number) => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => w });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => h });
};

describe('fitScale', () => {
  it('shrinks only when the space is narrower than the viewport', () => {
    expect(fitScale(1440, 720)).toBe(0.5);
    expect(fitScale(360, 720)).toBe(1);
    expect(fitScale(1024, 0)).toBe(1);
  });
});

describe('PreviewPane', () => {
  beforeEach(() => stageSize(600, 500));

  it('offers the five widths and keeps the chosen width on the iframe', () => {
    render(<PreviewPane src="/yonetim/onizleme/studyo" draft={seed} />);
    expect(PREVIEW_WIDTHS).toEqual([360, 390, 768, 1024, 1440]);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('/yonetim/onizleme/studyo');
    expect(frame.style.width).toBe('1024px');
    fireEvent.click(screen.getByRole('button', { name: '390' }));
    expect(frame.style.width).toBe('390px');
    expect(frame.style.transform).toBe('scale(1)');
    expect(screen.getByRole('button', { name: '390' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('scales the iframe down when the pane is narrower than the viewport', () => {
    render(<PreviewPane src="/x" draft={seed} />);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    fireEvent.click(screen.getByRole('button', { name: '1440' }));
    expect(frame.style.width).toBe('1440px');
    expect(Number(frame.dataset.scale)).toBeCloseTo(600 / 1440);
    expect(parseFloat(frame.style.height)).toBeCloseTo(500 / (600 / 1440));
  });

  it('scales the default 1024 px viewport into a narrower pane', () => {
    stageSize(500, 400);
    render(<PreviewPane src="/x" draft={seed} />);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    expect(frame.style.width).toBe('1024px');
    expect(frame.style.transform).toBe(`scale(${500 / 1024})`);
  });

  it('follows size changes of the pane', () => {
    let notify: ResizeObserverCallback = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: ResizeObserverCallback) {
          notify = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<PreviewPane src="/x" draft={seed} />);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    expect(Number(frame.dataset.scale)).toBeCloseTo(600 / 1024);
    act(() => notify([{ contentRect: { width: 2048, height: 500 } } as ResizeObserverEntry], {} as ResizeObserver));
    expect(frame.dataset.scale).toBe('1');
  });
});

describe('EditPreviewLayout', () => {
  it('toggles between editor and preview', () => {
    const { container } = render(<EditPreviewLayout editor={<p>Editör</p>} preview={<p>Önizleme</p>} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.mode).toBe('edit');
    fireEvent.click(screen.getByRole('button', { name: 'Önizle' }));
    expect(root.dataset.mode).toBe('preview');
    expect(screen.getByRole('button', { name: 'Önizle' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    expect(root.dataset.mode).toBe('edit');
  });
});

describe('PreviewFrame', () => {
  beforeEach(() => {
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  const fakePages = (segments: string[], c: SiteContent) =>
    segments[0] === 'studyo' ? (
      <div>
        <h1>Stüdyo {c.site.name}</h1>
        <a href="/iletisim">İletişim</a>
        <a href="https://example.com/">Dış</a>
      </div>
    ) : segments[0] === 'iletisim' ? (
      <h1>İletişim sayfası</h1>
    ) : null;

  const send = (content: SiteContent) =>
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: DRAFT_MESSAGE, content },
          origin: window.location.origin,
          source: window,
        }),
      );
    });

  it('waits for a draft, renders the page with it, and keeps internal links inside the preview', () => {
    render(<PreviewFrame segments={['studyo']} render={fakePages} />);
    expect(screen.getByRole('status').textContent).toBe('Önizleme hazırlanıyor');
    send({ ...seed, site: { ...seed.site, name: 'Deneme' } });
    expect(screen.getByRole('heading').textContent).toBe('Stüdyo Deneme');
    fireEvent.click(screen.getByText('Dış'));
    expect(screen.getByRole('heading').textContent).toBe('Stüdyo Deneme');
    fireEvent.click(screen.getByText('İletişim'));
    expect(screen.getByRole('heading').textContent).toBe('İletişim sayfası');
  });

  it('says so when the path has no page', () => {
    render(<PreviewFrame segments={['yok']} render={fakePages} />);
    send(seed);
    expect(screen.getByRole('alert').textContent).toContain('önizleme yok');
  });

  it('shows a notice instead of crashing when the draft cannot render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('Unknown media');
    };
    render(<PreviewFrame segments={['studyo']} render={() => <Broken />} />);
    send(seed);
    expect(screen.getByRole('alert').textContent).toContain('oluşturulamadı');
  });
});
