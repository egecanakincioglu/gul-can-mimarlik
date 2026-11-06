'use client';

import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';

export default function LoginScreen() {
  const router = useRouter();
  return <LoginForm onLogin={() => router.push('/yonetim')} />;
}
