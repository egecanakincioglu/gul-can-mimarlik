import type { Contact, FooterContent, NavItem, Redirect, SiteSettings } from '../types';

export const site: SiteSettings = {
  name: 'Gül CAN Mimarlık',
  founded: { year: 2020, month: 12 },
  demoMode: true,
};

// The city is not approved, so it is deliberately not a field.
export const contact: Contact = {
  phone: '0542 593 31 75',
  email: 'gulcan.mimarlik@gmail.com',
  address: ['Cumhuriyet Mahallesi', 'Şehit Mustafa Sarı Sokak No:114'],
};

export const navigation: NavItem[] = [
  { id: 'projects', label: 'Projeler', href: '/projeler', visible: true },
  { id: 'services', label: 'Hizmetler', href: '/hizmetler', visible: true },
  { id: 'studio', label: 'Stüdyo', href: '/studyo', visible: true },
  { id: 'contact', label: 'İletişim', href: '/iletisim', visible: true },
];

export const footer: FooterContent = {
  ctaHeading: [{ text: 'Bir sonraki mekânı ' }, { text: 'birlikte', weight: 800 }, { text: ' çizelim.' }],
  cta: { label: 'Projenizi konuşalım', href: '/iletisim' },
  showCta: { home: true, services: true, studio: false, contact: false, projects: true, project: false },
};

export const redirects: Redirect[] = [];
