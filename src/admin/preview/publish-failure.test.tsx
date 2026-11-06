import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import PublishPanel from './PublishPanel';

let seed: SiteContent;
const publish = vi.fn(async () => ({ ok: false as const, issues: [] }));

vi.mock('../store/AdminStoreProvider', () => ({
  useAdminActions: () => ({ publish, discardDraft: () => {} }),
  useAdminSelector: <T,>(select: (s: unknown) => T): T =>
    select({
      draft: { ...seed, site: { ...seed.site, name: 'Yeni ad' } },
      published: seed,
      issues: [],
      dirty: true,
      lastPublishedAt: null,
    }),
}));

beforeAll(async () => {
  seed = await getContent();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});
afterEach(cleanup);

const confirmPublish = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Yayınla' }));
  const dialog = document.querySelector('dialog[open]') as HTMLElement;
  fireEvent.click(within(dialog).getByRole('button', { name: 'Yayınla', hidden: true }));
};

describe('PublishPanel failure', () => {
  it('announces a failed publish as an alert and clears it on the next attempt', async () => {
    render(<PublishPanel />);
    confirmPublish();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Yayınlanamadı. Tekrar deneyin.');
    expect(screen.getByRole('status').textContent).toBe('');
    publish.mockImplementationOnce(() => new Promise(() => {}));
    confirmPublish();
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
