'use client';

import { useId } from 'react';

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  error?: string;
  /** Shows a "length/max" counter; it is a hint, the input is not capped. */
  max?: number;
  boxed?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
};

export default function Field({
  label,
  value,
  onChange,
  helper,
  error,
  max,
  boxed,
  multiline,
  rows = 4,
  type = 'text',
  name,
  autoComplete,
  required,
}: FieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const counterId = `${id}-counter`;
  const errorId = `${id}-error`;
  const describedBy =
    [helper && helperId, max !== undefined && counterId, error && errorId].filter(Boolean).join(' ') || undefined;

  const shared = {
    id,
    name,
    value,
    required,
    autoComplete,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  };

  return (
    <div className={boxed ? 'field adm-field adm-boxed' : 'field adm-field'}>
      <label htmlFor={id} className="label adm-field-label">
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
      {helper && (
        <p id={helperId} className="caption adm-field-note">
          {helper}
        </p>
      )}
      {max !== undefined && (
        <p id={counterId} className="caption adm-field-note">
          {value.length}/{max}
        </p>
      )}
      {error && (
        <p id={errorId} className="err">
          {error}
        </p>
      )}
    </div>
  );
}
