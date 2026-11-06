import type { SiteContent } from '@/content/types';

export const DRAFT_MESSAGE = 'gcm-preview:draft';
export const READY_MESSAGE = 'gcm-preview:ready';

export type PreviewMessage = { type: typeof DRAFT_MESSAGE; content: SiteContent } | { type: typeof READY_MESSAGE };

const looksLikeContent = (v: unknown): v is SiteContent => {
  if (!v || typeof v !== 'object') return false;
  const c = v as Partial<SiteContent>;
  return c.version === 1 && Array.isArray(c.projects) && Array.isArray(c.media) && !!c.home && !!c.site;
};

/** Narrows an untrusted message payload; anything unknown is rejected. */
export const parsePreviewMessage = (data: unknown): PreviewMessage | null => {
  if (!data || typeof data !== 'object') return null;
  const m = data as { type?: unknown; content?: unknown };
  if (m.type === READY_MESSAGE) return { type: READY_MESSAGE };
  if (m.type === DRAFT_MESSAGE && looksLikeContent(m.content)) return { type: DRAFT_MESSAGE, content: m.content };
  return null;
};
