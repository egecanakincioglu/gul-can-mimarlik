import type { ContactPageContent } from '../types';

export const contactPage: ContactPageContent = {
  heading: [{ text: 'Bir sonraki mekânı ' }, { text: 'birlikte', weight: 300 }, { text: ' çizelim.' }],
  callLabel: 'Ara',
  mailLabel: 'E-posta gönder',
  form: {
    notifyTo: 'gulcan.mimarlik@gmail.com',
    heading: 'Projenizi kısaca anlatın.',
    note: 'Bu form bir arayüz demosudur: alanlar doğrulanır, ancak mesaj hiçbir yere gönderilmez. Gerçek iletişim için telefon veya e-postayı kullanın.',
    fields: {
      name: 'Ad Soyad',
      phone: 'Telefon',
      email: 'E-posta',
      type: 'Proje türü',
      location: 'Konum (isteğe bağlı)',
      message: 'Mesaj',
    },
    locationEnabled: true,
    projectTypes: [
      { id: 'mimari-proje', label: 'Mimari Proje' },
      { id: 'ic-mimarlik', label: 'İç Mimarlık' },
      { id: '3d-animasyon', label: '3D & Animasyon' },
      { id: 'uygulama-anahtar-teslim', label: 'Uygulama & Anahtar Teslim' },
      { id: 'diger', label: 'Diğer' },
    ],
    errors: {
      name: 'Lütfen adınızı ve soyadınızı yazın.',
      phone: 'Geçerli bir telefon numarası yazın.',
      email: 'Geçerli bir e-posta adresi yazın.',
      type: 'Bir proje türü seçin.',
      message: 'Mesajınız en az 10 karakter olmalı.',
    },
    // Not shown while demo mode is on (the demo submit label is used instead).
    submit: 'Gönder',
    success: 'Demo: Form doğrulandı, gerçek gönderim yapılmadı.',
  },
};
