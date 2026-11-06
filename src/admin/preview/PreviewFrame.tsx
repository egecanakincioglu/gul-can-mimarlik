'use client';

import { Component, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import type { SiteContent } from '@/content/types';
import { usePreviewReceiver } from './usePreviewBridge';

/** Renders the public page for the path segments with the given content, or null for an unknown path. */
export type RenderPreviewPage = (segments: string[], content: SiteContent) => ReactNode | null;

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
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
      <Boundary key={JSON.stringify(content)}>
        {page ?? (
          <p role="alert" className="adm-preview-note">
            Bu adres için önizleme yok.
          </p>
        )}
      </Boundary>
    </div>
  );
}
