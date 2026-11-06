'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';

export default function LoginForm({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <main className="adm-login-wrap">
      <form onSubmit={submit} noValidate className="adm-login" aria-labelledby="adm-login-title">
        <h1 id="adm-login-title" className="adm-title">
          Yönetim paneli
        </h1>
        <Field boxed label="E-posta" type="email" name="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          boxed
          label="Parola"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <Button type="submit" variant="primary">
          Giriş
        </Button>
        <p className="caption">Demo oturumu</p>
      </form>
    </main>
  );
}
