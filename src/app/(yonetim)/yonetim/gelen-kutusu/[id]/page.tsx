import MessageScreen from '@/admin/screens/inbox/MessageScreen';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MessageScreen id={id} />;
}
