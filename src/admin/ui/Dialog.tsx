'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

export default function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      if (d.open) return;
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else {
      if (d.open) {
        if (typeof d.close === 'function') d.close();
        else d.removeAttribute('open');
      }
      opener.current?.focus();
      opener.current = null;
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="adm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      {open && (
        <div className="adm-dialog-body">
          <h2 id={titleId} className="adm-dialog-title">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
