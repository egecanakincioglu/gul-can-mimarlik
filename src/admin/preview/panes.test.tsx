import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import EditPreviewLayout from './EditPreviewLayout';
import PreviewFrame from './PreviewFrame';
import PreviewPane, { PREVIEW_WIDTHS, defaultWidth, fitScale } from './PreviewPane';
import { DRAFT_MESSAGE, READY_MESSAGE } from './messages';

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

describe('defaultWidth', () => {
  it('uses 360 below a 768 px window and 1024 otherwise', () => {
    expect(defaultWidth(360)).toBe(360);
    expect(defaultWidth(767)).toBe(360);
    expect(defaultWidth(768)).toBe(1024);
    expect(defaultWidth(1440)).toBe(1024);
  });
});

describe('PreviewPane', () => {
  beforeEach(() => {
    stageSize(1100, 500);
    window.sessionStorage.clear();
  });

  it('labels the five widths with px and keeps the chosen width on the iframe', () => {
    render(<PreviewPane src="/yonetim/onizleme/studyo" draft={seed} />);
    expect(PREVIEW_WIDTHS).toEqual([360, 390, 768, 1024, 1440]);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('/yonetim/onizleme/studyo');
    expect(frame.style.width).toBe('1024px');
    fireEvent.click(screen.getByRole('button', { name: '390 px' }));
    expect(frame.style.width).toBe('390px');
    expect(frame.style.transform).toBe('scale(1)');
    expect(screen.getByRole('button', { name: '390 px' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('starts at 360 in a narrow window and at 1024 in a wide one, whatever the stage', () => {
    const original = window.innerWidth;
    try {
      window.innerWidth = 500;
      stageSize(340, 500);
      const narrow = render(<PreviewPane src="/x" draft={seed} />);
      expect((screen.getByTitle('Site önizlemesi') as HTMLIFrameElement).style.width).toBe('360px');
      narrow.unmount();
      window.innerWidth = 1440;
      stageSize(480, 500);
      render(<PreviewPane src="/x" draft={seed} />);
      expect((screen.getByTitle('Site önizlemesi') as HTMLIFrameElement).style.width).toBe('1024px');
    } finally {
      window.innerWidth = original;
    }
  });

  it('scales the iframe down when the pane is narrower than the chosen viewport', () => {
    stageSize(600, 500);
    render(<PreviewPane src="/x" draft={seed} />);
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    fireEvent.click(screen.getByRole('button', { name: '1440 px' }));
    expect(frame.style.width).toBe('1440px');
    expect(Number(frame.dataset.scale)).toBeCloseTo(600 / 1440);
    expect(parseFloat(frame.style.height)).toBeCloseTo(500 / (600 / 1440));
  });

  it('remembers the chosen width for the session', () => {
    const first = render(<PreviewPane src="/x" draft={seed} />);
    fireEvent.click(screen.getByRole('button', { name: '768 px' }));
    first.unmount();
    render(<PreviewPane src="/y" draft={seed} />);
    expect((screen.getByTitle('Site önizlemesi') as HTMLIFrameElement).style.width).toBe('768px');
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
    stageSize(600, 500);
    render(<PreviewPane src="/x" draft={seed} />);
    fireEvent.click(screen.getByRole('button', { name: '1024 px' }));
    const frame = screen.getByTitle('Site önizlemesi') as HTMLIFrameElement;
    expect(Number(frame.dataset.scale)).toBeCloseTo(600 / 1024);
    act(() => notify([{ contentRect: { width: 2048, height: 500 } } as ResizeObserverEntry], {} as ResizeObserver));
    expect(frame.dataset.scale).toBe('1');
  });

  it('shows a loading note until the frame is ready, and reloads on request', () => {
    render(<PreviewPane src="/x" draft={seed} />);
    expect(screen.getByRole('status').textContent).toBe('Önizleme yükleniyor…');
    const frame = screen.getByTitle('Site önizlemesi');
    const win = (frame as HTMLIFrameElement).contentWindow as Window;
    vi.spyOn(win, 'postMessage').mockImplementation(() => {});
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', { data: { type: READY_MESSAGE }, origin: window.location.origin, source: win }),
      );
    });
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Önizlemeyi yenile' }));
    expect(screen.getByRole('status').textContent).toBe('Önizleme yükleniyor…');
    expect(screen.getByTitle('Site önizlemesi')).not.toBe(frame);
  });

  it('keeps the same iframe when the draft changes', () => {
    const { rerender } = render(<PreviewPane src="/x" draft={seed} />);
    const frame = screen.getByTitle('Site önizlemesi');
    rerender(<PreviewPane src="/x" draft={{ ...seed, site: { ...seed.site, name: 'Yeni' } }} />);
    expect(screen.getByTitle('Site önizlemesi')).toBe(frame);
  });
});

describe('EditPreviewLayout', () => {
  const media = (matches: boolean) =>
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

  it('toggles between editor and preview', () => {
    media(false);
    const { container } = render(<EditPreviewLayout editor={<p>Editör</p>} preview={<p>Önizleme</p>} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.mode).toBe('edit');
    fireEvent.click(screen.getByRole('button', { name: 'Önizle' }));
    expect(root.dataset.mode).toBe('preview');
    expect(screen.getByRole('button', { name: 'Önizle' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    expect(root.dataset.mode).toBe('edit');
  });

  it('mounts the preview only while it is visible', () => {
    media(false);
    render(<EditPreviewLayout editor={<p>Editör</p>} preview={<p>Önizleme</p>} />);
    expect(screen.queryByText('Önizleme')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Önizle' }));
    expect(screen.getByText('Önizleme')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    expect(screen.queryByText('Önizleme')).toBeNull();
  });

  it('mounts the preview beside the editor on wide screens', () => {
    media(true);
    render(<EditPreviewLayout editor={<p>Editör</p>} preview={<p>Önizleme</p>} />);
    expect(screen.getByText('Önizleme')).toBeTruthy();
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

  it('does not remount the page when the draft changes', () => {
    render(<PreviewFrame segments={['studyo']} render={fakePages} />);
    send(seed);
    const heading = screen.getByRole('heading');
    send({ ...seed, site: { ...seed.site, name: 'Yeni' } });
    expect(screen.getByRole('heading')).toBe(heading);
    expect(heading.textContent).toBe('Stüdyo Yeni');
  });

  it('retries after a failed render when the draft changes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('Unknown media');
    };
    const flaky = (_: string[], c: SiteContent) => (c.site.name === 'Bozuk' ? <Broken /> : <h1>Tamam</h1>);
    render(<PreviewFrame segments={['studyo']} render={flaky} />);
    send({ ...seed, site: { ...seed.site, name: 'Bozuk' } });
    expect(screen.getByRole('alert').textContent).toContain('oluşturulamadı');
    send({ ...seed, site: { ...seed.site, name: 'Düzgün' } });
    expect(screen.getByRole('heading').textContent).toBe('Tamam');
  });

  it('shows the hero in its final state at once', () => {
    const { container } = render(<PreviewFrame segments={['studyo']} render={fakePages} />);
    send(seed);
    expect(container.querySelector('style')?.textContent).toContain('.hero-aperture');
  });
});
