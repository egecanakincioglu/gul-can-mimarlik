'use client';

import { useId } from 'react';
import Notice from './Notice';

export type SelectOption = { value: string; label: string };

export default function SelectField({
  label,
  value,
  options,
  onChange,
  helper,
  warning,
  error,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  helper?: string;
  warning?: string;
  error?: string;
}) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = [helper && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field adm-field adm-boxed adm-select">
      <label htmlFor={id} className="label adm-field-label">
        {label}
      </label>
      <select
        id={id}
        value={value}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helper && (
        <p id={helperId} className="caption adm-field-note">
          {helper}
        </p>
      )}
      {warning && <Notice variant="warning">{warning}</Notice>}
      <p id={errorId} className="err" aria-live="polite">
        {error}
      </p>
    </div>
  );
}
