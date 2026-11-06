import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import type { StorageLike } from '../store/admin-store';
import { AdminStoreProvider, useAdminStore } from '../store/AdminStoreProvider';
import AdminShell from './AdminShell';

const linkRenders = vi.hoisted(() => ({ count: 0 }));

// Every link in the shell body is re-created whenever the shell renders, so counting link renders counts shell renders.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => {
    linkRenders.count += 1;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

afterEach(cleanup);

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const memoryStorage = (): StorageLike => {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

describe('AdminShell subscriptions', () => {
  it('does not re-render on a draft text change but keeps the unread count live', async () => {
    const Controls = () => {
      const { draft, messages, updateDraft, setMessageStatus } = useAdminStore();
      return (
        <>
          <button onClick={() => updateDraft({ ...draft, site: { ...draft.site, name: `${draft.site.name}!` } })}>
            Düzenle
          </button>
          <button onClick={() => setMessageStatus(messages.find((m) => m.status === 'new')?.id ?? '', 'read')}>
            Okundu
          </button>
        </>
      );
    };
    render(
      <AdminStoreProvider storage={memoryStorage()}>
        <AdminShell pathname="/yonetim">
          <Controls />
        </AdminShell>
      </AdminStoreProvider>,
    );
    await screen.findByRole('main');
    // Mount effects (hydration, timers) can still re-render the shell after the first paint; wait until the count holds still.
    let settled = -1;
    while (settled !== linkRenders.count) {
      settled = linkRenders.count;
      await act(() => new Promise((resolve) => setTimeout(resolve, 400)));
    }
    expect(settled).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Düzenle' }));
    // PublishPanel re-renders (it reads the draft) but renders no link while nothing is published.
    expect(linkRenders.count).toBe(settled);
    expect(seed.site.name).toBeTruthy();

    const before = screen.getByRole('link', { name: /Gelen kutusu/ }).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Okundu' }));
    expect(screen.getByRole('link', { name: /Gelen kutusu/ }).textContent).not.toBe(before);
    expect(linkRenders.count).toBeGreaterThan(settled);
  });
});
