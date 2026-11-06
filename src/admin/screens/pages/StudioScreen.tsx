'use client';

import type { StudioPageContent } from '@/content/types';
import SortableList from '../../ui/SortableList';
import { ImageField, LongField, Screen, Section, TextField, replaceAt, useContent } from './common';
import EmphasisField from '../shared/EmphasisField';

export default function StudioScreen() {
  const { draft, update } = useContent();
  const page = draft.studioPage;
  const set = (p: Partial<StudioPageContent>) => update((d) => ({ ...d, studioPage: { ...d.studioPage, ...p } }));
  const setPrinciple = (i: number, p: Partial<StudioPageContent['principles'][number]>) =>
    set({ principles: replaceAt(page.principles, i, { ...page.principles[i], ...p }) });
  const alt = page.image.alt ?? draft.media.find((m) => m.id === page.image.media)?.alt ?? '';

  return (
    <Screen title="Stüdyo" preview="/yonetim/onizleme/studyo">
      <Section title="Metinler">
        <EmphasisField label="Başlık" value={page.heading} baseWeight={300} onChange={(heading) => set({ heading })} />
        <LongField label="Giriş cümlesi" value={page.lead} max={220} rows={3} onChange={(lead) => set({ lead })} />
        <LongField
          label="Paragraf"
          value={page.paragraph}
          max={600}
          rows={5}
          onChange={(paragraph) => set({ paragraph })}
        />
        <EmphasisField
          label="Alt başlık cümlesi"
          value={page.sentence}
          baseWeight={600}
          onChange={(sentence) => set({ sentence })}
        />
        <EmphasisField
          label="Hizmetler başlığı"
          value={page.servicesHeading}
          baseWeight={600}
          onChange={(servicesHeading) => set({ servicesHeading })}
        />
        <TextField
          label="Ofis başlığı"
          value={page.officeHeading}
          onChange={(officeHeading) => set({ officeHeading })}
        />
        <TextField
          label="İletişim düğmesi"
          value={page.contactLabel}
          onChange={(contactLabel) => set({ contactLabel })}
        />
      </Section>

      <Section title="Görsel">
        <ImageField label="Stüdyo görseli" ratio="portrait" value={page.image} onChange={(image) => set({ image })} />
        <TextField
          label="Görsel açıklaması"
          value={alt}
          max={140}
          onChange={(a) => set({ image: { ...page.image, alt: a } })}
        />
        <TextField
          label="Görsel alt yazısı"
          value={page.imageCaption ?? ''}
          onChange={(c) => set({ imageCaption: c || undefined })}
        />
      </Section>

      <Section title="İlkeler">
        <SortableList
          items={page.principles}
          getId={(p) => p.id}
          getLabel={(p) => p.title}
          onChange={(principles) => set({ principles })}
          renderItem={(p, i) => (
            <span className="pg-stack">
              <TextField
                label={`İlke başlığı: ${p.title}`}
                value={p.title}
                max={24}
                onChange={(title) => setPrinciple(i, { title })}
              />
              <LongField
                label={`İlke metni: ${p.title}`}
                value={p.text}
                rows={3}
                onChange={(t) => setPrinciple(i, { text: t })}
              />
            </span>
          )}
        />
      </Section>
    </Screen>
  );
}
