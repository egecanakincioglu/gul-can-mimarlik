import Link from 'next/link';
import type { ReactNode } from 'react';

/** Both branches are rendered and CSS shows one, so the notice works without JavaScript. */
export default function WideOnly({
  children,
  backHref,
  backLabel,
}: {
  children: ReactNode;
  backHref: string;
  backLabel: string;
}) {
  return (
    <>
      <div className="adm-wide-only">{children}</div>
      <div className="adm-narrow-notice">
        <p>Bu işlem için daha geniş ekran gerekir (768 px ve üzeri).</p>
        <Link href={backHref}>{backLabel}</Link>
      </div>
    </>
  );
}
