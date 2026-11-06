'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import { keyed } from './model';
import type { Keyed } from './model';

type Props<T> = {
  title: string;
  /** Singular name used in the add button and announcements, for example "Paragraf". */
  noun: string;
  /** Lowercase accusative form used in button names, for example "paragrafı". */
  accusative: string;
  items: Keyed<T>[];
  onChange: (next: Keyed<T>[]) => void;
  make?: () => T;
  /** Replaces the default add button (rows that need a choice before they exist). */
  addSlot?: ReactNode;
  renderRow: (value: T, index: number, set: (next: T) => void) => ReactNode;
};

/** Reorderable list of editable rows with add, remove and one level of undo for a removal. */
export default function KeyedList<T>({ title, noun, accusative, items, onChange, make, addSlot, renderRow }: Props<T>) {
  const [removed, setRemoved] = useState<{ item: Keyed<T>; index: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const focusAfter = useRef<{ key: string; dir: 'up' | 'down' } | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    const row = Array.from(list.current?.children ?? []).find((el) => el.getAttribute('data-id') === target.key);
    const preferred = row?.querySelector<HTMLButtonElement>(`[data-move="${target.dir}"]:not(:disabled)`);
    (preferred ?? row?.querySelector<HTMLButtonElement>('[data-move]:not(:disabled)'))?.focus();
  }, [items]);

  useEffect(() => {
    if (removed) undoRef.current?.focus();
  }, [removed]);

  const move = (from: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    focusAfter.current = { key: item.key, dir };
    setAnnouncement(`${noun} ${from + 1}, ${items.length} içinden ${to + 1}. sıraya taşındı`);
    onChange(next);
  };

  const remove = (index: number) => {
    setRemoved({ item: items[index], index });
    onChange(items.filter((_, i) => i !== index));
  };

  const undo = () => {
    if (!removed) return;
    const next = items.slice();
    next.splice(Math.min(removed.index, next.length), 0, removed.item);
    setRemoved(null);
    onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    move(index, e.key === 'ArrowUp' ? 'up' : 'down');
  };

  return (
    <div className="pj-list">
      <h2 className="label pj-sub">{title}</h2>
      {items.length === 0 && (
        <EmptyState message="Henüz satır yok." description="Aşağıdaki düğmeyle ekleyebilirsiniz." />
      )}
      <ul ref={list} className="adm-reset-list pj-items">
        {items.map((item, i) => (
          <li key={item.key} data-id={item.key} className="pj-item" onKeyDown={(e) => onKeyDown(e, i)}>
            {renderRow(item.value, i, (value) =>
              onChange(items.map((x) => (x.key === item.key ? { ...x, value } : x))),
            )}
            <div className="pj-row-actions">
              <button
                type="button"
                data-move="up"
                className="adm-btn"
                aria-label={`${i + 1}. ${accusative} yukarı taşı`}
                disabled={i === 0}
                onClick={() => move(i, 'up')}
              >
                Yukarı
              </button>
              <button
                type="button"
                data-move="down"
                className="adm-btn"
                aria-label={`${i + 1}. ${accusative} aşağı taşı`}
                disabled={i === items.length - 1}
                onClick={() => move(i, 'down')}
              >
                Aşağı
              </button>
              <Button variant="destructive" aria-label={`${i + 1}. ${accusative} kaldır`} onClick={() => remove(i)}>
                Kaldır
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <div role="status" className="pj-undo">
        {removed && (
          <>
            <span>Kaldırıldı.</span>
            <button ref={undoRef} type="button" className="adm-btn" onClick={undo}>
              Geri al
            </button>
          </>
        )}
      </div>
      {addSlot ?? (make && <Button onClick={() => onChange([...items, keyed(make())])}>{`${noun} ekle`}</Button>)}
    </div>
  );
}
