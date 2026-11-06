'use client';

import type { ReactNode } from 'react';
import Button from '../../ui/Button';
import SortableList from '../../ui/SortableList';
import { keyed } from './model';
import type { Keyed } from './model';

type Props<T> = {
  title: string;
  /** Singular name used in button and move labels, for example "Paragraf". */
  noun: string;
  items: Keyed<T>[];
  onChange: (next: Keyed<T>[]) => void;
  make?: () => T;
  /** Replaces the default add button (rows that need a choice before they exist). */
  addSlot?: ReactNode;
  renderRow: (value: T, index: number, set: (next: T) => void) => ReactNode;
};

/** Sortable list of editable rows with add and remove. */
export default function KeyedList<T>({ title, noun, items, onChange, make, addSlot, renderRow }: Props<T>) {
  const indexOf = (item: Keyed<T>) => items.findIndex((x) => x.key === item.key);
  return (
    <div className="pj-list">
      <h3 className="label">{title}</h3>
      {items.length === 0 && <p className="caption">Henüz satır yok.</p>}
      <SortableList
        items={items}
        getId={(item) => item.key}
        getLabel={(item) => `${noun} ${indexOf(item) + 1}`}
        onChange={onChange}
        renderItem={(item) => {
          const i = indexOf(item);
          return (
            <span className="pg-stack">
              {renderRow(item.value, i, (value) =>
                onChange(items.map((x) => (x.key === item.key ? { ...x, value } : x))),
              )}
              <Button
                variant="destructive"
                aria-label={`Kaldır: ${noun} ${i + 1}`}
                onClick={() => onChange(items.filter((x) => x.key !== item.key))}
              >
                Kaldır
              </Button>
            </span>
          );
        }}
      />
      {addSlot ?? (make && <Button onClick={() => onChange([...items, keyed(make())])}>{`${noun} ekle`}</Button>)}
    </div>
  );
}
