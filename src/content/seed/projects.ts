import type { Project, ProjectCategory, ProjectFilter, ProjectPageContent, ProjectsPageContent } from '../types';

export const projectCategories: ProjectCategory[] = [
  { id: 'mimari', name: 'Mimari' },
  { id: 'ic-mimarlik', name: 'İç Mimarlık' },
  { id: 'gorsellestirme', name: 'Görselleştirme' },
];

export const projectFilters: ProjectFilter[] = [
  { id: 'tumu', slug: 'tumu', label: 'Tümü', rule: { kind: 'all' } },
  { id: 'mimari', slug: 'mimari', label: 'Mimari', rule: { kind: 'category', categoryId: 'mimari' } },
  {
    id: 'ic-mimarlik',
    slug: 'ic-mimarlik',
    label: 'İç Mimarlık',
    rule: { kind: 'category', categoryId: 'ic-mimarlik' },
  },
  {
    id: 'gorsellestirme',
    slug: 'gorsellestirme',
    label: 'Görselleştirme',
    rule: { kind: 'category', categoryId: 'gorsellestirme' },
  },
  { id: 'uygulama', slug: 'uygulama', label: 'Uygulama', rule: { kind: 'service', serviceId: 'uygulama' } },
];

export const projectsPage: ProjectsPageContent = {
  title: 'Projeler',
  lead: 'Konuttan ticari mekâna, çizimden uygulamaya seçilmiş çalışmalar.',
};

export const projectPage: ProjectPageContent = {
  notesHeading: [{ text: 'Konsept ' }, { text: 'kararları.', weight: 800 }],
  notesHeadingReal: [{ text: 'Tasarım ' }, { text: 'kararları.', weight: 800 }],
  beforeAfterHeading: [{ text: 'Önce ' }, { text: '/', weight: 300 }, { text: ' ' }, { text: 'Sonra', weight: 800 }],
  conceptNote: 'Konsept çalışma; ölçü, yıl, konum ve müşteri bilgisi içermez.',
};

