'use client';

import { useState } from 'react';
import { seoForPage } from '@/content/select';
import type { PageKey, PageSeo } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Table from '../../ui/Table';
import Notice from '../../ui/Notice';
import { ScreenFrame, Section } from './Frame';
import { PAGE_NAMES, PAGE_PATHS, rangeWarning, requiredText } from './rules';

const TITLE = { min: 10, max: 60 };
const DESC = { min: 70, max: 160 };
const KEYS = Object.keys(PAGE_NAMES) as PageKey[];

export default function SeoScreen() {
  const { draft, updateDraft } = useAdminStore();
  const { seo } = draft;
  const [selected, setSelected] = useState<PageKey | null>(null);

  const setSeo = (patch: Partial<typeof seo>) => updateDraft((c) => ({ ...c, seo: { ...c.seo, ...patch } }));
  const setPage = (key: PageKey, patch: Partial<PageSeo>) =>
    updateDraft((c) => {
      const page: PageSeo = { ...c.seo.pages[key], ...patch };
      if (!page.description) delete page.description;
      return { ...c, seo: { ...c.seo, pages: { ...c.seo.pages, [key]: page } } };
    });

  const warningsFor = (key: PageKey) => {
    const { title, description } = seoForPage(draft, key);
    return [rangeWarning(title, TITLE.min, TITLE.max), rangeWarning(description, DESC.min, DESC.max)].filter(Boolean);
  };

  const page = selected ? seo.pages[selected] : null;
  const resolved = selected ? seoForPage(draft, selected) : null;
  const previewTitle =
    selected && resolved
      ? selected === 'home'
        ? resolved.title
        : seo.titleTemplate.replace('%s', resolved.title)
      : '';

  return (
    <ScreenFrame
      title="Arama sonuçları (SEO)"
      intro="Arama sonuçlarında görünen başlık ve açıklamalar. Uzunluk uyarıları yalnızca öneridir."
    >
      <Section title="Genel">
        <Field
          boxed
          label="Başlık şablonu (arama sonuçlarında)"
          value={seo.titleTemplate}
          error={
            seo.titleTemplate.includes('%s')
              ? requiredText(seo.titleTemplate)
              : 'Şablon sayfa başlığının yerini gösteren %s içermelidir.'
          }
          helper="%s sayfa başlığıyla değiştirilir."
          onChange={(titleTemplate) => setSeo({ titleTemplate })}
        />
        <Field
          boxed
          multiline
          rows={3}
          label="Varsayılan kısa açıklama (arama sonuçlarında)"
          value={seo.description}
          max={DESC.max}
          error={requiredText(seo.description)}
          onChange={(description) => setSeo({ description })}
        />
        {rangeWarning(seo.description, DESC.min, DESC.max) && (
          <Notice variant="warning">{rangeWarning(seo.description, DESC.min, DESC.max)}</Notice>
        )}
        <Field
          boxed
          label="Demo eki"
          value={seo.demoSuffix}
          helper="Demo modu açıkken varsayılan açıklamanın sonuna eklenir."
          onChange={(demoSuffix) => setSeo({ demoSuffix })}
        />
      </Section>

      <Section title="Sayfalar">
        <Table
          caption="Sayfa başlıkları ve açıklamaları"
          rows={KEYS}
          getKey={(k) => k}
          columns={[
            { id: 'page', header: 'Sayfa', render: (k) => PAGE_NAMES[k] },
            { id: 'title', header: 'Başlık', render: (k) => seo.pages[k].title },
            {
              id: 'state',
              header: 'Durum',
              render: (k) => (warningsFor(k).length ? `Uyarı (${warningsFor(k).length})` : 'Uygun'),
            },
            {
              id: 'edit',
              header: 'İşlem',
              render: (k) => (
                <Button onClick={() => setSelected(k)} aria-label={`Düzenle: ${PAGE_NAMES[k]}`}>
                  Düzenle
                </Button>
              ),
            },
          ]}
        />
      </Section>

      {selected && page && resolved && (
        <Section title={`${PAGE_NAMES[selected]} sayfası`}>
          <Field
            boxed
            label="Sayfa başlığı (arama sonuçlarında)"
            value={page.title}
            max={TITLE.max}
            error={requiredText(page.title)}
            onChange={(title) => setPage(selected, { title })}
          />
          {page.title && rangeWarning(page.title, TITLE.min, TITLE.max) && (
            <Notice variant="warning">{rangeWarning(page.title, TITLE.min, TITLE.max)}</Notice>
          )}
          <Field
            boxed
            multiline
            rows={3}
            label="Kısa açıklama (arama sonuçlarında)"
            value={page.description ?? ''}
            max={DESC.max}
            helper="Boş bırakılırsa varsayılan açıklama kullanılır."
            onChange={(description) => setPage(selected, { description })}
          />
          {rangeWarning(resolved.description, DESC.min, DESC.max) && (
            <Notice variant="warning">{rangeWarning(resolved.description, DESC.min, DESC.max)}</Notice>
          )}
          <div className="adm-site-preview" role="group" aria-label="Arama sonucu önizlemesi">
            <p className="adm-site-preview-title">{previewTitle}</p>
            <p className="caption">{PAGE_PATHS[selected]}</p>
            <p>{resolved.description}</p>
          </div>
        </Section>
      )}
    </ScreenFrame>
  );
}
