'use client';

import { useParams } from 'next/navigation';
import PreviewFrame from '@/admin/preview/PreviewFrame';
import { renderPreviewPage } from '@/admin/preview/render-page';

export default function OnizlemePage() {
  const { yol } = useParams<{ yol?: string[] }>();
  return <PreviewFrame segments={yol ?? []} render={renderPreviewPage} />;
}
