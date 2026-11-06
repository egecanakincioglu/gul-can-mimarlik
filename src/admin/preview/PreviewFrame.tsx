'use client';

import { Component, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import type { SiteContent } from '@/content/types';
import { usePreviewReceiver } from './usePreviewBridge';

/** Renders the public page for the path segments with the given content, or null for an unknown path. */
export type RenderPreviewPage = (segments: string[], content: SiteContent) => ReactNode | null;

class Boundary extends Component<{ children: ReactNode; resetKey: unknown }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { resetKey: unknown }) {
    // A new draft may fix the failure; retry without remounting the healthy tree.
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? (
      <p role="alert" className="adm-preview-note">
        Önizleme bu taslakla oluşturulamadı. Eksik görsel veya bozuk bir alan olabilir.
      </p>
    ) : (
      this.props.children
    );
  }
}

/*
 * Entrance animations of the public hero start from a hidden state (clipped photo, lines below
 * their mask, faded text) and only finish after 1 to 3 seconds. In the preview the page is
 * re-rendered per edit and screenshots are taken right after load, so the hero looked black.
 * Showing the end state at once keeps the preview readable.
 */
const PREVIEW_STATIC_CSS = `.hero-aperture,.hero-aperture img,.hl-line>span,.hero-fade{animation:none!important}`;

const segmentsOf = (href: string): string[] | null => {
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  return href.split(/[?#]/)[0].split('/').filter(Boolean);
};

/** Content of the preview iframe: the public page rendered from the draft the panel posts. */
export default function PreviewFrame({ segments, render }: { segments: string[]; render: RenderPreviewPage }) {
  const content = usePreviewReceiver();
  const [path, setPath] = useState(segments);

  if (!content) {
    return (
      <p role="status" className="adm-preview-note">
        Önizleme hazırlanıyor
      </p>
    );
  }

  // Links stay inside the preview so the draft keeps rendering.
  const onClick = (e: MouseEvent) => {
    const a = e.target instanceof Element ? e.target.closest('a') : null;
    const next = a ? segmentsOf(a.getAttribute('href') ?? '') : null;
    if (!next) return;
    e.preventDefault();
    setPath(next);
  };

  const page = render(path, content);
  return (
    <div onClickCapture={onClick}>
      <style>{PREVIEW_STATIC_CSS}</style>
      <Boundary resetKey={content}>
        {page ?? (
          <p role="alert" className="adm-preview-note">
            Bu adres için önizleme yok.
          </p>
        )}
      </Boundary>
    </div>
  );
}
