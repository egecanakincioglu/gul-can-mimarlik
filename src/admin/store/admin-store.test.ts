import { beforeAll, describe, expect, it, vi } from 'vitest';
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
    store.flush();
    const s = store.getState();
    expect(s.draft.site.name).toBe('Deneme');
    expect(before.site.name).toBe(seed.site.name);
    expect(s.published.site.name).toBe(seed.site.name);
    expect(s.dirty).toBe(true);
    expect(s.saveState.kind).toBe('saved');
  });

  it('persists to storage under a versioned key and restores it', () => {
    const storage = memoryStorage();
    const first = createAdminStore(seed, storage);
    first.updateDraft((d) => withProjectName(d, 'Kalıcı'));
    first.flush();
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
    store.flush();
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

describe('admin store persistence and derived state', () => {
  const counting = () => {
    const storage = memoryStorage();
    let writes = 0;
    const setItem = storage.setItem;
    storage.setItem = (k, v) => {
      writes += 1;
      setItem(k, v);
    };
    return { storage, writes: () => writes };
  };

  it('debounces storage writes to one per burst', () => {
    vi.useFakeTimers();
    try {
      const { storage, writes } = counting();
      const store = createAdminStore(seed, storage);
      for (let i = 0; i < 10; i += 1) store.updateDraft((d) => withProjectName(d, 'Ad ' + i));
      expect(writes()).toBe(0);
      expect(store.getState().saveState.kind).toBe('saving');
      vi.advanceTimersByTime(300);
      expect(writes()).toBe(1);
      expect(store.getState().saveState.kind).toBe('saved');
      expect(createAdminStore(seed, storage).getState().draft.site.name).toBe('Ad 9');
    } finally {
      vi.useRealTimers();
    }
  });

  it('flushes on pagehide and when the page is hidden', () => {
    vi.useFakeTimers();
    try {
      const { storage, writes } = counting();
      const store = createAdminStore(seed, storage);
      store.updateDraft((d) => withProjectName(d, 'A'));
      window.dispatchEvent(new Event('pagehide'));
      expect(writes()).toBe(1);
      store.updateDraft((d) => withProjectName(d, 'B'));
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      expect(writes()).toBe(2);
      store.dispose();
      store.updateDraft((d) => withProjectName(d, 'C'));
      window.dispatchEvent(new Event('pagehide'));
      expect(writes()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('writes at once when publishing, discarding and resetting', async () => {
    vi.useFakeTimers();
    try {
      const { storage, writes } = counting();
      const store = createAdminStore(seed, storage);
      store.updateDraft((d) => withProjectName(d, 'Yayın'));
      await store.publish();
      expect(writes()).toBe(1);
      store.updateDraft((d) => withProjectName(d, 'Geçici'));
      store.discardDraft();
      expect(writes()).toBe(2);
      store.reset();
      expect(writes()).toBe(3);
      vi.advanceTimersByTime(1000);
      expect(writes()).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports a failing storage once, not per keystroke', () => {
    vi.useFakeTimers();
    try {
      const store = createAdminStore(seed, throwingStorage);
      store.updateDraft((d) => withProjectName(d, 'A'));
      vi.advanceTimersByTime(300);
      const failed = store.getState().saveState;
      expect(failed.kind).toBe('error');
      let calls = 0;
      store.subscribe(() => (calls += 1));
      store.updateDraft((d) => withProjectName(d, 'B'));
      expect(store.getState().saveState).toBe(failed);
      vi.advanceTimersByTime(300);
      expect(store.getState().saveState).toBe(failed);
      expect(calls).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not emit for a no-op update', () => {
    const store = createAdminStore(seed, memoryStorage());
    let calls = 0;
    store.subscribe(() => (calls += 1));
    const before = store.getState();
    store.updateDraft(store.getState().draft);
    store.updateDraft((d) => d);
    store.setMessageStatus('sample-1', 'new');
    expect(calls).toBe(0);
    expect(store.getState()).toBe(before);
  });

  it('keeps dirty exact after publish, discard and editing back', async () => {
    const store = createAdminStore(seed, memoryStorage());
    expect(store.getState().dirty).toBe(false);
    store.updateDraft((d) => withProjectName(d, 'X'));
    expect(store.getState().dirty).toBe(true);
    store.updateDraft((d) => withProjectName(d, seed.site.name));
    expect(store.getState().dirty).toBe(false);
    store.updateDraft((d) => withProjectName(d, 'Y'));
    await store.publish();
    expect(store.getState().dirty).toBe(false);
    store.updateDraft((d) => withProjectName(d, 'Z'));
    expect(store.getState().dirty).toBe(true);
    store.discardDraft();
    expect(store.getState().dirty).toBe(false);
  });

  it('flags media whose blob file was lost on reload, until it is replaced', async () => {
    const storage = memoryStorage();
    const first = createAdminStore(seed, storage);
    first.updateDraft((d) => ({
      ...d,
      media: d.media.map((m, i) => (i === 0 ? { ...m, file: 'blob:http://localhost/abc' } : m)),
    }));
    first.flush();
    expect(first.getState().issues.some((i) => i.code === 'file-lost')).toBe(false);

    const reloaded = createAdminStore(seed, storage);
    expect(reloaded.getState().issues).toContainEqual({ path: 'media[0].file', code: 'file-lost' });
    expect(await reloaded.publish()).toMatchObject({ ok: false });
    reloaded.updateDraft((d) => ({
      ...d,
      media: d.media.map((m, i) => (i === 0 ? { ...m, file: seed.media[0]!.file } : m)),
    }));
    expect(reloaded.getState().issues.some((i) => i.code === 'file-lost')).toBe(false);
  });
});
