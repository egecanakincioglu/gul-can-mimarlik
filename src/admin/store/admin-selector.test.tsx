import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminStoreProvider, useAdminActions, useAdminSelector, useAdminStore } from './AdminStoreProvider';
import type { StorageLike } from './admin-store';

const storage: StorageLike = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };

describe('useAdminSelector', () => {
  it('does not re-render when an unrelated part of the state changes', async () => {
    let renders = 0;
    let updateDraft: ReturnType<typeof useAdminStore>['updateDraft'] = () => undefined;
    let setStatus: ReturnType<typeof useAdminStore>['setMessageStatus'] = () => undefined;
    let unread = -1;

    function Probe() {
      renders += 1;
      unread = useAdminSelector((s) => s.messages.filter((m) => m.status === 'new').length);
      return <p>{unread}</p>;
    }
    function Actions() {
      const api = useAdminStore();
      updateDraft = api.updateDraft;
      setStatus = api.setMessageStatus;
      return null;
    }

    const view = render(
      <AdminStoreProvider storage={storage}>
        <Probe />
        <Actions />
      </AdminStoreProvider>,
    );
    await view.findByText('2');
    // Let any render still queued from mounting finish, so the count below is stable.
    await act(async () => {});
    const before = renders;

    act(() => updateDraft((d) => ({ ...d, site: { ...d.site, name: 'Başka' } })));
    expect(renders).toBe(before);

    act(() => setStatus('sample-1', 'read'));
    expect(unread).toBe(1);
    expect(renders).toBeGreaterThan(before);
  });
});

describe('useAdminActions', () => {
  it('returns stable actions and never re-renders on state changes', async () => {
    let renders = 0;
    let actions: ReturnType<typeof useAdminActions> | null = null;
    const seen = new Set<unknown>();

    function Probe() {
      renders += 1;
      actions = useAdminActions();
      seen.add(actions.updateDraft);
      return <p>ready</p>;
    }
    const view = render(
      <AdminStoreProvider storage={storage}>
        <Probe />
      </AdminStoreProvider>,
    );
    await view.findByText('ready');
    await act(async () => {});
    const before = renders;
    act(() => actions?.updateDraft((d) => ({ ...d, site: { ...d.site, name: 'Başka' } })));
    expect(renders).toBe(before);
    expect(seen.size).toBe(1);
  });
});
