export const site = {
  name: 'Gül CAN Mimarlık',
  founded: 'Aralık 2020',
  phone: '0542 593 31 75',
  phoneHref: 'tel:+905425933175',
  email: 'gulcan.mimarlik@gmail.com',
  emailHref: 'mailto:gulcan.mimarlik@gmail.com',
  // Şehir onaylanmadı — bilinçli olarak yazılmaz.
  address: ['Cumhuriyet Mahallesi', 'Şehit Mustafa Sarı Sokak No:114'],
  demoNote: 'Bu site bir tasarım demosudur. Portföy içerikleri illüstratiftir.',
};

export const nav = [
  { href: '/projeler', label: 'Projeler' },
  { href: '/hizmetler', label: 'Hizmetler' },
  { href: '/studyo', label: 'Stüdyo' },
  { href: '/iletisim', label: 'İletişim' },
];

export type Img = {
  src: string;
  alt: string;
  focalX: number;
  focalY: number;
};

type Service = { name: string; desc: string };

export type ServiceCategory = {
  no: string;
  slug: string;
  name: string;
  sentence: string;
  services: Service[];
  image: Img;
  projectSlug: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    no: '01',
    slug: 'mimari-tasarim',
    name: 'Mimari Tasarım',
    sentence: 'Yapının kütlesini, planını ve cephesini çiziyoruz.',
    services: [
      { name: 'Mimari Proje', desc: 'Yapının planını, kesitini ve cephesini kuran ana tasarım çalışması.' },
      { name: 'Proje', desc: 'Tasarımın çizim ve teknik dokümana dönüştüğü aşama.' },
      {
        name: 'Paket Proje',
        desc: 'Mimari projeyle birlikte ilgili çizimlerin tek elden yürütülmesi. Kapsam projeye göre birlikte netleştirilir.',
      },
    ],
    image: {
      src: '/images/p1-cover.png',
      alt: 'Avlulu konut konsepti: giriş açıklığı ve avludaki zeytin ağacı',
      focalX: 52,
      focalY: 55,
    },
    projectSlug: 'avlulu-konut',
  },
  {
    no: '02',
    slug: 'ic-mimarlik',
    name: 'İç Mimarlık',
    sentence: 'Mekânı kullanım, ışık ve malzeme üzerinden yeniden kuruyoruz.',
    services: [
      { name: 'İç Mimarlık Hizmetleri', desc: 'Mekânın yerleşim, malzeme ve ışık kurgusu.' },
      { name: 'Tasarım', desc: 'Mekâna özgü, fikirden detaya uzanan tasarım çalışması.' },
    ],
    image: { src: '/images/p2-cover.png', alt: 'Daire yenileme konsepti: salon', focalX: 50, focalY: 55 },
    projectSlug: 'daire-yenileme',
  },
  {
    no: '03',
    slug: 'gorsellestirme',
    name: 'Görselleştirme',
    sentence: 'Projeyi inşa edilmeden önce modelleyip gösteriyoruz.',
    services: [
      { name: '3D Modelleme', desc: 'Projeyi yapılmadan önce üç boyutlu görmenizi sağlayan model.' },
      { name: 'Animasyon', desc: 'Modelin hareketli bir anlatıma dönüştüğü proje animasyonu.' },
    ],
    image: {
      src: '/images/p3-cover.png',
      alt: 'Yamaç evi konsepti: kademeli teraslar ve konsol hacim',
      focalX: 50,
      focalY: 50,
    },
    projectSlug: 'yamac-evi',
  },
  {
    no: '04',
    slug: 'uygulama',
    name: 'Uygulama',
    sentence: 'Çizimi şantiyede takip ediyor, teslime kadar yürütüyoruz.',
    services: [
      { name: 'Uygulama', desc: 'Çizilen projenin yapıma dönüşmesi.' },
      {
        name: 'Şantiye Şefliği',
        desc: 'Şantiyede işin çizime uygun ilerlemesinin takibi. Kapsam birlikte netleştirilir.',
      },
      { name: 'Anahtar Teslim', desc: 'Çizimden teslime sürecin tek elden yürütülmesi.' },
    ],
    image: { src: '/images/p2-after.png', alt: 'Yenileme sonrası konsept salon', focalX: 50, focalY: 55 },
    projectSlug: 'daire-yenileme',
  },
];

export const processSteps = [
  'Tanışma ve ihtiyaç analizi',
  'Konsept tasarım',
  '3D modelleme ve görselleştirme',
  'Mimari proje ve paket proje',
  'Uygulama ve şantiye şefliği',
  'Anahtar teslim',
];
