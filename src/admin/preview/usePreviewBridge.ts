'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { SiteContent } from '@/content/types';
import { DRAFT_MESSAGE, READY_MESSAGE, parsePreviewMessage } from './messages';

export const PREVIEW_DEBOUNCE_MS = 250;

const ownOrigin = () => window.location.origin;

/**
 * Panel side: posts the draft to the preview iframe after a pause in edits,
 * and again whenever the iframe announces it is ready. Returns whether the
 * iframe has announced itself since `reset` was last called.
 */
export function usePreviewBridge(
  frame: RefObject<HTMLIFrameElement | null>,
  draft: SiteContent,
  delay = PREVIEW_DEBOUNCE_MS,
): { ready: boolean; reset: () => void } {
  const [ready, setReady] = useState(false);
  const latest = useRef(draft);
  useEffect(() => {
    latest.current = draft;
  }, [draft]);

  useEffect(() => {
    const send = () => {
      frame.current?.contentWindow?.postMessage({ type: DRAFT_MESSAGE, content: latest.current }, ownOrigin());
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ownOrigin() || e.source !== frame.current?.contentWindow) return;
      if (parsePreviewMessage(e.data)?.type !== READY_MESSAGE) return;
      setReady(true);
      send();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [frame]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      frame.current?.contentWindow?.postMessage({ type: DRAFT_MESSAGE, content: draft }, ownOrigin());
    }, delay);
    return () => window.clearTimeout(timer);
  }, [frame, draft, delay]);

  return { ready, reset: () => setReady(false) };
}

/** Preview side: announces readiness to the panel and returns the latest draft received. */
export function usePreviewReceiver(): SiteContent | null {
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== ownOrigin() || e.source !== window.parent) return;
      const msg = parsePreviewMessage(e.data);
      if (msg?.type === DRAFT_MESSAGE) setContent(msg.content);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: READY_MESSAGE }, ownOrigin());
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return content;
}
