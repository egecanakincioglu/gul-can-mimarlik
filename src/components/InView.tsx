'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* Sets data-in="1" once the element enters the viewport. CSS does the rest. */
export default function InView({
  children,
  className = '',
  from,
  delay,
  style,
}: {
  children: ReactNode;
  className?: string;
  from?: 'left' | 'right';
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // "" = visible by default (SSR / no JS / observer failure). Armed ("0") only after mount,
  // and only when the element is below the fold, so content can never stay hidden.
  const [state, setState] = useState<'' | '0' | '1'>('');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (
      calm ||
      typeof IntersectionObserver === 'undefined' ||
      el.getBoundingClientRect().top < window.innerHeight * 0.94
    ) {
      setState('1');
      return;
    }
    setState('0');
    // The wrapper is observed; CSS clips its children, so the observed box never collapses.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState('1');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-in={state || undefined}
      data-from={from}
      className={className}
      style={delay ? ({ ...style, '--d': `${delay}s` } as CSSProperties) : style}
    >
      {children}
    </div>
  );
}
