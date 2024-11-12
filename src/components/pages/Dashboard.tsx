'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Container, Button, Group, Text } from '@mantine/core';
import { useState, useEffect } from "react";
import RouteProtector from '@/components/auth/RouteProtector';
import { fetchUserSurveys, fetchAllSurveyParticipants } from '@/lib/firestore';
import { IconDots } from '@tabler/icons-react';
import { formatTimestamp } from "@/lib/utils";
import classes from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [gettingSurveys, setGettingSurveys] = useState(true);

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
    <RouteProtector>
      <Container>
        <div>
          <h2>Dashboard</h2>
          <Button onClick={createSurvey}>+ Create survey</Button>
        </div>

        <Group justify="space-between" mt="xl" pl="10px" pr="20px" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}>
          <b>Survey</b>
          <b>Participants</b>
          <b>Deadline</b>
          <b>Status</b>
          <div style={{ visibility: "hidden" }}>
            <Button variant="subtle" color="gray" size="xs">
              <IconDots />
            </Button>
          </div>
        </Group>

        {surveys.length === 0 && !gettingSurveys &&
          <Text mt="xl" pl="10px">You have not created any surveys yet.</Text>}

        {surveys.map((survey, index) => (
          <Link key={index} href={`/${survey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group mt="md" p="20px" className={classes.survey}>
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
              <b>🔴 Live</b>
              <div>
                <Button variant="subtle" color="gray" size="xs">
                  <IconDots />
                </Button>
              </div>
            </Group>
          </Link>
        ))}
      </Container>
    </RouteProtector>
  );
}
