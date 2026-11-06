'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { getContent } from '@/content';
import Skeleton from '../ui/Skeleton';
import { createAdminStore } from './admin-store';
import type { AdminState, AdminStore, StorageLike } from './admin-store';

const StoreContext = createContext<AdminStore | null>(null);

const browserStorage = (): StorageLike | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** `storage` is injectable for tests; `undefined` means the browser localStorage. */
export function AdminStoreProvider({ children, storage }: { children: ReactNode; storage?: StorageLike | null }) {
  const [store, setStore] = useState<AdminStore | null>(null);

  useEffect(() => {
    let live = true;
    void getContent().then((seed) => {
      if (live) setStore(createAdminStore(seed, storage === undefined ? browserStorage() : storage));
    });
    return () => {
      live = false;
    };
  }, [storage]);

  if (!store) {
    return (
      <div aria-busy="true" className="adm-loading">
        <p className="sr-only" role="status">
          Yükleniyor
        </p>
        <Skeleton height={64} />
        <Skeleton height={240} />
      </div>
    );
  }
  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useAdminStore(): AdminState & Omit<AdminStore, 'getState' | 'subscribe'> {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAdminStore must be used inside AdminStoreProvider');
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  return {
    ...state,
    updateDraft: store.updateDraft,
    publish: store.publish,
    discardDraft: store.discardDraft,
    reset: store.reset,
    setMessageStatus: store.setMessageStatus,
  };
}
