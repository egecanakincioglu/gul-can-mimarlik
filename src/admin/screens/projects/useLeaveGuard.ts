'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * While `active`, the browser warns before the page unloads and clicks on in-app links are held back
 * so the caller can ask first. `leave` replays the held click.
 */
export function useLeaveGuard(active: boolean) {
  const [held, setHeld] = useState<HTMLAnchorElement | null>(null);
  const replaying = useRef(false);

  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = (e: MouseEvent) => {
      if (replaying.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setHeld(link);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [active]);

  return {
    asking: held !== null,
    stay: () => setHeld(null),
    leave: () => {
      const link = held;
      setHeld(null);
      if (!link) return;
      replaying.current = true;
      link.click();
      replaying.current = false;
    },
  };
}
