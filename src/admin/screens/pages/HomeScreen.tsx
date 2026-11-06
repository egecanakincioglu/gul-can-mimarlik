'use client';

import { counts, text } from '@/content/select';
import type { HomeContent, Project } from '@/content/types';
import Button from '../../ui/Button';
import {
  ImageField,
  LongField,
  ReadOnly,
  Screen,
  Section,
  SelectField,
  TextField,
  replaceAt,
  useContent,
} from './common';
import EmphasisField from '../shared/EmphasisField';

type Slots = HomeContent['featured']['slots'];
type Slot = Slots[number];
type Item = HomeContent['materials']['items'][number];

// Ratios follow the layout order of the public home page.
const SLOT_RATIO = ['3:2', '4:5', '3:2', '21:9'];

export default function HomeScreen() {
  const { draft, update } = useContent();
  const home = draft.home;
  const patch = (fn: (h: HomeContent) => HomeContent) => update((d) => ({ ...d, home: fn(d.home) }));
  const n = counts(draft);

  const setHero = (p: Partial<HomeContent['hero']>) => patch((h) => ({ ...h, hero: { ...h.hero, ...p } }));
  const setIntro = (p: Partial<HomeContent['intro']>) => patch((h) => ({ ...h, intro: { ...h.intro, ...p } }));
  const setFeatured = (p: Partial<HomeContent['featured']>) =>
    patch((h) => ({ ...h, featured: { ...h.featured, ...p } }));
  const setSlot = (i: number, p: Partial<Slot>) =>
    patch((h) => ({
      ...h,
      featured: {
        ...h.featured,
        slots: replaceAt(h.featured.slots, i, { ...h.featured.slots[i], ...p }) as unknown as Slots,
      },
    }));
  const setBA = (p: Partial<HomeContent['beforeAfter']>) =>
    patch((h) => ({ ...h, beforeAfter: { ...h.beforeAfter, ...p } }));
  const setMaterials = (p: Partial<HomeContent['materials']>) =>
    patch((h) => ({ ...h, materials: { ...h.materials, ...p } }));
  const setItem = (i: number, p: Partial<Item>) =>
    patch((h) => ({
      ...h,
      materials: { ...h.materials, items: replaceAt(h.materials.items, i, { ...h.materials.items[i], ...p }) },
    }));
  const setServices = (p: Partial<HomeContent['services']>) =>
    patch((h) => ({ ...h, services: { ...h.services, ...p } }));
  const setProcess = (p: Partial<HomeContent['process']>) => patch((h) => ({ ...h, process: { ...h.process, ...p } }));
  const setTeaser = (p: Partial<HomeContent['studioTeaser']>) =>
    patch((h) => ({ ...h, studioTeaser: { ...h.studioTeaser, ...p } }));

  const projectOptions = (current: string, filter: (p: Project) => boolean) =>
    draft.projects
      .filter((p) => filter(p) || p.id === current)
      .map((p) => ({ value: p.id, label: p.published ? p.title : `${p.title} (Taslak)` }));
  const published = (p: Project) => p.published;
  const isDraft = (id: string) => draft.projects.find((p) => p.id === id)?.published === false;

  const baId = home.beforeAfter.projectId;
  const baCurrent = draft.projects.find((p) => p.id === baId);
  const baOptions = [{ value: '', label: 'Gösterme' }, ...projectOptions(baId ?? '', (p) => !!p.beforeAfter)];

  return (
    <Screen title="Ana sayfa" preview="/yonetim/onizleme">
      <Section title="1. Karşılama">
        {home.hero.lines.map((line, i) => (
          <EmphasisField
            key={i}
            label={`Başlık satırı ${i + 1}`}
            value={line}
            plain={300}
            baseWeight={300}
            max={40}
            onChange={(next) => setHero({ lines: replaceAt(home.hero.lines, i, next) })}
          />
        ))}
        <LongField
          label="Giriş cümlesi"
          value={home.hero.lead}
          max={220}
          rows={3}
          onChange={(lead) => setHero({ lead })}
        />
        <TextField
          label="Birinci düğme: yazı"
          value={home.hero.primary.label}
          onChange={(label) => setHero({ primary: { ...home.hero.primary, label } })}
        />
        <TextField
          label="Birinci düğme: adres"
          value={home.hero.primary.href}
          onChange={(href) => setHero({ primary: { ...home.hero.primary, href } })}
        />
        <TextField
          label="İkinci düğme: yazı"
          value={home.hero.secondary.label}
          onChange={(label) => setHero({ secondary: { ...home.hero.secondary, label } })}
        />
        <TextField
          label="İkinci düğme: adres"
          value={home.hero.secondary.href}
          onChange={(href) => setHero({ secondary: { ...home.hero.secondary, href } })}
        />
        {home.hero.band.map((chip, i) => (
          <TextField
            key={i}
            label={`Bant etiketi ${i + 1}`}
            value={chip}
            max={24}
            onChange={(v) => setHero({ band: replaceAt(home.hero.band, i, v) })}
          />
        ))}
        <TextField label="Aşağı bağlantısı" value={home.hero.anchor} onChange={(anchor) => setHero({ anchor })} />
        <ImageField
          label="Masaüstü afiş"
          ratio="wide"
          value={home.hero.posterDesktop}
          onChange={(posterDesktop) => setHero({ posterDesktop })}
        />
        <ImageField
          label="Mobil afiş"
          ratio="portrait"
          value={home.hero.posterMobile}
          onChange={(posterMobile) => setHero({ posterMobile })}
        />
      </Section>

      <Section title="2. Giriş" open={false}>
        <EmphasisField
          label="Cümle"
          value={home.intro.sentence}
          baseWeight={300}
          onChange={(sentence) => setIntro({ sentence })}
        />
        <LongField
          label="Paragraf"
          value={home.intro.paragraph}
          max={600}
          rows={5}
          onChange={(paragraph) => setIntro({ paragraph })}
        />
        <ReadOnly label="Kuruluş" value={text(draft, '{foundedIn}')} />
        <ReadOnly label="Hizmet" value={`${n.categories} kategori, ${n.services} hizmet`} />
      </Section>

      <Section title="3. Seçili çalışmalar" open={false}>
        <TextField label="Başlık" value={home.featured.heading} onChange={(heading) => setFeatured({ heading })} />
        <TextField label="Bağlantı yazısı" value={home.featured.link} onChange={(link) => setFeatured({ link })} />
        {home.featured.slots.map((slot, i) => (
          <fieldset key={i} className="pg-card">
            <legend className="label">
              {i + 1}. kart ({SLOT_RATIO[i]})
            </legend>
            <SelectField
              label={`${i + 1}. kart: proje`}
              value={slot.projectId}
              options={[
                ...(slot.projectId === '' ? [{ value: '', label: 'Proje seçin', disabled: true }] : []),
                ...projectOptions(slot.projectId, published),
              ]}
              warning={isDraft(slot.projectId) ? 'Bu proje yayında değil; ana sayfada yayınlanamaz.' : undefined}
              onChange={(projectId) => setSlot(i, { projectId })}
            />
            <SelectField
              label={`${i + 1}. kart: görsel`}
              value={slot.image}
              options={[
                { value: 'cover', label: 'Kapak' },
                { value: 'hero', label: 'Ana görsel' },
              ]}
              onChange={(image) => setSlot(i, { image: image === 'hero' ? 'hero' : 'cover' })}
            />
            <TextField
              label={`${i + 1}. kart: alt yazı`}
              value={slot.caption ?? ''}
              onChange={(caption) => setSlot(i, { caption: caption || undefined })}
            />
          </fieldset>
        ))}
      </Section>

      <Section title="4. Önce / Sonra" open={false}>
        <EmphasisField
          label="Başlık"
          value={home.beforeAfter.heading}
          baseWeight={600}
          onChange={(heading) => setBA({ heading })}
        />
        <LongField
          label="Giriş cümlesi"
          value={home.beforeAfter.lead}
          max={220}
          rows={3}
          onChange={(lead) => setBA({ lead })}
        />
        <TextField label="İpucu" value={home.beforeAfter.hint} onChange={(hint) => setBA({ hint })} />
        <TextField label="Bağlantı yazısı" value={home.beforeAfter.link} onChange={(link) => setBA({ link })} />
        <SelectField
          label="Karşılaştırma çifti"
          value={baId ?? ''}
          options={baOptions}
          helper="Yalnız önce ve sonra görseli tam olan projeler listelenir. Gösterme seçilirse bölüm gizlenir."
          warning={baCurrent && !baCurrent.beforeAfter ? 'Bu projenin önce / sonra çifti eksik.' : undefined}
          onChange={(v) => setBA({ projectId: v === '' ? null : v })}
        />
      </Section>

      <Section title="5. Malzemeler" open={false}>
        <EmphasisField
          label="Başlık"
          value={home.materials.heading}
          baseWeight={600}
          onChange={(heading) => setMaterials({ heading })}
        />
        <LongField
          label="Giriş cümlesi"
          value={home.materials.lead}
          max={220}
          rows={3}
          onChange={(lead) => setMaterials({ lead })}
        />
        {home.materials.items.map((item, i) => (
          <fieldset key={item.id} className="pg-card">
            <legend className="label">{i + 1}. malzeme</legend>
            <ImageField
              label={`${i + 1}. malzeme görseli`}
              ratio="square"
              value={item.image}
              onChange={(image) => setItem(i, { image })}
            />
            <TextField
              label={`${i + 1}. malzeme: görsel açıklaması`}
              value={item.image.alt ?? draft.media.find((m) => m.id === item.image.media)?.alt ?? ''}
              max={140}
              onChange={(alt) => setItem(i, { image: { ...item.image, alt } })}
            />
            <TextField
              label={`${i + 1}. malzeme: etiket`}
              value={item.label}
              onChange={(label) => setItem(i, { label })}
            />
            <SelectField
              label={`${i + 1}. malzeme: proje`}
              value={item.projectId}
              options={projectOptions(item.projectId, published)}
              warning={isDraft(item.projectId) ? 'Bu proje yayında değil.' : undefined}
              onChange={(projectId) => setItem(i, { projectId })}
            />
          </fieldset>
        ))}
      </Section>

      <Section title="6. Hizmetler" open={false}>
        <EmphasisField
          label="Başlık"
          value={home.services.heading}
          baseWeight={600}
          onChange={(heading) => setServices({ heading })}
        />
        <TextField label="Düğme yazısı" value={home.services.button} onChange={(button) => setServices({ button })} />
        <ReadOnly label="Sayılar" value={`${n.categories} kategori, ${n.services} hizmet`} />
      </Section>

      <Section title="7. Süreç" open={false}>
        <EmphasisField
          label="Başlık"
          value={home.process.heading}
          baseWeight={600}
          onChange={(heading) => setProcess({ heading })}
        />
        <LongField
          label="Paragraf"
          value={home.process.text}
          max={600}
          rows={3}
          helper="{Steps} adım sayısından otomatik üretilir."
          onChange={(t) => setProcess({ text: t })}
        />
        <ReadOnly label="Adım sayısı" value={String(n.steps)} />
      </Section>

      <Section title="8. Stüdyo" open={false}>
        <EmphasisField
          label="Başlık"
          value={home.studioTeaser.heading}
          baseWeight={600}
          onChange={(heading) => setTeaser({ heading })}
        />
        {home.studioTeaser.paragraphs.map((p, i) => (
          <LongField
            key={i}
            label={`${i + 1}. paragraf`}
            value={p}
            max={600}
            rows={4}
            onChange={(v) => setTeaser({ paragraphs: replaceAt(home.studioTeaser.paragraphs, i, v) })}
          />
        ))}
        {home.studioTeaser.paragraphs.length < 2 && (
          <Button onClick={() => setTeaser({ paragraphs: [...home.studioTeaser.paragraphs, ''] })}>
            Paragraf ekle
          </Button>
        )}
        <TextField label="Bağlantı yazısı" value={home.studioTeaser.link} onChange={(link) => setTeaser({ link })} />
        <ImageField
          label="Stüdyo görseli"
          ratio="portrait"
          value={home.studioTeaser.image}
          onChange={(image) => setTeaser({ image })}
        />
      </Section>
    </Screen>
  );
}
