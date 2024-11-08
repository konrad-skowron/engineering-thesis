'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Center, Group } from '@mantine/core';
import { useState,useEffect } from "react";
import { Loading } from '@/components/Loading';
import { fetchUserSurveys } from '@/lib/firestore';

export default function Account() {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    const getSurveys = async () => {
      if (!user) {
        return;
      }
      const fetchedSurveys = await fetchUserSurveys(user);
      setSurveys(fetchedSurveys);
    };

    getSurveys();
  }, [user]);

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

      <div>
        {surveys.map((survey, index) => (
          <div key={index} style={{ border: '1px solid gray', borderRadius: '10px', padding: '10px', marginTop: '10px', backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))' }}>
            <pre>{JSON.stringify(survey, null, 2)}</pre>
          </div>
        ))}
      </div>
    </Container>
  );
}
