import { validate } from './validate';
import type { Issue } from './validate';
import type { InboxMessage, SiteContent } from './types';

type SaveResult =
  | { ok: true; rev: number }
  | { ok: false; reason: 'conflict'; rev: number }
  | { ok: false; reason: 'invalid'; issues: Issue[] };

type NewMessage = Omit<InboxMessage, 'id' | 'receivedAt' | 'status'>;

export interface ContentRepository {
  getContent(): Promise<{ content: SiteContent; rev: number }>;
  /** Saves only when `expectedRev` is the current revision and the content validates. */
  saveContent(next: SiteContent, expectedRev: number): Promise<SaveResult>;
  listMessages(): Promise<InboxMessage[]>;
  setMessageStatus(id: string, status: InboxMessage['status']): Promise<boolean>;
  addMessage(message: NewMessage): Promise<InboxMessage>;
}

/** In-memory repository for the mock phase; nothing is shared with the public site. */
export const createMemoryRepository = (seed: SiteContent): ContentRepository => {
  let content = structuredClone(seed);
  let rev = 1;
  const messages: InboxMessage[] = [];

  return {
    getContent: async () => ({ content: structuredClone(content), rev }),
    saveContent: async (next, expectedRev) => {
      if (expectedRev !== rev) return { ok: false, reason: 'conflict', rev };
      const issues = validate(next);
      if (issues.length) return { ok: false, reason: 'invalid', issues };
      content = structuredClone(next);
      rev += 1;
      return { ok: true, rev };
    },
    listMessages: async () => messages.map((m) => ({ ...m })),
    setMessageStatus: async (id, status) => {
      const m = messages.find((x) => x.id === id);
      if (!m) return false;
      m.status = status;
      return true;
    },
    addMessage: async (message) => {
      const added: InboxMessage = {
        ...message,
        id: `message-${messages.length + 1}`,
        receivedAt: new Date().toISOString(),
        status: 'new',
      };
      messages.push(added);
      return { ...added };
    },
  };
};
