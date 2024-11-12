'use client'
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteProtector({ children }: { children: React.ReactNode }) {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading && !signingOut) {
      router.replace("/login");
    }
  }, [user, loading, signingOut, router]);

  if (!user) {
    return <Loading />;
  }

  return (
    <>
      {children}
    </>
  );
}