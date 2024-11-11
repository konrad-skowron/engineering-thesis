'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Group, Text } from '@mantine/core';
import { useState, useEffect } from "react";
import { Loading } from '@/components/Loading';
import { fetchUserSurveys, fetchSurveyAnswers } from '@/lib/firestore';
import { IconDots } from '@tabler/icons-react';

export default function Account() {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<number[]>([]);

  useEffect(() => {
    const getSurveys = async () => {
      if (!user) {
        return;
      }
      const fetchedSurveys = await fetchUserSurveys(user);
      setSurveys(fetchedSurveys);

      const surveyParticipants: number[] = [];
      for (const survey of surveys) {
        const answers = await fetchSurveyAnswers(survey.id);
        surveyParticipants.push(answers.length);
      }
      setParticipants(surveyParticipants);
    };

    getSurveys();
  }, [user, surveys]);

  useEffect(() => {
    if (!user && !loading && !signingOut) {
      router.replace("/login");
    }
  }, [user, loading, signingOut, router]);

  const printTimestamp = (createdAt : any) => {
    const date = new Date(createdAt.seconds * 1000 + Math.floor(createdAt.nanoseconds / 1e6));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

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
        <div>Survey</div>
        <div>Participants</div>
        <div>Deadline</div>
        <div>Status</div>
        <div></div>
      </Group>

      <div>
        {surveys.map((survey, index) => (
          <div key={index} style={{ border: '1px solid gray', borderRadius: '10px', padding: '10px', marginTop: '10px', backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))' }}>
            <Link href={`/${survey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group justify="space-between" mt={0}>
                <div>
                  <Text fw={500} size="m" lh={1} mr={3}>
                    {survey.title}
                    <br />
                    <Text size="xs" c="dimmed" component="span">
                      {printTimestamp(survey.createdAt)}
                    </Text>
                  </Text></div>
                <div>{participants[index]}</div>
                <div>-</div>
                <div>🔴<b>Live</b></div>
                <div>
                  <Button variant="subtle" color="gray" size="xs"><IconDots /></Button>
                </div>
              </Group>
            </Link>
          </div>
        ))}
      </div>
    </Container>
  );
}
