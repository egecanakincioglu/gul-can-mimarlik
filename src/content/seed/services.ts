import type { ProcessStep, ServiceCategory, ServicesPageContent } from '../types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'mimari-tasarim',
    slug: 'mimari-tasarim',
    name: 'Mimari Tasarım',
    sentence: 'Yapının kütlesini, planını ve cephesini çiziyoruz.',
    services: [
      {
        id: 'mimari-proje',
        name: 'Mimari Proje',
        desc: 'Yapının planını, kesitini ve cephesini kuran ana tasarım çalışması.',
      },
      { id: 'proje', name: 'Proje', desc: 'Tasarımın çizim ve teknik dokümana dönüştüğü aşama.' },
      {
        id: 'paket-proje',
        name: 'Paket Proje',
        desc: 'Mimari projeyle birlikte ilgili çizimlerin tek elden yürütülmesi. Kapsam projeye göre birlikte netleştirilir.',
      },
    ],
    image: { media: 'p1-cover' },
    projectId: 'avlulu-konut',
  },
  {
    id: 'ic-mimarlik',
    slug: 'ic-mimarlik',
    name: 'İç Mimarlık',
    sentence: 'Mekânı kullanım, ışık ve malzeme üzerinden yeniden kuruyoruz.',
    services: [
      {
        id: 'ic-mimarlik-hizmetleri',
        name: 'İç Mimarlık Hizmetleri',
        desc: 'Mekânın yerleşim, malzeme ve ışık kurgusu.',
      },
      { id: 'tasarim', name: 'Tasarım', desc: 'Mekâna özgü, fikirden detaya uzanan tasarım çalışması.' },
    ],
    image: { media: 'p2-cover' },
    projectId: 'daire-yenileme',
  },
  {
    id: 'gorsellestirme',
    slug: 'gorsellestirme',
    name: 'Görselleştirme',
    sentence: 'Projeyi inşa edilmeden önce modelleyip gösteriyoruz.',
    services: [
      {
        id: '3d-modelleme',
        name: '3D Modelleme',
        desc: 'Projeyi yapılmadan önce üç boyutlu görmenizi sağlayan model.',
      },
      { id: 'animasyon', name: 'Animasyon', desc: 'Modelin hareketli bir anlatıma dönüştüğü proje animasyonu.' },
    ],
    image: { media: 'p3-cover' },
    projectId: 'yamac-evi',
  },
  {
    id: 'uygulama',
    slug: 'uygulama',
    name: 'Uygulama',
    sentence: 'Çizimi şantiyede takip ediyor, teslime kadar yürütüyoruz.',
    services: [
      { id: 'uygulama', name: 'Uygulama', desc: 'Çizilen projenin yapıma dönüşmesi.' },
      {
        id: 'santiye-sefligi',
        name: 'Şantiye Şefliği',
        desc: 'Şantiyede işin çizime uygun ilerlemesinin takibi. Kapsam birlikte netleştirilir.',
      },
      { id: 'anahtar-teslim', name: 'Anahtar Teslim', desc: 'Çizimden teslime sürecin tek elden yürütülmesi.' },
    ],
    image: { media: 'p2-after' },
    projectId: 'daire-yenileme',
  },
];

export const processSteps: ProcessStep[] = [
  { id: 'tanisma', title: 'Tanışma ve ihtiyaç analizi' },
  { id: 'konsept', title: 'Konsept tasarım' },
  { id: 'modelleme', title: '3D modelleme ve görselleştirme' },
  { id: 'proje', title: 'Mimari proje ve paket proje' },
  { id: 'uygulama', title: 'Uygulama ve şantiye şefliği' },
  { id: 'teslim', title: 'Anahtar teslim' },
];

export const servicesPage: ServicesPageContent = {
  heading: [{ text: 'Projenin her aşaması, ' }, { text: 'tek masada.', weight: 800 }],
  lead: '{Categories} kategori, {services} hizmet. Çizimden anahtar teslime her aşamayı birlikte ya da ayrı ayrı yürütüyoruz.',
  processHeading: [{ text: 'Fikirden ' }, { text: 'yapıya.', weight: 300 }],
  processLead: '{Steps} adım. İsterseniz hepsini, isterseniz yalnızca ihtiyacınız olanı birlikte yürütürüz.',
  footnote: 'Paket Proje ve Şantiye Şefliği kapsamı projeye göre birlikte netleştirilir.',
};
