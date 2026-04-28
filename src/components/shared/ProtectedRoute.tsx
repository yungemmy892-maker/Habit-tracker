'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
}
