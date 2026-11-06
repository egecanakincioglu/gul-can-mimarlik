'use client';

import { useRouter } from 'next/navigation';
import ProjectEditScreen from '@/admin/screens/projects/ProjectEditScreen';

export default function NewProject() {
  const router = useRouter();
  return <ProjectEditScreen isNew onSaved={(slug) => router.push(`/yonetim/projeler/${slug}`)} />;
}
