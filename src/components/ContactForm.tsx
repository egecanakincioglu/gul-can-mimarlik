'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { addDemoMessage } from '@/admin/store/demo-inbox';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'message' | 'type', string>>;

export type ContactFormTexts = {
  ariaLabel: string;
  /** Demo badge; null hides it. */
  badge: string | null;
  fields: Record<'name' | 'phone' | 'email' | 'type' | 'location' | 'message', string>;
  locationEnabled: boolean;
  projectTypes: { id: string; label: string }[];
  errors: Record<'name' | 'phone' | 'email' | 'type' | 'message', string>;
  submit: string;
  success: string;
};

export default function ContactForm({ texts }: { texts: ContactFormTexts }) {
  const [type, setType] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Errors = {};
    if (v('name').length < 3) err.name = texts.errors.name;
    if (!/^[+\d][\d\s()-]{9,}$/.test(v('phone'))) err.phone = texts.errors.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = texts.errors.email;
    if (!type) err.type = texts.errors.type;
    if (v('message').length < 10) err.message = texts.errors.message;
    setErrors(err);
    const valid = Object.keys(err).length === 0;
    setDone(valid);
    if (valid) {
      const location = v('location');
      addDemoMessage({
        name: v('name'),
        phone: v('phone'),
        email: v('email'),
        projectType: type,
        ...(location ? { location } : {}),
        message: v('message'),
      });
    }
    const first = (['name', 'phone', 'email', 'type', 'message'] as const).find((k) => err[k]);
    if (first === 'type') e.currentTarget.querySelector<HTMLElement>('fieldset button')?.focus();
    else if (first) e.currentTarget.querySelector<HTMLElement>(`#${first}`)?.focus();
  };

  const field = (id: keyof Errors, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field" htmlFor={id}>
      <span className="label muted">{label}</span>
      <input
        id={id}
        name={id}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-e` : undefined}
        {...props}
      />
      {errors[id] && (
        <p id={`${id}-e`} className="err" role="alert">
          {errors[id]}
        </p>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-9" aria-label={texts.ariaLabel}>
      {texts.badge && <p className="badge self-start">{texts.badge}</p>}
      {field('name', texts.fields.name, { autoComplete: 'name' })}
      <div className="grid gap-9 md:grid-cols-2">
        {field('phone', texts.fields.phone, { type: 'tel', autoComplete: 'tel' })}
        {field('email', texts.fields.email, { type: 'email', autoComplete: 'email' })}
      </div>

      <fieldset>
        <legend className="label muted">{texts.fields.type}</legend>
        <div className="mt-3 flex flex-wrap gap-2" role="group">
          {texts.projectTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.label}
              onClick={() => setType(t.label)}
              className="min-h-[44px] border border-pose px-4 text-[15px] font-medium aria-pressed:bg-pose aria-pressed:text-kirec"
            >
              {t.label}
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="err mt-2 text-[14px] font-medium" role="alert">
            {errors.type}
          </p>
        )}
      </fieldset>

      {texts.locationEnabled && (
        <label className="field" htmlFor="location">
          <span className="label muted">{texts.fields.location}</span>
          <input id="location" name="location" />
        </label>
      )}

      <label className="field" htmlFor="message">
        <span className="label muted">{texts.fields.message}</span>
        <textarea
          id="message"
          name="message"
          rows={4}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-e' : undefined}
        />
        {errors.message && (
          <p id="message-e" className="err" role="alert">
            {errors.message}
          </p>
        )}
      </label>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <button type="submit" className="btn w-full md:w-auto">
          <span>{texts.submit}</span>
          <span className="arr" aria-hidden>
            →
          </span>
        </button>
        {done && (
          <p className="font-medium" role="status">
            {texts.success}
          </p>
        )}
      </div>
    </form>
  );
}
