import { beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { STORAGE_NAME, createAdminStore } from './admin-store';
import type { StorageLike } from './admin-store';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
});

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

const withProjectName = (c: SiteContent, name: string): SiteContent => ({
  ...c,
  site: { ...c.site, name },
});

const withEmptyAlt = (c: SiteContent): SiteContent => ({
  ...c,
  media: c.media.map((m, i) => (i === 0 ? { ...m, alt: '' } : m)),
});

describe('admin store', () => {
  it('starts clean from the seed', () => {
    const s = createAdminStore(seed, memoryStorage()).getState();
    expect(s.dirty).toBe(false);
    expect(s.issues).toEqual([]);
    expect(s.draft).toEqual(seed);
    expect(s.messages).toHaveLength(3);
  });

  it('updates the draft immutably and marks it dirty', () => {
    const store = createAdminStore(seed, memoryStorage());
    const before = store.getState().draft;
    store.updateDraft((d) => withProjectName(d, 'Deneme'));
    const s = store.getState();
    expect(s.draft.site.name).toBe('Deneme');
    expect(before.site.name).toBe(seed.site.name);
    expect(s.published.site.name).toBe(seed.site.name);
    expect(s.dirty).toBe(true);
    expect(s.saveState.kind).toBe('saved');
  });

  it('persists to storage under a versioned key and restores it', () => {
    const storage = memoryStorage();
    createAdminStore(seed, storage).updateDraft((d) => withProjectName(d, 'Kalıcı'));
    expect(storage.data.has(STORAGE_NAME)).toBe(true);
    expect(createAdminStore(seed, storage).getState().draft.site.name).toBe('Kalıcı');
  });

  it('falls back to the seed on corrupt or foreign stored data', () => {
    const storage = memoryStorage();
    storage.data.set(STORAGE_NAME, '{not json');
    expect(createAdminStore(seed, storage).getState().draft).toEqual(seed);
    storage.data.set(STORAGE_NAME, JSON.stringify({ version: 2 }));
    expect(createAdminStore(seed, storage).getState().draft).toEqual(seed);
  });

  it('works when storage throws and reports a save error', () => {
    const store = createAdminStore(seed, throwingStorage);
    expect(store.getState().draft).toEqual(seed);
    store.updateDraft((d) => withProjectName(d, 'Yazılamaz'));
    expect(store.getState().draft.site.name).toBe('Yazılamaz');
    expect(store.getState().saveState.kind).toBe('error');
  });

  it('blocks publishing while the draft has issues', async () => {
    const store = createAdminStore(seed, memoryStorage());
    store.updateDraft(withEmptyAlt);
    expect(store.getState().issues.length).toBeGreaterThan(0);
    const result = await store.publish();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.some((i) => i.code === 'empty-alt')).toBe(true);
    expect(store.getState().published).toEqual(seed);
  });

  it('publishes a valid draft', async () => {
    const store = createAdminStore(seed, memoryStorage());
    store.updateDraft((d) => withProjectName(d, 'Yayında'));
    expect(await store.publish()).toEqual({ ok: true });
    const s = store.getState();
    expect(s.published.site.name).toBe('Yayında');
    expect(s.dirty).toBe(false);
    expect(s.saveState.kind).toBe('saved');
  });

  it('discards the draft back to the published content', () => {
    const store = createAdminStore(seed, memoryStorage());
    store.updateDraft((d) => withProjectName(d, 'Geçici'));
    store.discardDraft();
    expect(store.getState().draft).toEqual(seed);
    expect(store.getState().dirty).toBe(false);
  });

  it('resets draft, published and messages to the seed', async () => {
    const store = createAdminStore(seed, memoryStorage());
    store.updateDraft((d) => withProjectName(d, 'Yayında'));
    await store.publish();
    store.setMessageStatus('sample-1', 'archived');
    store.reset();
    const s = store.getState();
    expect(s.draft).toEqual(seed);
    expect(s.published).toEqual(seed);
    expect(s.messages.find((m) => m.id === 'sample-1')?.status).toBe('new');
  });

  it('changes a message status and notifies subscribers', () => {
    const store = createAdminStore(seed, memoryStorage());
    let calls = 0;
    const off = store.subscribe(() => (calls += 1));
    store.setMessageStatus('sample-1', 'read');
    expect(store.getState().messages.find((m) => m.id === 'sample-1')?.status).toBe('read');
    expect(calls).toBeGreaterThan(0);
    off();
    store.setMessageStatus('sample-2', 'read');
    expect(calls).toBe(1);
  });

  it('keeps sample messages clearly labelled and free of real contact data', () => {
    const { messages } = createAdminStore(seed, memoryStorage()).getState();
    for (const m of messages) {
      expect(m.name).toMatch(/^Örnek gönderen \d$/);
      expect(m.message).toMatch(/^Örnek mesaj/);
      expect(m.email).toMatch(/@example\.com$/);
    }
  });
});
