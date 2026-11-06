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

/** Advisory message: text and a 3px rule carry the meaning, not colour. */
export function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="adm-site-warn">
      <span className="label">Uyarı</span> {children}
    </p>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="field adm-field adm-boxed">
      <label htmlFor={id} className="label adm-field-label">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
