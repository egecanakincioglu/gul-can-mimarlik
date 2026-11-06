import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { DRAFT_MESSAGE, READY_MESSAGE, parsePreviewMessage } from './messages';
import { PREVIEW_DEBOUNCE_MS, usePreviewBridge, usePreviewReceiver } from './usePreviewBridge';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const named = (name: string): SiteContent => ({ ...seed, site: { ...seed.site, name } });

function Sender({ draft }: { draft: SiteContent }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const { ready, reset } = usePreviewBridge(ref, draft);
  return (
    <>
      <iframe ref={ref} title="frame" />
      <p>{ready ? 'ready' : 'waiting'}</p>
      <button onClick={reset}>reset</button>
    </>
  );
}

function Receiver() {
  const content = usePreviewReceiver();
  return <p>{content ? content.site.name : 'none'}</p>;
}

const deliver = (data: unknown, init: { origin?: string; source?: MessageEventSource | null } = {}) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data,
        origin: init.origin ?? window.location.origin,
        source: init.source === undefined ? window : init.source,
      }),
    );
  });

describe('parsePreviewMessage', () => {
  it('accepts ready and draft messages and rejects everything else', () => {
    expect(parsePreviewMessage({ type: READY_MESSAGE })).toEqual({ type: READY_MESSAGE });
    expect(parsePreviewMessage({ type: DRAFT_MESSAGE, content: seed })?.type).toBe(DRAFT_MESSAGE);
    expect(parsePreviewMessage({ type: DRAFT_MESSAGE, content: { version: 1 } })).toBeNull();
    expect(parsePreviewMessage({ type: 'other' })).toBeNull();
    expect(parsePreviewMessage('text')).toBeNull();
    expect(parsePreviewMessage(null)).toBeNull();
  });
});

describe('receiver', () => {
  beforeEach(() => {
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });

  it('announces itself and renders the draft from the same origin', () => {
    render(<Receiver />);
    expect(window.parent.postMessage).toHaveBeenCalledWith({ type: READY_MESSAGE }, window.location.origin);
    deliver({ type: DRAFT_MESSAGE, content: named('Taslak') });
    expect(screen.getByText('Taslak')).toBeTruthy();
  });

  it('rejects a foreign origin', () => {
    render(<Receiver />);
    deliver({ type: DRAFT_MESSAGE, content: named('Yabancı') }, { origin: 'https://evil.example' });
    expect(screen.getByText('none')).toBeTruthy();
  });

  it('rejects messages from another window and malformed payloads', () => {
    render(<Receiver />);
    deliver({ type: DRAFT_MESSAGE, content: named('Başka') }, { source: null });
    deliver({ type: DRAFT_MESSAGE, content: { version: 2 } });
    deliver('garbage');
    expect(screen.getByText('none')).toBeTruthy();
  });
});

describe('sender', () => {
  const spyFrame = () => {
    const win = (screen.getByTitle('frame') as HTMLIFrameElement).contentWindow as Window;
    return { win, post: vi.spyOn(win, 'postMessage').mockImplementation(() => {}) };
  };

  it('debounces draft changes into one post', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Sender draft={seed} />);
    const { post } = spyFrame();
    rerender(<Sender draft={named('A')} />);
    act(() => void vi.advanceTimersByTime(PREVIEW_DEBOUNCE_MS - 50));
    rerender(<Sender draft={named('B')} />);
    act(() => void vi.advanceTimersByTime(PREVIEW_DEBOUNCE_MS - 50));
    expect(post).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(50));
    expect(post).toHaveBeenCalledTimes(1);
    const [msg, origin] = post.mock.calls[0] as unknown as [{ type: string; content: SiteContent }, string];
    expect(msg.type).toBe(DRAFT_MESSAGE);
    expect(msg.content.site.name).toBe('B');
    expect(origin).toBe(window.location.origin);
  });

  it('answers a ready message from its own frame immediately', () => {
    render(<Sender draft={seed} />);
    const { win, post } = spyFrame();
    deliver({ type: READY_MESSAGE }, { source: win });
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('reports readiness once the frame announces itself, until reset', () => {
    render(<Sender draft={seed} />);
    const { win } = spyFrame();
    expect(screen.getByText('waiting')).toBeTruthy();
    deliver({ type: READY_MESSAGE }, { source: win });
    expect(screen.getByText('ready')).toBeTruthy();
    act(() => screen.getByText('reset').click());
    expect(screen.getByText('waiting')).toBeTruthy();
  });

  it('ignores ready messages from a foreign origin or another window', () => {
    render(<Sender draft={seed} />);
    const { win, post } = spyFrame();
    deliver({ type: READY_MESSAGE }, { source: win, origin: 'https://evil.example' });
    deliver({ type: READY_MESSAGE }, { source: window });
    expect(post).not.toHaveBeenCalled();
  });
});
