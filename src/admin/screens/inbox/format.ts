const date = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeZone: 'Europe/Istanbul' });
const dateTime = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul',
});

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** Entries created by the mock phase are labelled as samples. */
export const isSample = (id: string) => id.startsWith('sample-');

export const statusLabel = (status: 'new' | 'read' | 'archived') =>
  status === 'new' ? 'Yeni' : status === 'read' ? 'Okundu' : 'Arşivde';
