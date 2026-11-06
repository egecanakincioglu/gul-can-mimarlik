'use client';

import { useState } from 'react';
import { phoneHref } from '@/content/select';
import type { Contact } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import { ScreenFrame, Section } from './Frame';
import { emailError, phoneError, requiredText } from './rules';

const USAGE = [
  'Alt bilgi (telefon, e-posta, adres)',
  'İletişim sayfası (arama ve e-posta bağlantıları)',
  'Stüdyo sayfası',
];

export default function ContactInfoScreen() {
  const { draft, updateDraft } = useAdminStore();
  const { contact } = draft;

  const set = (patch: Partial<Contact>) => updateDraft((c) => ({ ...c, contact: { ...c.contact, ...patch } }));
  const [removed, setRemoved] = useState<{ index: number; line: string } | null>(null);
  const setLine = (i: number, value: string) => set({ address: contact.address.map((l, k) => (k === i ? value : l)) });

  const removeLine = (index: number) => {
    setRemoved({ index, line: contact.address[index] });
    set({ address: contact.address.filter((_, k) => k !== index) });
  };
  const undoRemove = () => {
    if (!removed) return;
    const at = Math.min(removed.index, contact.address.length);
    set({ address: [...contact.address.slice(0, at), removed.line, ...contact.address.slice(at)] });
    setRemoved(null);
  };

  return (
    <ScreenFrame title="İletişim bilgileri" intro="Sitenin her yerinde aynı bilgiler kullanılır.">
      <Section title="Telefon ve e-posta">
        <Field
          boxed
          label="Telefon"
          type="tel"
          autoComplete="tel"
          value={contact.phone}
          error={phoneError(contact.phone)}
          onChange={(phone) => set({ phone })}
        />
        {!phoneError(contact.phone) && <p className="caption adm-site-note">Arama bağlantısı: {phoneHref(draft)}</p>}
        <Field
          boxed
          label="E-posta"
          type="email"
          autoComplete="email"
          value={contact.email}
          error={emailError(contact.email)}
          onChange={(email) => set({ email })}
        />
      </Section>

      <Section title="Adres">
        <ul className="adm-reset-list adm-site-lines">
          {contact.address.map((line, i) => (
            <li key={i}>
              <Field
                boxed
                label={`Adres satırı ${i + 1}`}
                value={line}
                error={requiredText(line)}
                onChange={(v) => setLine(i, v)}
              />
              <Button
                variant="destructive"
                disabled={contact.address.length === 1}
                aria-label={`Sil: Adres satırı ${i + 1}`}
                onClick={() => removeLine(i)}
              >
                Sil
              </Button>
            </li>
          ))}
        </ul>
        {contact.address.length === 1 && <p className="caption adm-site-note">En az bir adres satırı gerekir.</p>}
        <p role="status" className="adm-site-note">
          {removed && (
            <>
              Satır kaldırıldı. <Button onClick={undoRemove}>Geri al</Button>
            </>
          )}
        </p>
        <div className="adm-site-actions">
          <Button onClick={() => set({ address: [...contact.address, ''] })}>Satır ekle</Button>
        </div>
      </Section>

      <Section title="Kullanıldığı yerler">
        <ul className="adm-reset-list adm-site-plain">
          {USAGE.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </Section>
    </ScreenFrame>
  );
}
