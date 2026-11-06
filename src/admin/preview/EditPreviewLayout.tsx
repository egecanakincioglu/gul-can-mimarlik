'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const WIDE = '(min-width: 1280px)';

const useWide = () => {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(WIDE);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return wide;
};

/** Editor and preview side by side from 1280 px; below that a toggle shows one at a time. The preview mounts only while visible. */
export default function EditPreviewLayout({ editor, preview }: { editor: ReactNode; preview: ReactNode }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const wide = useWide();
  return (
    <div className="adm-split" data-mode={mode}>
      <div role="group" aria-label="Görünüm" className="seg adm-split-toggle">
        <button type="button" aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>
          Düzenle
        </button>
        <button type="button" aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>
          Önizle
        </button>
      </div>
      <div className="adm-split-editor">{editor}</div>
      <div className="adm-split-preview">{wide || mode === 'preview' ? preview : null}</div>
    </div>
  );
}
