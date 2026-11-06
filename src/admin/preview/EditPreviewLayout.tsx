'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

/** Editor and preview side by side from 1280 px; below that a toggle shows one at a time. */
export default function EditPreviewLayout({ editor, preview }: { editor: ReactNode; preview: ReactNode }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
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
      <div className="adm-split-preview">{preview}</div>
    </div>
  );
}
