import type { StudioPageContent } from '../types';

export const studioPage: StudioPageContent = {
  heading: [{ text: 'Mekânı çizen, ' }, { text: 'yapıyı', weight: 800 }, { text: ' da takip eden stüdyo.' }],
  lead: 'Gül CAN Mimarlık, {foundedIn} kuruldu.',
  sentence: [{ text: 'İyi bir mekân, neyi ' }, { text: 'boş', weight: 300 }, { text: ' bıraktığınızla ilgilidir.' }],
  paragraph:
    'Konuttan ticari mekâna; ilk eskizden şantiye teslimine kadar projenin her aşamasında yanınızdayız. Mimari proje, iç mimarlık, 3D görselleştirme ve uygulama aynı çatı altında yürüyor.',
  image: { media: 'studio-atmos' },
  imageCaption: 'İllüstratif görsel — stüdyonun gerçek ofisi değildir.',
  principles: [
    {
      id: 'kutle',
      title: 'Kütle',
      text: 'Taşıyan, saran, ağırlık veren: yapının sağlam kısmı. Önce onu doğru kurarız.',
    },
    {
      id: 'bosluk',
      title: 'Boşluk',
      text: 'Odanın kendisi. Neyin boş kalacağı, neyin dolacağı kadar önemlidir.',
    },
    {
      id: 'isik',
      title: 'Işık',
      text: 'Boşluğa giren gün ışığı. Plan, açıklıklar ve malzeme onun yolunu hesaba katar.',
    },
  ],
  servicesHeading: [{ text: 'Neler ' }, { text: 'yapıyoruz.', weight: 800 }],
  officeHeading: 'Ofis',
  contactLabel: 'İletişim',
};
