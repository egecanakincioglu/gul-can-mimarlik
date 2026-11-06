import type { InboxMessage } from '@/content/types';

/** Messages from the public contact form wait here until the admin store picks them up. */
export const DEMO_INBOX_NAME = 'gcm-admin:v1:inbox';

export type DemoMessageFields = Pick<InboxMessage, 'name' | 'phone' | 'email' | 'projectType' | 'location' | 'message'>;

export const readDemoInbox = (storage: Pick<Storage, 'getItem'>): InboxMessage[] => {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(DEMO_INBOX_NAME) ?? '[]');
    return Array.isArray(parsed) ? (parsed as InboxMessage[]) : [];
  } catch {
    return [];
  }
};

/** Demo only: queues a contact-form message in this browser. Never throws. */
export const addDemoMessage = (fields: DemoMessageFields, storage?: Pick<Storage, 'getItem' | 'setItem'>): void => {
  try {
    const target = storage ?? window.localStorage;
    const message: InboxMessage = {
      ...fields,
      id: `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      status: 'new',
    };
    target.setItem(DEMO_INBOX_NAME, JSON.stringify([...readDemoInbox(target), message]));
  } catch {
    // Blocked or full storage: the demo inbox simply stays unchanged.
  }
};
