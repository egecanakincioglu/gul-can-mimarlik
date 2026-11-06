'use client';

import { useState } from 'react';
import type { ServiceCategory, ServicesPageContent, SiteContent } from '@/content/types';
import Button from '../../ui/Button';
import Dialog from '../../ui/Dialog';
import SortableList from '../../ui/SortableList';
import { ImageField, LongField, Screen, Section, SelectField, TextField, replaceAt, useContent } from './common';
import EmphasisField from '../shared/EmphasisField';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Projects and project filters that point at one of the category's services. */
const categoryUsage = (c: SiteContent, cat: ServiceCategory): string[] => {
  const ids = new Set(cat.services.map((s) => s.id));
  const projects = c.projects.filter((p) => p.scope.some((s) => ids.has(s))).map((p) => `Proje: ${p.title}`);
  const filters = c.projectFilters
    .filter((f) => f.rule.kind === 'service' && ids.has(f.rule.serviceId))
    .map((f) => `Filtre: ${f.label}`);
  return [...projects, ...filters];
};

const slugError = (c: SiteContent, cat: ServiceCategory): string | undefined => {
  if (!SLUG.test(cat.slug)) return 'Yalnız küçük harf, rakam ve tire kullanın.';
  if (c.serviceCategories.some((o) => o.id !== cat.id && o.slug === cat.slug))
    return 'Bu adres başka bir kategoride var.';
  return undefined;
};

export default function ServicesScreen() {
  const { draft, update } = useContent();
  const page = draft.servicesPage;
  const [editing, setEditing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{ name: string; usage: string[] } | null>(null);

  const setPage = (p: Partial<ServicesPageContent>) =>
    update((d) => ({ ...d, servicesPage: { ...d.servicesPage, ...p } }));
  const setCat = (id: string, p: Partial<ServiceCategory>) =>
    update((d) => ({
      ...d,
      serviceCategories: d.serviceCategories.map((c) => (c.id === id ? { ...c, ...p } : c)),
    }));

  const cat = draft.serviceCategories.find((c) => c.id === editing);
  const asking = draft.serviceCategories.find((c) => c.id === confirm);

  const requestDelete = (c: ServiceCategory) => {
    const usage = categoryUsage(draft, c);
    if (usage.length) {
      setBlocked({ name: c.name, usage });
      return;
    }
    setBlocked(null);
    setConfirm(c.id);
  };

  const remove = (id: string) => {
    update((d) => ({ ...d, serviceCategories: d.serviceCategories.filter((c) => c.id !== id) }));
    setConfirm(null);
    setEditing(null);
  };

  return (
    <Screen title="Hizmetler" preview="/yonetim/onizleme/hizmetler">
      <Section title="Sayfa metinleri">
        <EmphasisField
          label="Başlık"
          value={page.heading}
          baseWeight={300}
          onChange={(heading) => setPage({ heading })}
        />
        <LongField label="Giriş cümlesi" value={page.lead} max={220} rows={3} onChange={(lead) => setPage({ lead })} />
        <EmphasisField
          label="Süreç başlığı"
          value={page.processHeading}
          baseWeight={600}
          onChange={(processHeading) => setPage({ processHeading })}
        />
        <LongField
          label="Süreç açıklaması"
          value={page.processLead}
          max={220}
          rows={3}
          onChange={(processLead) => setPage({ processLead })}
        />
        <LongField label="Dipnot" value={page.footnote} rows={3} onChange={(footnote) => setPage({ footnote })} />
      </Section>

      <Section title="Kategoriler">
        <SortableList
          items={draft.serviceCategories}
          getId={(c) => c.id}
          getLabel={(c) => c.name}
          onChange={(serviceCategories) => update((d) => ({ ...d, serviceCategories }))}
          renderItem={(c, i) => (
            <span className="pg-row">
              <span>
                {i + 1}. {c.name}
              </span>
              <Button aria-label={`Düzenle: ${c.name}`} onClick={() => setEditing(c.id)}>
                Düzenle
              </Button>
            </span>
          )}
        />
        {blocked && (
          <div role="alert" className="adm-error">
            <p className="label">Hata</p>
            <p>{blocked.name} silinemez; şu yerlerde kullanılıyor:</p>
            <ul>
              {blocked.usage.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {cat && (
        <Section title={`Kategori: ${cat.name}`}>
          <TextField
            label="Adres (slug)"
            value={cat.slug}
            error={slugError(draft, cat)}
            onChange={(slug) => setCat(cat.id, { slug })}
          />
          <TextField label="Ad" value={cat.name} onChange={(name) => setCat(cat.id, { name })} />
          <LongField
            label="Cümle"
            value={cat.sentence}
            max={220}
            rows={3}
            onChange={(sentence) => setCat(cat.id, { sentence })}
          />
          <ImageField
            label="Kategori görseli"
            ratio="landscape"
            value={cat.image}
            onChange={(image) => setCat(cat.id, { image })}
          />
          <SelectField
            label="İlgili proje"
            value={cat.projectId ?? ''}
            options={[
              { value: '', label: 'Yok' },
              ...draft.projects.map((p) => ({ value: p.id, label: p.published ? p.title : `${p.title} (Taslak)` })),
            ]}
            onChange={(v) => setCat(cat.id, { projectId: v === '' ? null : v })}
          />
          <h3 className="label">Hizmetler</h3>
          <SortableList
            items={cat.services}
            getId={(s) => s.id}
            getLabel={(s) => s.name}
            onChange={(services) => setCat(cat.id, { services })}
            renderItem={(s, i) => (
              <span className="pg-stack">
                <TextField
                  label={`Hizmet adı: ${s.name}`}
                  value={s.name}
                  onChange={(name) => setCat(cat.id, { services: replaceAt(cat.services, i, { ...s, name }) })}
                />
                <LongField
                  label={`Hizmet açıklaması: ${s.name}`}
                  value={s.desc}
                  rows={2}
                  onChange={(desc) => setCat(cat.id, { services: replaceAt(cat.services, i, { ...s, desc }) })}
                />
              </span>
            )}
          />
          <Button variant="destructive" onClick={() => requestDelete(cat)}>
            Kategoriyi sil
          </Button>
        </Section>
      )}

      <Dialog open={asking !== undefined} onClose={() => setConfirm(null)} title="Kategori silinsin mi?">
        <p>{asking?.name} kalıcı olarak silinir.</p>
        <div className="adm-dialog-actions">
          <Button onClick={() => setConfirm(null)}>Vazgeç</Button>
          <Button variant="destructive" onClick={() => asking && remove(asking.id)}>
            Sil
          </Button>
        </div>
      </Dialog>
    </Screen>
  );
}
