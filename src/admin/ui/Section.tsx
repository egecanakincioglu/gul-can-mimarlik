import type { ReactNode } from 'react';

export default function Section({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="adm-section" open={defaultOpen}>
      <summary>
        <h2 className="adm-section-title">{title}</h2>
      </summary>
      {description && <p className="caption adm-section-note">{description}</p>}
      <div className="adm-section-body">{children}</div>
    </details>
  );
}
