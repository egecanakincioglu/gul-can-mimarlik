'use client';

import { seoForProject } from '@/content/select';
import { rangeWarning } from '../site/rules';
import Notice from '../../ui/Notice';
import { LongField, TextField } from '../pages/common';
import { toProject } from './model';
import type { TabProps } from './tab-props';

const TITLE = { min: 10, max: 60 };
const DESC = { min: 70, max: 160 };

export default function SeoTab({ w, set, draft }: TabProps) {
  const resolved = seoForProject(draft, toProject(w, w.id, draft));
  const preview = draft.seo.titleTemplate.replace('%s', resolved.title);
  const titleWarning = rangeWarning(resolved.title, TITLE.min, TITLE.max);
  const descWarning = rangeWarning(resolved.description, DESC.min, DESC.max);

  return (
    <div className="pj-body">
      <p className="caption">
        Boş bırakılan alanlar için başlıktan ve özetten türetilen metin kullanılır. Uzunluk uyarıları öneridir.
      </p>
      <TextField
        label="SEO başlığı"
        value={w.seoTitle}
        max={TITLE.max}
        helper={`Boşsa: ${resolved.title}`}
        onChange={(seoTitle) => set({ seoTitle })}
      />
      {titleWarning && <Notice variant="warning">{titleWarning}</Notice>}
      <LongField
        label="SEO açıklaması"
        value={w.seoDescription}
        rows={3}
        max={DESC.max}
        onChange={(seoDescription) => set({ seoDescription })}
      />
      {descWarning && <Notice variant="warning">{descWarning}</Notice>}
      <div className="pj-preview" aria-label="Arama sonucu önizlemesi">
        <p className="label">Arama sonucu önizlemesi</p>
        <p>
          <strong>{preview}</strong>
        </p>
        <p className="caption">{resolved.description}</p>
      </div>
    </div>
  );
}
