'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import './site.css';

export function ScreenFrame({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="adm-site">
      <h1 className="adm-title">{title}</h1>
      {intro && <p className="adm-site-intro">{intro}</p>}
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="adm-site-section" aria-labelledby={id}>
      <h2 id={id} className="label">
        {title}
      </h2>
      {children}
    </section>
  );
}
