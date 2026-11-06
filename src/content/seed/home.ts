import type { HomeContent } from '../types';

export const home: HomeContent = {
  hero: {
    lines: [
      [{ text: 'Işığa', weight: 300 }],
      [{ text: 'yer açan', weight: 800 }],
      [{ text: 'mimarlık.', weight: 300 }],
    ],
    lead: 'Mimari proje, iç mimarlık, 3D görselleştirme ve uygulama. Çizimden anahtar teslime tek elden.',
    primary: { label: 'Projeleri incele', href: '/projeler' },
    secondary: { label: 'Projenizi konuşalım', href: '/iletisim' },
    band: ['Mimari Proje', 'İç Mimarlık', '3D & Animasyon', 'Uygulama'],
    anchor: 'Projeler ↓',
    posterDesktop: { media: 'hero-poster' },
    posterMobile: { media: 'hero-poster-m' },
  },
  intro: {
    sentence: [
      { text: 'İyi bir mekân, neyi doldurduğunuz kadar neyi ' },
      { text: 'boş', weight: 800 },
      { text: ' bıraktığınızla ilgilidir.' },
    ],
    paragraph:
      'Gül CAN Mimarlık, {foundedIn} kuruldu. Konuttan ticari mekâna, ilk eskizden şantiye teslimine kadar projenin her aşamasında yanınızdayız.',
    foundedLabel: 'Kuruluş',
    servicesLabel: 'Hizmet',
    servicesLine: 'Mimari · İç Mimari · 3D · Uygulama',
  },
  // Slots follow the layout order of the home page, not the project order.
  featured: {
    heading: 'Seçili Çalışmalar',
    link: 'Tüm projeler',
    slots: [
      { projectId: 'avlulu-konut', image: 'cover' },
      { projectId: 'daire-yenileme', image: 'cover' },
      { projectId: 'kose-kafe', image: 'hero' },
      { projectId: 'yamac-evi', image: 'cover', caption: 'Yamaç evi konsepti' },
    ],
  },
  beforeAfter: {
    projectId: 'daire-yenileme',
    heading: [{ text: 'Önce ' }, { text: '/', weight: 300 }, { text: ' ' }, { text: 'Sonra', weight: 800 }],
    lead: 'Aynı oda, aynı geometri. Değişen yüzeyler ve ışığın okunuşu.',
    hint: 'Sürükleyin, dokunun ya da alttaki Önce / Karşılaştır / Sonra kontrolünü kullanın.',
    link: 'Projeyi incele',
  },
  materials: {
    heading: [{ text: 'Az malzeme, ' }, { text: 'net oran.', weight: 800 }],
    lead: 'Kireç sıva, beton, meşe, keten, siyah çelik. Palet dar kaldıkça mekân sakinleşir.',
    items: [
      {
        id: 'beton-siva',
        image: { media: 'p1-square', alt: 'Brüt beton ve kireç sıva malzeme detayı. İllüstratif görsel' },
        label: 'Brüt beton · Kireç sıva',
        projectId: 'avlulu-konut',
      },
      {
        id: 'mikro-beton-keten',
        image: { media: 'p2-square', alt: 'Mikro beton ve keten malzeme detayı. İllüstratif görsel' },
        label: 'Mikro beton · Keten',
        projectId: 'daire-yenileme',
      },
      {
        id: 'mese-celik',
        image: { media: 'p4-square', alt: 'Meşe ve siyah çelik malzeme detayı. İllüstratif görsel' },
        label: 'Meşe · Siyah çelik',
        projectId: 'kose-kafe',
      },
    ],
  },
  services: {
    heading: [{ text: 'Projenin her aşaması, ' }, { text: 'tek masada.', weight: 300 }],
    button: 'Hizmetler',
  },
  process: {
    heading: [{ text: 'Fikirden ' }, { text: 'yapıya.', weight: 300 }],
    text: '{Steps} adım, tek ekip. Her adım bir öncekinin üzerine yükselir.',
  },
  studioTeaser: {
    heading: [{ text: 'Çizimden ' }, { text: 'şantiyeye,', weight: 300 }, { text: ' aynı masa.' }],
    paragraphs: [
      'Stüdyo {foundedIn} kuruldu. Tasarım, görselleştirme ve uygulama aynı ekipte kalıyor; böylece çizilen, yapılanla aynı oluyor.',
    ],
    link: 'Stüdyo',
    image: { media: 'studio-atmos' },
  },
};
