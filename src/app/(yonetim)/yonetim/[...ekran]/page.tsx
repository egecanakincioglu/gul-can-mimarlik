import Link from 'next/link';
import { notFound } from 'next/navigation';
import { labelFor } from '@/admin/shell/nav';
import EmptyState from '@/admin/ui/EmptyState';

export default async function EkranPage({ params }: { params: Promise<{ ekran: string[] }> }) {
  const { ekran } = await params;
  const label = labelFor(`/yonetim/${ekran.join('/')}`);
  if (!label) notFound();
  return (
    <>
      <h1 className="adm-title">{label}</h1>
      <EmptyState message="Bu ekran yapım aşamasında." />
      <Link href="/yonetim" className="tlink">
        Genel bakış
      </Link>
    </>
  );
}
