import { createMemoryRepository } from '@/content/store';
import type { ContentRepository } from '@/content/store';
import { validate } from '@/content/validate';
import type { Issue } from '@/content/validate';
import type { InboxMessage, SiteContent } from '@/content/types';
import { sampleMessages } from './sample-messages';

export const STORAGE_NAME = 'gcm-admin:v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type SaveState =
  { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; at: string } | { kind: 'error'; message: string };

export type AdminState = {
  draft: SiteContent;
  published: SiteContent;
  messages: InboxMessage[];
  saveState: SaveState;
  /** The draft differs from the published content. */
  dirty: boolean;
  /** Validation issues of the draft; publishing is blocked while there are any. */
  issues: Issue[];
};

type PublishResult = { ok: true } | { ok: false; issues: Issue[] };

export interface AdminStore {
  getState(): AdminState;
  subscribe(listener: () => void): () => void;
  updateDraft(next: SiteContent | ((prev: SiteContent) => SiteContent)): void;
  publish(): Promise<PublishResult>;
  discardDraft(): void;
  reset(): void;
  setMessageStatus(id: string, status: InboxMessage['status']): void;
}

type Persisted = { version: 1; draft: SiteContent; published: SiteContent; messages: InboxMessage[] };

const isContent = (v: unknown): v is SiteContent => {
  if (!v || typeof v !== 'object') return false;
  const c = v as Partial<SiteContent>;
  return c.version === 1 && Array.isArray(c.projects) && Array.isArray(c.media) && !!c.home && !!c.site;
};

const read = (storage: StorageLike | null): Persisted | null => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_NAME);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const p = parsed as Partial<Persisted>;
    if (p.version !== 1 || !isContent(p.draft) || !isContent(p.published) || !Array.isArray(p.messages)) return null;
    return p as Persisted;
  } catch {
    return null;
  }
};

const same = (a: SiteContent, b: SiteContent) => a === b || JSON.stringify(a) === JSON.stringify(b);

const STORAGE_ERROR = 'Değişiklikler tarayıcı depolamasına yazılamadı.';

/** Mock editing store: a draft and a published copy, kept in the browser only. */
export const createAdminStore = (seed: SiteContent, storage: StorageLike | null): AdminStore => {
  const saved = read(storage);
  const listeners = new Set<() => void>();
  let publishing = false;
  let repo: ContentRepository = createMemoryRepository(saved?.published ?? seed);

  const derive = (draft: SiteContent, published: SiteContent) => ({
    dirty: !same(draft, published),
    issues: validate(draft),
  });

  const initialDraft = saved?.draft ?? structuredClone(seed);
  const initialPublished = saved?.published ?? structuredClone(seed);
  let state: AdminState = {
    draft: initialDraft,
    published: initialPublished,
    messages: saved?.messages ?? sampleMessages(),
    saveState: { kind: 'idle' },
    ...derive(initialDraft, initialPublished),
  };

  const emit = () => listeners.forEach((l) => l());

  const persist = (): SaveState => {
    if (!storage) return { kind: 'error', message: STORAGE_ERROR };
    try {
      const data: Persisted = { version: 1, draft: state.draft, published: state.published, messages: state.messages };
      storage.setItem(STORAGE_NAME, JSON.stringify(data));
      return { kind: 'saved', at: new Date().toISOString() };
    } catch {
      return { kind: 'error', message: STORAGE_ERROR };
    }
  };

  const commit = (patch: Partial<AdminState>) => {
    const next = { ...state, ...patch };
    state = { ...next, ...derive(next.draft, next.published) };
    state = { ...state, saveState: persist() };
    emit();
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    updateDraft: (next) => commit({ draft: typeof next === 'function' ? next(state.draft) : next }),
    publish: async () => {
      if (publishing) return { ok: false, issues: [] };
      const issues = validate(state.draft);
      if (issues.length) return { ok: false, issues };
      publishing = true;
      state = { ...state, saveState: { kind: 'saving' } };
      emit();
      try {
        const { rev } = await repo.getContent();
        const result = await repo.saveContent(state.draft, rev);
        if (!result.ok) {
          state = { ...state, saveState: { kind: 'error', message: 'Yayınlanamadı. Tekrar deneyin.' } };
          emit();
          return { ok: false, issues: result.reason === 'invalid' ? result.issues : [] };
        }
        commit({ published: structuredClone(state.draft) });
        return { ok: true };
      } finally {
        publishing = false;
      }
    },
    discardDraft: () => commit({ draft: structuredClone(state.published) }),
    reset: () => {
      repo = createMemoryRepository(seed);
      commit({ draft: structuredClone(seed), published: structuredClone(seed), messages: sampleMessages() });
    },
    setMessageStatus: (id, status) =>
      commit({ messages: state.messages.map((m) => (m.id === id ? { ...m, status } : m)) }),
  };
};
