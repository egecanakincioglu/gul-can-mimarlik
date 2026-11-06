import type { Metadata } from 'next';
import '@/admin/admin.css';
import '@/admin/preview/preview.css';
import AdminFrame from '@/admin/shell/AdminFrame';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>;
}
