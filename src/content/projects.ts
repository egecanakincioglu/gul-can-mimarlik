import type { Img } from './site';

export type Slot = 'wide' | 'landscape' | 'portrait' | 'square';

export type GalleryItem = Img & { slot: Slot; caption: string };

export type Project = {
  slug: string;
  title: string;
  category: 'Mimari' | 'İç Mimarlık' | 'Görselleştirme';
  kind: string;
  scope: string[];
  summary: string;
  narrative: string[];
  materials: string[];
  /** Konsept kararları: kısa başlık + tek cümle. Yalnızca tasarım niyeti; ölçü, yıl, müşteri yok. */
  notes: { t: string; d: string }[];
  status: 'concept';
  cover: Img;
  hero: Img;
  gallery: GalleryItem[];
  beforeAfter?: { before: Img; after: Img };
  // Video dosyası henüz yok: alan boş kaldığında video modülü render edilmez.
  video?: { src: string; poster: Img };
};

const L = 'İllüstratif görsel';

export const projects: Project[] = [
  {
    slug: 'avlulu-konut',
    title: 'Avlulu Konut',
    category: 'Mimari',
    kind: 'Konut',
    scope: ['Mimari Proje', '3D Modelleme', 'Paket Proje'],
    summary: 'Alçak, kompakt bir konut. Avlu, evin kütlesine açılmış bir oda gibi çalışıyor.',
    narrative: [
      'Kireç sıvalı kütleler, derin içe çekilmiş açıklıklar ve tek bir avlu. Konsept, yapının neyi kapattığı kadar neyi açık bıraktığına bakıyor.',
      'Beton, meşe ve ince çelik; az malzeme, net oran. Her açıklık gün ışığının gün içindeki yolunu hesaba katarak konumlanıyor.',
    ],
    materials: ['Kireç sıva', 'Brüt beton', 'Meşe', 'Siyah çelik'],
    notes: [
      { t: 'Avlu bir oda', d: 'Açık hava, evin içindeki en büyük oda gibi planlandı; tüm mekânlar ona bakıyor.' },
      {
        t: 'Derin açıklıklar',
        d: 'Pencereler duvar kalınlığının içine çekildi; yaz güneşi süzülüyor, kış ışığı içeri giriyor.',
      },
      { t: 'Az malzeme', d: 'Dört malzeme, net oranlar. Detay sayısı azaldıkça, kalan detay daha dikkatli çizilir.' },
    ],
    status: 'concept',
    cover: {
      src: '/images/p1-cover.png',
      alt: 'Avlulu konut konsepti: giriş açıklığı ve avludaki zeytin ağacı',
      focalX: 52,
      focalY: 55,
    },
    hero: {
      src: '/images/p1-wide.png',
      alt: 'Avlulu konut konsepti: avlu ve zeytin ağacı panoraması',
      focalX: 56,
      focalY: 58,
    },
    gallery: [
      {
        src: '/images/p1-cover.png',
        slot: 'landscape',
        caption: `${L} · Giriş`,
        alt: 'Avlulu konut konsepti: giriş açıklığı ve avludaki zeytin ağacı',
        focalX: 52,
        focalY: 55,
      },
      {
        src: '/images/p1-portrait.png',
        slot: 'portrait',
        caption: `${L} · Galeri`,
        alt: 'Avlulu konut konsepti: kapalı galeride ışık ve gölge',
        focalX: 50,
        focalY: 50,
      },
      {
        src: '/images/p1-square.png',
        slot: 'square',
        caption: `${L} · Malzeme detayı`,
        alt: 'Avlulu konut konsepti: malzeme detayı',
        focalX: 50,
        focalY: 50,
      },
    ],
  },
  {
    slug: 'daire-yenileme',
    title: 'Daire Yenileme',
    category: 'İç Mimarlık',
    kind: 'Konut içi',
    scope: ['İç Mimarlık Hizmetleri', 'Uygulama', 'Anahtar Teslim'],
    summary: 'Eski bir apartman salonu, aynı geometriyle yeniden kuruldu: yüzeyler sadeleşti, ışık kaldı.',
    narrative: [
      'Pencere, kiriş ve kolon yerinde kalıyor. Değişen yalnızca yüzeyler ve mobilya: sıva, mikro beton, meşe ve keten.',
      'Önce / sonra karşılaştırması konsept amaçlı üretilmiş görsellerle hazırlanmıştır.',
    ],
    materials: ['Kireç sıva', 'Mikro beton', 'Meşe', 'Keten'],
    notes: [
      { t: 'Geometri sabit', d: 'Pencere, kiriş ve kolon yerinde; yenileme mekânın bildiği şeyi bozmadan başlıyor.' },
      {
        t: 'Yüzeyler sadeleşti',
        d: 'Çok katmanlı kaplamalar yerine tek renkli sıva ve sürekli zemin; oda daha büyük okunuyor.',
      },
      { t: 'Işık kaldı', d: 'Perde ve mobilya, gün ışığının odada ilerleyişini kesmeyecek biçimde yerleştirildi.' },
    ],
    status: 'concept',
    cover: { src: '/images/p2-cover.png', alt: 'Daire yenileme konsepti: salon', focalX: 50, focalY: 55 },
    hero: { src: '/images/p2-cover.png', alt: 'Daire yenileme konsepti: salon', focalX: 50, focalY: 55 },
    gallery: [
      {
        src: '/images/p2-portrait.png',
        slot: 'portrait',
        caption: `${L} · Mutfak`,
        alt: 'Daire yenileme konsepti: mutfak detayı',
        focalX: 50,
        focalY: 50,
      },
      {
        src: '/images/p2-square.png',
        slot: 'square',
        caption: `${L} · Malzeme detayı`,
        alt: 'Daire yenileme konsepti: malzeme detayı',
        focalX: 50,
        focalY: 50,
      },
      {
        src: '/images/p2-after.png',
        slot: 'landscape',
        caption: `${L} · Yenilenmiş salon`,
        alt: 'Daire yenileme konsepti: yenilenmiş salon',
        focalX: 50,
        focalY: 55,
      },
    ],
    beforeAfter: {
      before: { src: '/images/p2-before.png', alt: 'Yenileme öncesi konsept salon', focalX: 50, focalY: 55 },
      after: { src: '/images/p2-after.png', alt: 'Yenileme sonrası konsept salon', focalX: 50, focalY: 55 },
    },
  },
  {
    slug: 'yamac-evi',
    title: 'Yamaç Evi',
    category: 'Görselleştirme',
    kind: 'Konut',
    scope: ['3D Modelleme', 'Animasyon', 'Tasarım'],
    summary: 'Eğimli arazide üç kademeli inen bir konut. Konsol hacim, yamacın kesitini okunur kılıyor.',
    narrative: [
      'Beton teraslar araziyi tutuyor, kireç sıvalı hacim alt terasın üzerine çıkıyor. Cam, vadiye bakıyor.',
      'Proje, 3D modelleme ve animasyon hizmetinin bir örneği olarak hazırlanmış konsept bir görselleştirmedir.',
    ],
    materials: ['Brüt beton', 'Kireç sıva', 'Cam', 'Siyah çelik'],
    notes: [
      { t: 'Kesit ana fikir', d: 'Ev, yamacın kesitini okunur kılan üç kademe olarak çizildi.' },
      { t: 'Konsol hacim', d: 'Üst hacim terasın üzerine uzanıyor; altında gölgeli bir dış mekân oluşuyor.' },
      { t: 'Vadiye açılan cam', d: 'Cephe kapalı, manzara tarafı açık: görüş tek yöne toplanıyor.' },
    ],
    status: 'concept',
    cover: {
      src: '/images/p3-cover.png',
      alt: 'Yamaç evi konsepti: kademeli teraslar ve konsol hacim',
      focalX: 50,
      focalY: 50,
    },
    hero: {
      src: '/images/p3-cover.png',
      alt: 'Yamaç evi konsepti: kademeli teraslar ve konsol hacim',
      focalX: 50,
      focalY: 50,
    },
    gallery: [
      {
        src: '/images/p3-video-poster.png',
        slot: 'wide',
        caption: 'İllüstratif 3D görselleştirme',
        alt: 'Yamaç evi konsepti: terasların daha yüksekten görünümü',
        focalX: 50,
        focalY: 50,
      },
    ],
  },
  {
    slug: 'kose-kafe',
    title: 'Köşe Kafe',
    category: 'İç Mimarlık',
    kind: 'Ticari',
    scope: ['Tasarım', 'Uygulama', 'Şantiye Şefliği'],
    summary: 'Köşe bir dükkân: iki cephe cam, tek uzun bank, mikro beton zemin.',
    narrative: [
      'Ticari mekân konsepti. Işık iki yönden giriyor, malzeme paleti dar tutuluyor: meşe, sıva, siyah çelik, keten.',
      'Konsept çalışma; gerçek bir müşteri veya mekân değildir.',
    ],
    materials: ['Meşe', 'Kireç sıva', 'Siyah çelik', 'Keten'],
    notes: [
      {
        t: 'İki yönden ışık',
        d: 'Köşe konumu avantaja çevrildi: sabah ve öğleden sonra ışığı farklı masalara düşüyor.',
      },
      { t: 'Tek uzun bank', d: 'Oturma düzeni, mekânı tek çizgide toplayıp servis akışını sadeleştiriyor.' },
      { t: 'Dar malzeme paleti', d: 'Dört malzeme; bakımı kolay, zamanla yaşlanabilen yüzeyler.' },
    ],
    status: 'concept',
    cover: { src: '/images/p4-cover.png', alt: 'Köşe kafe konsepti: bank ve tezgâh', focalX: 50, focalY: 55 },
    hero: { src: '/images/p4-landscape.png', alt: 'Köşe kafe konsepti: cam köşe ve meşe bank', focalX: 50, focalY: 55 },
    gallery: [
      {
        src: '/images/p4-cover.png',
        slot: 'portrait',
        caption: `${L} · Bank`,
        alt: 'Köşe kafe konsepti: bank ve tezgâh',
        focalX: 50,
        focalY: 55,
      },
      {
        src: '/images/p4-square.png',
        slot: 'square',
        caption: `${L} · Tezgâh detayı`,
        alt: 'Köşe kafe konsepti: tezgâh detayı',
        focalX: 50,
        focalY: 50,
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

export const filters = ['Tümü', 'Mimari', 'İç Mimarlık', 'Görselleştirme', 'Uygulama'] as const;
export type Filter = (typeof filters)[number];

export const matchesFilter = (p: Project, f: Filter) =>
  f === 'Tümü' ? true : f === 'Uygulama' ? p.scope.some((s) => /Uygulama/.test(s)) : p.category === f;
