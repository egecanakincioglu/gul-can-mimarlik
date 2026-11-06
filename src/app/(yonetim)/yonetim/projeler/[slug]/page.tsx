import ProjectEditScreen from '@/admin/screens/projects/ProjectEditScreen';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectEditScreen slug={slug} />;
}
