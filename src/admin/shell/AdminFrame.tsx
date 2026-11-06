'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminStoreProvider } from '../store/AdminStoreProvider';
import AdminShell from './AdminShell';

const LOGIN_PATH = '/yonetim/giris';
const PREVIEW_PREFIX = '/yonetim/onizleme';

export default function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === LOGIN_PATH || pathname === PREVIEW_PREFIX || pathname.startsWith(`${PREVIEW_PREFIX}/`))
    return <>{children}</>;
  return (
    <AdminStoreProvider>
      <AdminShell pathname={pathname}>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
