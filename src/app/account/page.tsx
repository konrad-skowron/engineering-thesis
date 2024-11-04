'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { useAuth } from '@/components/AuthProvider';
import { signOut } from "@/lib/auth";

export default function Account() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <>
      { user ? (
        <>
          <header>
            <div>Hello {user?.displayName}</div>
            
            <Link href="#" onClick={signOut}>
              <button>Sign Out</button>
            </Link>
          </header>

          <Link href="/create">
            <button>+ Create survey</button>
          </Link> 
        </>
      ) : <div>Loading...</div> }
    </>
  );
}
