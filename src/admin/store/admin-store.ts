import { createMemoryRepository } from '@/content/store';
import type { ContentRepository } from '@/content/store';
import { validate } from '@/content/validate';
import type { Issue } from '@/content/validate';
import type { InboxMessage, SiteContent } from '@/content/types';
import { DEMO_INBOX_NAME, readDemoInbox } from './demo-inbox';
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
  /** Epoch milliseconds of the last successful publish; null when never published. */
  lastPublishedAt: number | null;
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
  /** Writes any pending change to storage now. */
  flush(): void;
  /** Flushes and detaches the page listeners. */
  dispose(): void;
}

type Persisted = {
  version: 1;
  draft: SiteContent;
  published: SiteContent;
  messages: InboxMessage[];
  lastPublishedAt?: number | null;
};

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
const PERSIST_DELAY_MS = 300;

/** Media files that were `blob:` URLs in a stored draft; the browser drops them on reload. */
const lostBlobFiles = (draft: SiteContent): Map<string, string> => {
  const lost = new Map<string, string>();
  for (const m of draft.media) if (m.file.startsWith('blob:')) lost.set(m.id, m.file);
  return lost;
};

type Fields = Omit<AdminState, 'dirty' | 'issues'>;

/** Mock editing store: a draft and a published copy, kept in the browser only. */
export const createAdminStore = (seed: SiteContent, storage: StorageLike | null): AdminStore => {
  const saved = read(storage);
  const listeners = new Set<() => void>();
  let publishing = false;
  let repo: ContentRepository = createMemoryRepository(saved?.published ?? seed);
  const lostFiles = saved ? lostBlobFiles(saved.draft) : new Map<string, string>();

  // `dirty` and `issues` are computed on read and cached per object identity, so a keystroke
  // costs nothing unless a consumer reads them. Every read is exact; nothing is stale.
  let issuesFor: SiteContent | null = null;
  let issuesValue: Issue[] = [];
  const computeIssues = (draft: SiteContent): Issue[] => {
    if (issuesFor === draft) return issuesValue;
    const list = validate(draft);
    draft.media.forEach((m, i) => {
      if (lostFiles.get(m.id) === m.file) list.push({ path: `media[${i}].file`, code: 'file-lost' });
    });
    issuesFor = draft;
    issuesValue = list;
    return list;
  };
  let dirtyDraft: SiteContent | null = null;
  let dirtyPublished: SiteContent | null = null;
  let dirtyValue = false;
  const computeDirty = (draft: SiteContent, published: SiteContent): boolean => {
    if (dirtyDraft !== draft || dirtyPublished !== published) {
      dirtyValue = !same(draft, published);
      dirtyDraft = draft;
      dirtyPublished = published;
    }
    return dirtyValue;
  };

  const build = (f: Fields): AdminState =>
    Object.defineProperties({ ...f } as AdminState, {
      dirty: { enumerable: true, get: () => computeDirty(f.draft, f.published) },
      issues: { enumerable: true, get: () => computeIssues(f.draft) },
    });

  const initialDraft = saved?.draft ?? structuredClone(seed);
  const initialPublished = saved?.published ?? structuredClone(seed);
  let state: AdminState = build({
    draft: initialDraft,
    published: initialPublished,
    messages: saved?.messages ?? sampleMessages(),
    saveState: { kind: 'idle' },
    lastPublishedAt: typeof saved?.lastPublishedAt === 'number' ? saved.lastPublishedAt : null,
  });

  const set = (patch: Partial<Fields>) => {
    const { draft, published, messages, saveState, lastPublishedAt } = state;
    state = build({ draft, published, messages, saveState, lastPublishedAt, ...patch });
  };

  const emit = () => listeners.forEach((l) => l());

  const persistNow = (): SaveState => {
    if (!storage) return { kind: 'error', message: STORAGE_ERROR };
    try {
      const data: Persisted = {
        version: 1,
        draft: state.draft,
        published: state.published,
        messages: state.messages,
        lastPublishedAt: state.lastPublishedAt,
      };
      storage.setItem(STORAGE_NAME, JSON.stringify(data));
      return { kind: 'saved', at: new Date().toISOString() };
    } catch {
      return { kind: 'error', message: STORAGE_ERROR };
    }
  };

  let timer: ReturnType<typeof setTimeout> | null = null;
  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const flush = () => {
    if (timer === null) return;
    clearTimer();
    const next = persistNow();
    // A repeated failure keeps the same error state: no new state, no new notification.
    if (next.kind === 'error' && state.saveState.kind === 'error') return;
    set({ saveState: next });
    emit();
  };

  // Typing commits often, so the write is debounced; publish, discard and reset write at once.
  const commit = (patch: Partial<Fields>, immediate = false) => {
    set(patch);
    clearTimer();
    if (immediate) {
      set({ saveState: persistNow() });
    } else {
      timer = setTimeout(flush, PERSIST_DELAY_MS);
      if (state.saveState.kind === 'idle' || state.saveState.kind === 'saved') set({ saveState: { kind: 'saving' } });
    }
    emit();
  };

  const onHidden = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (inBrowser) {
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', flush);
  }

  const queued = storage ? readDemoInbox(storage) : [];
  if (queued.length) {
    const known = new Set(state.messages.map((m) => m.id));
    set({ messages: [...state.messages, ...queued.filter((m) => !known.has(m.id))] });
    set({ saveState: persistNow() });
    // Keep the queue until the merged inbox is stored, so a blocked write loses nothing.
    if (state.saveState.kind === 'saved') {
      try {
        storage?.removeItem(DEMO_INBOX_NAME);
      } catch {
        // The ids above keep a second merge from duplicating anything.
      }
    }
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    flush,
    dispose: () => {
      flush();
      if (inBrowser) {
        document.removeEventListener('visibilitychange', onHidden);
        window.removeEventListener('pagehide', flush);
      }
    },
    updateDraft: (next) => {
      const draft = typeof next === 'function' ? next(state.draft) : next;
      if (draft !== state.draft) commit({ draft });
    },
    publish: async () => {
      if (publishing) return { ok: false, issues: [] };
      const issues = state.issues;
      if (issues.length) return { ok: false, issues };
      publishing = true;
      set({ saveState: { kind: 'saving' } });
      emit();
      try {
        const { rev } = await repo.getContent();
        const result = await repo.saveContent(state.draft, rev);
        if (!result.ok) {
          set({ saveState: { kind: 'error', message: 'Yayınlanamadı. Tekrar deneyin.' } });
          emit();
          return { ok: false, issues: result.reason === 'invalid' ? result.issues : [] };
        }
        commit({ published: structuredClone(state.draft), lastPublishedAt: Date.now() }, true);
        return { ok: true };
      } finally {
        publishing = false;
      }
    },
    discardDraft: () => commit({ draft: structuredClone(state.published) }, true),
    reset: () => {
      repo = createMemoryRepository(seed);
      commit(
        {
          draft: structuredClone(seed),
          published: structuredClone(seed),
          messages: sampleMessages(),
          lastPublishedAt: null,
        },
        true,
      );
    },
    setMessageStatus: (id, status) => {
      if (!state.messages.some((m) => m.id === id && m.status !== status)) return;
      commit({ messages: state.messages.map((m) => (m.id === id ? { ...m, status } : m)) });
    },
  };
};
