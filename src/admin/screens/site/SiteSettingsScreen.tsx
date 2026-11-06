'use client';

import { useState } from 'react';
import type { DemoTexts, ImageRef, SiteContent } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Field from '../../ui/Field';
import Toggle from '../../ui/Toggle';
import ImagePicker from '../media/ImagePicker';
import { RATIOS } from '../media/ratios';
import { ScreenFrame, Section, SelectField } from './Frame';
import { requiredText } from './rules';

const MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const DEMO_NAMES: Record<keyof DemoTexts, string> = {
  footer: 'Alt bilgi notu',
  listing: 'Proje listesi notu',
  servicesFootnote: 'Hizmetler sayfası notu',
  studioTeaser: 'Stüdyo görseli notu',
  form: 'Form notu',
  formSubmit: 'Form düğmesi',
};

const CONCEPT_LABELS = [
  { id: 'concept', label: 'Konsept rozeti' },
  { id: 'statusConcept', label: 'Durum değeri' },
  { id: 'locationConcept', label: 'Konum değeri' },
] as const;

const CHIP_MAX = 24;

export default function SiteSettingsScreen() {
  const { draft, updateDraft } = useAdminStore();
  const { site, labels, demo, seo } = draft;
  const [yearText, setYearText] = useState(String(site.founded.year));

  const thisYear = new Date().getFullYear();
  const validYear = (v: string) => /^\d{4}$/.test(v) && Number(v) >= 1900 && Number(v) <= thisYear;
  const demoCount = Object.values(demo).filter((t) => t.trim()).length;

  const setSite = (patch: Partial<SiteContent['site']>) =>
    updateDraft((c) => ({ ...c, site: { ...c.site, ...patch } }));

  const setOg = (ref: ImageRef | null) =>
    updateDraft((c) => {
      const next = { ...c.seo };
      if (ref) next.ogImage = ref;
      else delete next.ogImage;
      return { ...c, seo: next };
    });

  return (
    <ScreenFrame title="Site ayarları" intro="Sitenin genelinde kullanılan ad, tarih ve etiketler.">
      <Section title="Site">
        <Field
          boxed
          label="Site adı"
          value={site.name}
          error={requiredText(site.name)}
          onChange={(name) => setSite({ name })}
        />
        <Field
          boxed
          label="Kuruluş yılı"
          value={yearText}
          error={validYear(yearText) ? undefined : `Geçerli, dört haneli bir yıl girin (1900-${thisYear}).`}
          onChange={(v) => {
            setYearText(v);
            if (validYear(v)) setSite({ founded: { ...site.founded, year: Number(v) } });
          }}
        />
        <SelectField
          label="Kuruluş ayı"
          value={String(site.founded.month)}
          options={MONTHS.map((name, i) => ({ value: String(i + 1), label: name }))}
          onChange={(v) => setSite({ founded: { ...site.founded, month: Number(v) } })}
        />
        <p className="caption adm-site-note">Telif yılı: {thisYear} (her yıl kendiliğinden güncellenir)</p>
      </Section>

      <Section title="Paylaşım görseli">
        <ImagePicker
          label="Varsayılan paylaşım görseli"
          slot={RATIOS.og}
          media={draft.media}
          value={seo.ogImage ?? null}
          onChange={setOg}
        />
        <p className="caption adm-site-note">Bağlantı paylaşıldığında gösterilir.</p>
      </Section>

      <Section title="Demo modu">
        <Toggle checked={site.demoMode} label="Demo modu" onChange={(demoMode) => setSite({ demoMode })} />
        <p className="adm-site-note" role="status">
          {demoCount} yerde not {site.demoMode ? 'görünür' : 'gizlenir'}
        </p>
        {(Object.keys(DEMO_NAMES) as (keyof DemoTexts)[]).map((key) => (
          <Field
            key={key}
            boxed
            multiline
            rows={2}
            label={DEMO_NAMES[key]}
            value={demo[key]}
            onChange={(value) => updateDraft((c) => ({ ...c, demo: { ...c.demo, [key]: value } }))}
          />
        ))}
      </Section>

      <Section title="Konsept etiketleri">
        {CONCEPT_LABELS.map(({ id, label }) => (
          <Field
            key={id}
            boxed
            label={label}
            value={labels[id]}
            max={CHIP_MAX}
            error={requiredText(labels[id], CHIP_MAX)}
            onChange={(value) => updateDraft((c) => ({ ...c, labels: { ...c.labels, [id]: value } }))}
          />
        ))}
      </Section>
    </ScreenFrame>
  );
}
