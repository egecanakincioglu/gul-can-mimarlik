'use client';

import { useEffect } from 'react';

/* The full carving sequence plays once per session; later visits get the short version. */
export default function HeroMark() {
  useEffect(() => {
    try {
      sessionStorage.setItem('gc-hero', '1');
    } catch {}
  }, []);
  return null;
}
