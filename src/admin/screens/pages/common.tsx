'use client';

import type { ComponentProps, ReactNode } from 'react';
import type { SiteContent } from '@/content/types';
import { useAdminStore } from '../../store/AdminStoreProvider';
import Field from '../../ui/Field';
import EditPreviewLayout from '../../preview/EditPreviewLayout';
import PreviewPane from '../../preview/PreviewPane';
import { allowedTokens, tokenError, tokenHelper } from '../shared/tokens.ts';
import ImagePicker from '../media/ImagePicker';
import { RATIOS } from '../media/ratios';
import type { ImageRef } from '@/content/types';
import './pages.css';

export function useContent() {
  const { draft, updateDraft } = useAdminStore();
  return { draft, update: (fn: (d: SiteContent) => SiteContent) => updateDraft(fn) };
}

export const replaceAt = <T,>(list: readonly T[], index: number, next: T): T[] =>
  list.map((x, i) => (i === index ? next : x));

const overMessage = (value: string, max?: number) =>
  max !== undefined && value.length > max ? `En çok ${max} karakter olmalı.` : undefined;

/** Boxed text field; a value over `max` shows an error text. */
export function TextField(props: Omit<ComponentProps<typeof Field>, 'boxed'>) {
  return <Field boxed {...props} error={props.error ?? overMessage(props.value, props.max)} />;
}

export function LongField(props: Omit<ComponentProps<typeof Field>, 'boxed' | 'multiline'>) {
  return <Field boxed multiline {...props} error={props.error ?? overMessage(props.value, props.max)} />;
}

/** Long text field that may hold {...} tokens: only the ones in `defaultText` are allowed. */
export function TokenField({
  defaultText,
  ...props
}: Omit<ComponentProps<typeof Field>, 'boxed' | 'multiline'> & { defaultText: string }) {
  const allowed = allowedTokens(defaultText);
  return (
    <LongField
      {...props}
      helper={props.helper ?? tokenHelper(allowed)}
      error={props.error ?? tokenError(allowed, props.value)}
    />
  );
}

/** `preview` is the preview route of the public page this screen edits; without it the screen has no preview. */
export function Screen({ title, children, preview }: { title: string; children: ReactNode; preview?: string }) {
  const { draft } = useAdminStore();
  return (
    <div className={preview === undefined ? 'pg' : 'pg pg-with-preview'}>
      <h1 className="adm-title">{title}</h1>
      {preview === undefined ? (
        children
      ) : (
        <EditPreviewLayout editor={children} preview={<PreviewPane src={preview} draft={draft} />} />
      )}
    </div>
  );
}

export function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <p className="pg-readonly">
      <span className="label">{label}</span> <span>{value}</span>{' '}
      <span className="caption">Otomatik, düzenlenemez.</span>
    </p>
  );
}

/** Required image slot: the library picker without the "remove" action. */
export function ImageField({
  label,
  ratio,
  value,
  onChange,
}: {
  label: string;
  ratio: keyof typeof RATIOS;
  value: ImageRef;
  onChange: (next: ImageRef) => void;
}) {
  const { draft } = useAdminStore();
  return (
    <ImagePicker
      label={label}
      slot={RATIOS[ratio]}
      media={draft.media}
      value={value}
      removable={false}
      onChange={(next) => next && onChange(next)}
    />
  );
}
