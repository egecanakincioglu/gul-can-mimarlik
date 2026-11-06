'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

type Props<T> = {
  items: readonly T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onChange: (next: T[]) => void;
  renderItem?: (item: T, index: number) => ReactNode;
};

export default function SortableList<T>({ items, getId, getLabel, onChange, renderItem }: Props<T>) {
  const [announcement, setAnnouncement] = useState('');
  const focusAfter = useRef<{ id: string; dir: 'up' | 'down' } | null>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    const row = Array.from(list.current?.children ?? []).find((el) => el.getAttribute('data-id') === target.id);
    const preferred = row?.querySelector<HTMLButtonElement>(`[data-move="${target.dir}"]:not(:disabled)`);
    (preferred ?? row?.querySelector<HTMLButtonElement>('[data-move]:not(:disabled)'))?.focus();
  }, [items]);

  const move = (from: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    focusAfter.current = { id: getId(item), dir };
    setAnnouncement(`Öğe ${getLabel(item)}, ${items.length} içinden ${to + 1}. sıraya taşındı`);
    onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    move(index, e.key === 'ArrowUp' ? 'up' : 'down');
  };

  return (
    <div>
      <ul ref={list} className="adm-sortable">
        {items.map((item, i) => {
          const label = getLabel(item);
          return (
            <li key={getId(item)} data-id={getId(item)} className="adm-sortable-row" onKeyDown={(e) => onKeyDown(e, i)}>
              <span className="adm-sortable-main">{renderItem ? renderItem(item, i) : label}</span>
              <button
                type="button"
                data-move="up"
                className="adm-btn"
                aria-label={`Yukarı taşı: ${label}`}
                disabled={i === 0}
                onClick={() => move(i, 'up')}
              >
                Yukarı
              </button>
              <button
                type="button"
                data-move="down"
                className="adm-btn"
                aria-label={`Aşağı taşı: ${label}`}
                disabled={i === items.length - 1}
                onClick={() => move(i, 'down')}
              >
                Aşağı
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
