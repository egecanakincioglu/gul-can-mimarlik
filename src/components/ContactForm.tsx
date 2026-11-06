'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

const types = ['Mimari Proje', 'İç Mimarlık', '3D & Animasyon', 'Uygulama & Anahtar Teslim', 'Diğer'];
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'message' | 'type', string>>;

export default function ContactForm() {
  const [type, setType] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Errors = {};
    if (v('name').length < 3) err.name = 'Lütfen adınızı ve soyadınızı yazın.';
    if (!/^[+\d][\d\s()-]{9,}$/.test(v('phone'))) err.phone = 'Geçerli bir telefon numarası yazın.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = 'Geçerli bir e-posta adresi yazın.';
    if (!type) err.type = 'Bir proje türü seçin.';
    if (v('message').length < 10) err.message = 'Mesajınız en az 10 karakter olmalı.';
    setErrors(err);
    setDone(Object.keys(err).length === 0);
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
    <form onSubmit={submit} noValidate className="grid gap-9" aria-label="Demo iletişim formu">
      <p className="badge self-start">Demo form — mesaj gönderilmez.</p>
      {field('name', 'Ad Soyad', { autoComplete: 'name' })}
      <div className="grid gap-9 md:grid-cols-2">
        {field('phone', 'Telefon', { type: 'tel', autoComplete: 'tel' })}
        {field('email', 'E-posta', { type: 'email', autoComplete: 'email' })}
      </div>

      <fieldset>
        <legend className="label muted">Proje türü</legend>
        <div className="mt-3 flex flex-wrap gap-2" role="group">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className="min-h-[44px] border border-pose px-4 text-[15px] font-medium aria-pressed:bg-pose aria-pressed:text-kirec"
            >
              {t}
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="err mt-2 text-[14px] font-medium" role="alert">
            {errors.type}
          </p>
        )}
      </fieldset>

      <label className="field" htmlFor="location">
        <span className="label muted">Konum (isteğe bağlı)</span>
        <input id="location" name="location" />
      </label>

      <label className="field" htmlFor="message">
        <span className="label muted">Mesaj</span>
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
          <span>Formu doğrula</span>
          <span className="arr" aria-hidden>
            →
          </span>
        </button>
        {done && (
          <p className="font-medium" role="status">
            Demo: Form doğrulandı, gerçek gönderim yapılmadı.
          </p>
        )}
      </div>
    </form>
  );
}
