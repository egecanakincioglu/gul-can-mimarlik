import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import type { SiteContent } from '@/content/types';
import { AdminStoreProvider, useAdminStore } from '../store/AdminStoreProvider';
import type { StorageLike } from '../store/admin-store';
import PublishPanel from './PublishPanel';

let seed: SiteContent;
beforeAll(async () => {
  seed = await getContent();
  const proto = HTMLDialogElement.prototype;
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});
afterEach(cleanup);

const memoryStorage = (): StorageLike => {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

function Edits() {
  const { updateDraft, draft } = useAdminStore();
  return (
    <>
      <p data-testid="name">{draft.site.name}</p>
      <button onClick={() => updateDraft((c) => ({ ...c, site: { ...c.site, name: 'Yeni ad' } }))}>rename</button>
      <button
        onClick={() =>
          updateDraft((c) => ({
            ...c,
            projects: c.projects.map((p, i) => (i === 0 ? { ...p, concept: true, location: 'X', year: 2020 } : p)),
          }))
        }
      >
        break project
      </button>
      <button
        onClick={() =>
          updateDraft((c) => ({
            ...c,
            media: c.media.map((m, i) => (i === 0 ? { ...m, alt: '', decorative: false } : m)),
          }))
        }
      >
        break
      </button>
    </>
  );
}

const setup = async () => {
  render(
    <AdminStoreProvider storage={memoryStorage()}>
      <Edits />
      <PublishPanel />
    </AdminStoreProvider>,
  );
  await screen.findByTestId('name');
};

const publishButton = () => screen.getAllByRole('button', { name: 'Yayınla', hidden: true })[0] as HTMLButtonElement;

describe('PublishPanel', () => {
  it('lists each issue with a link to its screen and offers no confirm while the draft is invalid', async () => {
    await setup();
    fireEvent.click(screen.getByText('break'));
    const open = await screen.findByRole('button', { name: /^Yayınla \(\d+ sorun\)$/ });
    fireEvent.click(open);
    const dialog = openDialog();
    const link = within(dialog).getByRole('link', { name: 'Görsel açıklaması boş', hidden: true });
    expect(link.getAttribute('href')).toBe('/yonetim/medya');
    expect(within(dialog).queryByRole('button', { name: 'Yayınla', hidden: true })).toBeNull();
  });

  it('links project issues by slug', async () => {
    await setup();
    fireEvent.click(screen.getByText('break project'));
    fireEvent.click(await screen.findByRole('button', { name: /sorun\)$/ }));
    const link = within(openDialog()).getByRole('link', { name: 'Konsept projede konum ve yıl olmaz', hidden: true });
    expect(link.getAttribute('href')).toBe(`/yonetim/projeler/${seed.projects[0].slug}`);
  });

  it('confirms a valid change, then reports the time', async () => {
    await setup();
    fireEvent.click(screen.getByText('rename'));
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Yeni ad'));
    fireEvent.click(publishButton());
    const dialog = openDialog();
    expect(within(dialog).getByText('Değişiklikler yayınlansın mı?')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Yayınla', hidden: true }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/^Yayınlandı \d{2}:\d{2}$/));
  });

  it('cancelling the confirm dialog publishes nothing', async () => {
    await setup();
    fireEvent.click(screen.getByText('rename'));
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Yeni ad'));
    fireEvent.click(publishButton());
    fireEvent.click(within(openDialog()).getByRole('button', { name: 'Vazgeç', hidden: true }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('discards the draft only after confirmation', async () => {
    await setup();
    fireEvent.click(screen.getByText('rename'));
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe('Yeni ad'));
    fireEvent.click(screen.getByRole('button', { name: 'Taslağı at' }));
    const dialog = openDialog();
    expect(screen.getByTestId('name').textContent).toBe('Yeni ad');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Taslağı at', hidden: true }));
    await waitFor(() => expect(screen.getByTestId('name').textContent).toBe(seed.site.name));
  });
});

const openDialog = () => {
  const d = document.querySelector('dialog[open]');
  if (!d) throw new Error('no open dialog');
  return d as HTMLElement;
};
