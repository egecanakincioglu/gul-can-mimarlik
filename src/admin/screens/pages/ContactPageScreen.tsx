'use client';

import type { ContactPageContent } from '@/content/types';
import Button from '../../ui/Button';
import SortableList from '../../ui/SortableList';
import Toggle from '../../ui/Toggle';
import EmptyState from '../../ui/EmptyState';
import Notice from '../../ui/Notice';
import Section from '../../ui/Section';
import { LongField, Screen, TextField, replaceAt, useContent } from './common';
import EmphasisField from '../shared/EmphasisField';

type Form = ContactPageContent['form'];

const FIELD_LABELS: Record<keyof Form['fields'], string> = {
  name: 'Ad',
  phone: 'Telefon',
  email: 'E-posta',
  type: 'Proje türü',
  location: 'Konum',
  message: 'Mesaj',
};
const ERROR_LABELS: Record<keyof Form['errors'], string> = {
  name: 'Ad',
  phone: 'Telefon',
  email: 'E-posta',
  type: 'Proje türü',
  message: 'Mesaj',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPageScreen() {
  const { draft, update } = useContent();
  const page = draft.contactPage;
  const form = page.form;

  const setPage = (p: Partial<ContactPageContent>) =>
    update((d) => ({ ...d, contactPage: { ...d.contactPage, ...p } }));
  const setForm = (p: Partial<Form>) =>
    update((d) => ({ ...d, contactPage: { ...d.contactPage, form: { ...d.contactPage.form, ...p } } }));

  const emailError =
    form.notifyTo !== '' && !EMAIL.test(form.notifyTo) ? 'Geçerli bir e-posta adresi yazın.' : undefined;

  const addType = () => {
    let n = form.projectTypes.length + 1;
    while (form.projectTypes.some((t) => t.id === `tur-${n}`)) n += 1;
    setForm({ projectTypes: [...form.projectTypes, { id: `tur-${n}`, label: '' }] });
  };

  return (
    <Screen title="İletişim sayfası" preview="/yonetim/onizleme/iletisim">
      <Section title="Sayfa metinleri" defaultOpen>
        <EmphasisField
          label="Başlık"
          value={page.heading}
          baseWeight={600}
          onChange={(heading) => setPage({ heading })}
        />
        <TextField label="Arama düğmesi" value={page.callLabel} onChange={(callLabel) => setPage({ callLabel })} />
        <TextField label="E-posta düğmesi" value={page.mailLabel} onChange={(mailLabel) => setPage({ mailLabel })} />
      </Section>

      <Section title="Form" defaultOpen>
        <TextField label="Form başlığı" value={form.heading} onChange={(heading) => setForm({ heading })} />
        <LongField label="Form notu" value={form.note} rows={3} onChange={(note) => setForm({ note })} />
        {(Object.keys(FIELD_LABELS) as (keyof Form['fields'])[]).map((k) => (
          <TextField
            key={k}
            label={`Alan etiketi: ${FIELD_LABELS[k]}`}
            value={form.fields[k]}
            onChange={(v) => setForm({ fields: { ...form.fields, [k]: v } })}
          />
        ))}
        <Toggle
          label="Konum alanı"
          checked={form.locationEnabled}
          onChange={(locationEnabled) => setForm({ locationEnabled })}
        />
      </Section>

      <Section title="Proje türleri" defaultOpen>
        {form.projectTypes.length === 0 && (
          <EmptyState
            message="Henüz proje türü yok."
            description="Proje türleri iletişim formundaki seçim listesinde görünür."
            actionLabel="Tür ekle"
            onAction={addType}
          />
        )}
        <SortableList
          items={form.projectTypes}
          getId={(t) => t.id}
          getLabel={(t) => t.label}
          onChange={(projectTypes) => setForm({ projectTypes })}
          renderItem={(t, i) => (
            <TextField
              label={`${i + 1}. proje türü`}
              value={t.label}
              max={24}
              onChange={(label) => setForm({ projectTypes: replaceAt(form.projectTypes, i, { ...t, label }) })}
            />
          )}
        />
        <Button onClick={addType}>Tür ekle</Button>
      </Section>

      <Section title="Doğrulama iletileri" defaultOpen>
        {(Object.keys(ERROR_LABELS) as (keyof Form['errors'])[]).map((k) => (
          <TextField
            key={k}
            label={`İleti: ${ERROR_LABELS[k]}`}
            value={form.errors[k]}
            onChange={(v) => setForm({ errors: { ...form.errors, [k]: v } })}
          />
        ))}
      </Section>

      <Section title="Gönderim" defaultOpen>
        <TextField label="Gönder düğmesi" value={form.submit} onChange={(submit) => setForm({ submit })} />
        <LongField label="Başarı metni" value={form.success} rows={2} onChange={(success) => setForm({ success })} />
        <TextField
          label="Alıcı e-posta"
          type="email"
          value={form.notifyTo}
          error={emailError}
          onChange={(notifyTo) => setForm({ notifyTo })}
        />
        {form.notifyTo.trim() === '' && <Notice variant="warning">Mesajlar yalnız gelen kutusuna düşer.</Notice>}
      </Section>
    </Screen>
  );
}
