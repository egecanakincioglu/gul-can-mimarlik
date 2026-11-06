import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { STORAGE_NAME, createAdminStore } from './admin-store';
import { DEMO_INBOX_NAME, addDemoMessage, readDemoInbox } from './demo-inbox';

const fields = {
  name: 'Ayşe Yılmaz',
  phone: '+90 212 000 00 00',
  email: 'ayse@example.com',
  projectType: 'Mimari Proje',
  message: 'Avlulu bir konut için görüşmek istiyoruz.',
};

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

describe('addDemoMessage', () => {
  it('appends new messages with a timestamp and the new status', () => {
    const storage = memory();
    addDemoMessage(fields, storage);
    addDemoMessage({ ...fields, name: 'Mehmet' }, storage);
    const queued = readDemoInbox(storage);
    expect(queued.map((m) => m.name)).toEqual(['Ayşe Yılmaz', 'Mehmet']);
    expect(queued[0].status).toBe('new');
    expect(Number.isNaN(Date.parse(queued[0].receivedAt))).toBe(false);
    expect(queued[0].id).not.toBe(queued[1].id);
  });

  it('does not throw when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => addDemoMessage(fields, blocked)).not.toThrow();
  });

  it('ignores a corrupted queue', () => {
    const storage = memory();
    storage.setItem(DEMO_INBOX_NAME, '{nope');
    addDemoMessage(fields, storage);
    expect(readDemoInbox(storage)).toHaveLength(1);
  });

  it('falls back to the browser storage', () => {
    window.localStorage.clear();
    addDemoMessage(fields);
    expect(readDemoInbox(window.localStorage)).toHaveLength(1);
    window.localStorage.clear();
  });
});

describe('admin store with queued messages', () => {
  it('merges the queue into the inbox once and clears it', async () => {
    const seed = await getContent();
    const storage = memory();
    addDemoMessage(fields, storage);
    const store = createAdminStore(seed, storage);
    expect(store.getState().messages.at(-1)?.name).toBe('Ayşe Yılmaz');
    expect(store.getState().messages.filter((m) => m.status === 'new')).toHaveLength(3);
    expect(storage.getItem(DEMO_INBOX_NAME)).toBeNull();
    const again = createAdminStore(seed, storage);
    expect(again.getState().messages).toHaveLength(store.getState().messages.length);
    expect(JSON.parse(storage.getItem(STORAGE_NAME) as string).messages).toHaveLength(4);
  });

  it('keeps the queue when the merged inbox cannot be stored', async () => {
    const seed = await getContent();
    const storage = memory();
    addDemoMessage(fields, storage);
    const store = createAdminStore(seed, {
      ...storage,
      setItem: () => {
        throw new Error('full');
      },
    });
    expect(store.getState().messages).toHaveLength(4);
    expect(readDemoInbox(storage)).toHaveLength(1);
  });
});
