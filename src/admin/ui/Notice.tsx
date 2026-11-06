import type { ReactNode } from 'react';

type Variant = 'error' | 'warning' | 'info';

const PREFIX: Record<Variant, string | null> = { error: 'Hata:', warning: 'Uyarı:', info: null };

/** The meaning is in the text prefix, not only in the border. */
export default function Notice({ variant, children }: { variant: Variant; children: ReactNode }) {
  const prefix = PREFIX[variant];
  return (
    <div role={variant === 'error' ? 'alert' : undefined} className={`adm-notice adm-notice-${variant}`}>
      {prefix && <strong>{prefix} </strong>}
      {children}
    </div>
  );
}