export const projects: Project[] = [
  {
    id: 'avlulu-konut',
    slug: 'avlulu-konut',
    title: 'Avlulu Konut',
    categoryId: 'mimari',
    kind: 'Konut',
    scope: ['mimari-proje', '3d-modelleme', 'paket-proje'],
    summary: 'Alçak, kompakt bir konut. Avlu, evin kütlesine açılmış bir oda gibi çalışıyor.',
    narrative: [
      'Kireç sıvalı kütleler, derin içe çekilmiş açıklıklar ve tek bir avlu. Konsept, yapının neyi kapattığı kadar neyi açık bıraktığına bakıyor.',
      'Beton, meşe ve ince çelik; az malzeme, net oran. Her açıklık gün ışığının gün içindeki yolunu hesaba katarak konumlanıyor.',
    ],
    materials: ['Kireç sıva', 'Brüt beton', 'Meşe', 'Siyah çelik'],
    notes: [
      {
        title: 'Avlu bir oda',
        text: 'Açık hava, evin içindeki en büyük oda gibi planlandı; tüm mekânlar ona bakıyor.',
      },
      {
        title: 'Derin açıklıklar',
        text: 'Pencereler duvar kalınlığının içine çekildi; yaz güneşi süzülüyor, kış ışığı içeri giriyor.',
      },
      {
        title: 'Az malzeme',
        text: 'Dört malzeme, net oranlar. Detay sayısı azaldıkça, kalan detay daha dikkatli çizilir.',
      },
    ],
    concept: true,
    cover: { media: 'p1-cover' },
    hero: { media: 'p1-wide' },
    gallery: [
      { image: { media: 'p1-cover' }, slot: 'landscape', caption: 'Giriş' },
      { image: { media: 'p1-portrait' }, slot: 'portrait', caption: 'Galeri' },
      { image: { media: 'p1-square' }, slot: 'square', caption: 'Malzeme detayı' },
    ],
    galleryNote: 'Avlu, evin kütlesine açılmış bir oda: ışık önce oraya giriyor.',
    published: true,
  },
  {
    id: 'daire-yenileme',
    slug: 'daire-yenileme',
    title: 'Daire Yenileme',
    categoryId: 'ic-mimarlik',
    kind: 'Konut içi',
    scope: ['ic-mimarlik-hizmetleri', 'uygulama', 'anahtar-teslim'],
    summary: 'Eski bir apartman salonu, aynı geometriyle yeniden kuruldu: yüzeyler sadeleşti, ışık kaldı.',
    narrative: [
      'Pencere, kiriş ve kolon yerinde kalıyor. Değişen yalnızca yüzeyler ve mobilya: sıva, mikro beton, meşe ve keten.',
      'Önce / sonra karşılaştırması konsept amaçlı illüstratif görsellerle hazırlanmıştır.',
    ],
    materials: ['Kireç sıva', 'Mikro beton', 'Meşe', 'Keten'],
    notes: [
      {
        title: 'Geometri sabit',
        text: 'Pencere, kiriş ve kolon yerinde; yenileme mekânın bildiği şeyi bozmadan başlıyor.',
      },
      {
        title: 'Yüzeyler sadeleşti',
        text: 'Çok katmanlı kaplamalar yerine tek renkli sıva ve sürekli zemin; oda daha büyük okunuyor.',
      },
      {
        title: 'Işık kaldı',
        text: 'Perde ve mobilya, gün ışığının odada ilerleyişini kesmeyecek biçimde yerleştirildi.',
      },
    ],
    concept: true,
    cover: { media: 'p2-cover' },
    hero: { media: 'p2-cover' },
    gallery: [
      { image: { media: 'p2-portrait' }, slot: 'portrait', caption: 'Mutfak' },
      { image: { media: 'p2-square' }, slot: 'square', caption: 'Malzeme detayı' },
      {
        image: { media: 'p2-after', alt: 'Daire yenileme konsepti: yenilenmiş salon' },
        slot: 'landscape',
        caption: 'Yenilenmiş salon',
      },
    ],
    beforeAfter: {
      before: { media: 'p2-before' },
      after: { media: 'p2-after' },
      lead: 'Pencere, kiriş ve kolon aynı kalıyor; yüzeyler değişiyor.',
    },
    published: true,
  },
  {
    id: 'yamac-evi',
    slug: 'yamac-evi',
    title: 'Yamaç Evi',
    categoryId: 'gorsellestirme',
    kind: 'Konut',
    scope: ['3d-modelleme', 'animasyon', 'tasarim'],
    summary: 'Eğimli arazide üç kademeli inen bir konut. Konsol hacim, yamacın kesitini okunur kılıyor.',
    narrative: [
      'Beton teraslar araziyi tutuyor, kireç sıvalı hacim alt terasın üzerine çıkıyor. Cam, vadiye bakıyor.',
      'Proje, 3D modelleme ve animasyon hizmetinin bir örneği olarak hazırlanmış konsept bir görselleştirmedir.',
    ],
    materials: ['Brüt beton', 'Kireç sıva', 'Cam', 'Siyah çelik'],
    notes: [
      { title: 'Kesit ana fikir', text: 'Ev, yamacın kesitini okunur kılan üç kademe olarak çizildi.' },
      {
        title: 'Konsol hacim',
        text: 'Üst hacim terasın üzerine uzanıyor; altında gölgeli bir dış mekân oluşuyor.',
      },
      { title: 'Vadiye açılan cam', text: 'Cephe kapalı, manzara tarafı açık: görüş tek yöne toplanıyor.' },
    ],
    concept: true,
    cover: { media: 'p3-cover' },
    hero: { media: 'p3-cover' },
    gallery: [{ image: { media: 'p3-video-poster' }, slot: 'wide' }],
    published: true,
  },
  {
    id: 'kose-kafe',
    slug: 'kose-kafe',
    title: 'Köşe Kafe',
    categoryId: 'ic-mimarlik',
    kind: 'Ticari',
    scope: ['tasarim', 'uygulama', 'santiye-sefligi'],
    summary: 'Köşe bir dükkân: iki cephe cam, tek uzun bank, mikro beton zemin.',
    narrative: [
      'Ticari mekân konsepti. Işık iki yönden giriyor, malzeme paleti dar tutuluyor: meşe, sıva, siyah çelik, keten.',
      'Konsept çalışma; gerçek bir müşteri veya mekân değildir.',
    ],
    materials: ['Meşe', 'Kireç sıva', 'Siyah çelik', 'Keten'],
    notes: [
      {
        title: 'İki yönden ışık',
        text: 'Köşe konumu avantaja çevrildi: sabah ve öğleden sonra ışığı farklı masalara düşüyor.',
      },
      {
        title: 'Tek uzun bank',
        text: 'Oturma düzeni, mekânı tek çizgide toplayıp servis akışını sadeleştiriyor.',
      },
      { title: 'Dar malzeme paleti', text: 'Dört malzeme; bakımı kolay, zamanla yaşlanabilen yüzeyler.' },
    ],
    concept: true,
    cover: { media: 'p4-cover' },
    hero: { media: 'p4-landscape' },
    gallery: [
      { image: { media: 'p4-cover' }, slot: 'portrait', caption: 'Bank' },
      { image: { media: 'p4-square' }, slot: 'square', caption: 'Tezgâh detayı' },
    ],
    published: true,
  },
];
