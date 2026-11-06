'use client';

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
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
    let created: AdminStore | null = null;
    void getContent().then((seed) => {
      if (!live) return;
      created = createAdminStore(seed, storage === undefined ? browserStorage() : storage);
      setStore(created);
    });
    return () => {
      live = false;
      created?.dispose();
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
    flush: store.flush,
    dispose: store.dispose,
  };
}

/**
 * Subscribes to a slice of the state. The component re-renders only when the selected
 * value changes (Object.is by default). Pass an equality function when the selector builds a new object.
 */
export function useAdminSelector<T>(selector: (s: AdminState) => T, isEqual: (a: T, b: T) => boolean = Object.is): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAdminSelector must be used inside AdminStoreProvider');
  const cache = useRef<{ state: AdminState; selector: (s: AdminState) => T; value: T } | null>(null);
  const getSnapshot = (): T => {
    const state = store.getState();
    const prev = cache.current;
    if (prev && prev.state === state && prev.selector === selector) return prev.value;
    const picked = selector(state);
    const value = prev && isEqual(prev.value, picked) ? prev.value : picked;
    cache.current = { state, selector, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
