import type { InboxMessage } from '@/content/types';

/** Sample inbox entries for the mock phase; every field is placeholder data. */
export const sampleMessages = (): InboxMessage[] => [
  {
    id: 'sample-1',
    receivedAt: '2026-11-04T09:15:00.000Z',
    name: 'Örnek gönderen 1',
    phone: '0000 000 00 00',
    email: 'ornek1@example.com',
    projectType: 'Mimari Proje',
    message: 'Örnek mesaj. Bu içerik yalnızca demo amaçlıdır.',
    status: 'new',
  },
  {
    id: 'sample-2',
    receivedAt: '2026-11-05T13:40:00.000Z',
    name: 'Örnek gönderen 2',
    phone: '0000 000 00 00',
    email: 'ornek2@example.com',
    projectType: 'İç Mimarlık',
    location: 'Örnek konum',
    message: 'Örnek mesaj. Bu içerik yalnızca demo amaçlıdır.',
    status: 'new',
  },
  {
    id: 'sample-3',
    receivedAt: '2026-11-06T08:05:00.000Z',
    name: 'Örnek gönderen 3',
    phone: '0000 000 00 00',
    email: 'ornek3@example.com',
    projectType: 'Diğer',
    message: 'Örnek mesaj. Bu içerik yalnızca demo amaçlıdır.',
    status: 'read',
  },
];
