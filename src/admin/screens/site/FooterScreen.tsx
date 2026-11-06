'use client';

import { plain } from '@/lib/rich';
import type { FooterContent } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Field from '../../ui/Field';
import Table from '../../ui/Table';
import Toggle from '../../ui/Toggle';
import EmphasisField from '../shared/EmphasisField';
import { ScreenFrame, Section } from './Frame';
import { PAGE_NAMES, hrefError, requiredText } from './rules';

const ROWS = [...(Object.keys(PAGE_NAMES) as (keyof typeof PAGE_NAMES)[]), 'project'] as const;
const ROW_NAMES: Record<(typeof ROWS)[number], string> = { ...PAGE_NAMES, project: 'Proje sayfaları' };

export default function FooterScreen() {
  const { draft, updateDraft } = useAdminStore();
  const { footer } = draft;

  const set = (patch: Partial<FooterContent>) => updateDraft((c) => ({ ...c, footer: { ...c.footer, ...patch } }));
  const setCta = (patch: Partial<FooterContent['cta']>) => set({ cta: { ...footer.cta, ...patch } });

  return (
    <ScreenFrame title="Alt bilgi" intro="Sayfaların sonundaki çağrı bölümü.">
      <Section title="Çağrı">
        <EmphasisField
          label="Başlık"
          value={footer.ctaHeading}
          baseWeight={300}
          error={plain(footer.ctaHeading).trim() ? undefined : 'Bu alan boş bırakılamaz.'}
          onChange={(ctaHeading) => set({ ctaHeading })}
        />
        <Field
          boxed
          label="Düğme metni"
          value={footer.cta.label}
          error={requiredText(footer.cta.label)}
          onChange={(label) => setCta({ label })}
        />
        <Field
          boxed
          label="Düğme adresi"
          value={footer.cta.href}
          error={hrefError(footer.cta.href)}
          onChange={(href) => setCta({ href })}
        />
      </Section>

      <Section title="Çağrının gösterildiği sayfalar">
        <Table
          caption="Sayfa başına çağrı bölümü"
          rows={ROWS}
          getKey={(k) => k}
          columns={[
            { key: 'page', header: 'Sayfa', render: (k) => ROW_NAMES[k] },
            {
              key: 'show',
              header: 'Çağrı',
              render: (k) => (
                <Toggle
                  checked={footer.showCta[k]}
                  label={`Çağrıyı göster: ${ROW_NAMES[k]}`}
                  onChange={(v) => set({ showCta: { ...footer.showCta, [k]: v } })}
                />
              ),
            },
          ]}
        />
      </Section>
    </ScreenFrame>
  );
}
