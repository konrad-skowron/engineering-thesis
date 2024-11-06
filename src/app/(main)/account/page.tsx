'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button } from '@mantine/core';
import { useEffect } from "react";

export default function Account() {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading && !signingOut) {
      router.replace("/login");
    }
  }, [user, loading, signingOut, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Link href="/create">
        <Button>+ Create survey</Button>
      </Link> 
    </Container>
  );
}
