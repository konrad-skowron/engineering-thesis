'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Group, Text } from '@mantine/core';
import { useState, useEffect } from "react";
import { Loading } from '@/components/Loading';
import { fetchUserSurveys, fetchAllSurveyParticipants } from '@/lib/firestore';
import { IconDots } from '@tabler/icons-react';
import { formatTimestamp } from "@/lib/utils";

export default function Account() {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [gettingSurveys, setGettingSurveys ] = useState(true);

  useEffect(() => {
    const getSurveys = async () => {
      if (!user) {
        return;
      }
      const fetchedSurveys = await fetchUserSurveys(user);
      fetchedSurveys.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setSurveys(fetchedSurveys);

      const surveyIds = fetchedSurveys.map(survey => survey.id);
      const participantsMap = await fetchAllSurveyParticipants(surveyIds);
      setParticipants(participantsMap);

      setGettingSurveys(false);
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

  const createSurvey = () => {
    if (gettingSurveys) {
      return;
    }
    if (surveys.length >= 10) {
      alert('You have reached the limit of 10 surveys');
      return;
    }
    router.push('/create');
  };

  return (
    <Container>
      <div>
        <h2>Dashboard</h2>
        <Button onClick={createSurvey}>+ Create survey</Button>
      </div>

      <Group justify="space-between" mt="xl" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', paddingLeft: "20px", paddingRight: "20px" }}>
        <div>Survey</div>
        <div>Participants</div>
        <div>Deadline</div>
        <div>Status</div>
        <div style={{ visibility: "hidden" }}>
          <Button variant="subtle" color="gray" size="xs">
            <IconDots />
          </Button>
        </div>
      </Group>

      {surveys.map((survey, index) => (
        <Link key={index} href={`/${survey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Group justify="space-between" mt="lg" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', border: '1px solid gray', borderRadius: '10px', padding: '20px', backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))' }}>
            <div>
              <Text fw={500} size="m" lh={1} mr={3}>
                {survey.title}
                <br />
                <Text size="xs" c="dimmed" component="span">
                  {formatTimestamp(survey.createdAt)}
                </Text>
              </Text></div>
            <div>{participants[survey.id]}</div>
            <div>-</div>
            <div>🔴<b>Live</b></div>
            <div>
              <Button variant="subtle" color="gray" size="xs">
                <IconDots />
              </Button>
            </div>
          </Group>
        </Link>
      ))}
    </Container>
  );
}
