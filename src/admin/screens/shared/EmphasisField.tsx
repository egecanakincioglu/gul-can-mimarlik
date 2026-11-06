'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Rich } from '@/content/types';
import Button from '../../ui/Button';
import { fromMarked, insideBold, isBalanced, sameRich, toMarked } from './emphasis.ts';
import './emphasis.css';

type Props = {
  label: string;
  value: Rich;
  onChange: (value: Rich) => void;
  /** Weight of unmarked text; leave out when the heading inherits its weight. */
  plain?: 300;
  /** Weight the public heading gives to unmarked text (its display class). */
  baseWeight: 300 | 600;
  helper?: string;
  max?: number;
  error?: string;
};

export default function EmphasisField({ label, value, onChange, plain, baseWeight, helper, max, error }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const caret = useRef<[number, number] | null>(null);
  const [raw, setRaw] = useState(() => toMarked(value, plain));
  const [sel, setSel] = useState<[number, number]>([0, 0]);

  const parsed = fromMarked(raw, plain);
  if (!sameRich(parsed, value)) {
    // The draft changed from outside (for example "Taslağı at"); follow it.
    setRaw(toMarked(value, plain));
  }

  useEffect(() => {
    if (!caret.current) return;
    input.current?.setSelectionRange(...caret.current);
    caret.current = null;
  }, [raw, sel]);

  const apply = (next: string, selection: [number, number]) => {
    setRaw(next);
    setSel(selection);
    caret.current = selection;
    onChange(fromMarked(next, plain));
  };

  const readSelection = () => {
    const el = input.current;
    if (el) setSel([el.selectionStart ?? 0, el.selectionEnd ?? 0]);
  };

  const [start, end] = sel;
  const pressed = insideBold(raw, start) && !raw.slice(start, end).includes('*');

  const toggle = () => {
    const picked = raw.slice(start, end);
    if (pressed) {
      const open = raw.lastIndexOf('*', start - 1);
      const close = raw.indexOf('*', end);
      if (open < 0 || close < 0) return;
      apply(raw.slice(0, open) + raw.slice(open + 1, close) + raw.slice(close + 1), [start - 1, end - 1]);
    } else if (start === end) {
      apply(`${raw.slice(0, start)}**${raw.slice(start)}`, [start + 1, start + 1]);
    } else if (picked.includes('*')) {
      const clean = picked.replace(/\*/g, '');
      apply(raw.slice(0, start) + clean + raw.slice(end), [start, start + clean.length]);
    } else {
      apply(`${raw.slice(0, start)}*${picked}*${raw.slice(end)}`, [start + 1, end + 1]);
    }
    input.current?.focus();
  };

  const length = parsed.reduce((n, s) => n + s.text.length, 0);
  const message = error ?? (isBalanced(raw) ? undefined : 'Vurgu işaretleri (* ve _) çift olmalıdır.');
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  return (
    <div className="field adm-field adm-boxed">
      <div className="adm-emphasis-tools">
        <label htmlFor={id} className="label adm-field-label">
          {label}
        </label>
        <Button aria-pressed={pressed} aria-label={`Vurgu: ${label}`} onClick={toggle}>
          Vurgu
        </Button>
      </div>
      <input
        ref={input}
        id={id}
        type="text"
        value={raw}
        aria-describedby={[helperId, message && errorId].filter(Boolean).join(' ')}
        aria-invalid={message ? true : undefined}
        onChange={(e) => {
          const el = e.target;
          apply(el.value, [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length]);
        }}
        onSelect={readSelection}
        onKeyUp={readSelection}
        onClick={readSelection}
      />
      <p id={helperId} className="caption adm-field-note">
        {helper ??
          `Kalın yazmak için sözcüğü seçip Vurgu'ya basın veya *sözcük* yazın.${plain === undefined ? ' İnce yazmak için _sözcük_ yazın.' : ''}`}
        {max !== undefined && ` ${length}/${max}`}
      </p>
      {message && (
        <p id={errorId} className="err">
          {message}
        </p>
      )}
      <div className="adm-emphasis-sample">
        <span className="caption">Önizleme:</span>
        <p className="adm-emphasis-preview" style={{ fontWeight: baseWeight }}>
          {value.map((s, i) => (
            <span key={i} className={s.weight === 800 ? 'w8' : (s.weight ?? plain) === 300 ? 'w3' : undefined}>
              {s.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
