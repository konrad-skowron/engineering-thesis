'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Center, Group } from '@mantine/core';
import { useEffect } from "react";
import { Loading } from '@/components/Loading';

export default function Account() {
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
    <Container>
      <div>
        <h2>Dashboard</h2>
        <Link href="/create">
          <Button>+ Create survey</Button>
        </Link> 
      </div>

      <Group justify="space-between" mt="xl">
				<div>Surveys</div>
				<div>Participants</div>
				<div>Deadline</div>
				<div>Status</div>
				<div></div>
			</Group>

      <div></div>
    </Container>
  );
}
