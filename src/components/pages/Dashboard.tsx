'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Container, Button, Group, Text, Menu, ActionIcon, Title } from '@mantine/core';
import { useState, useEffect } from "react";
import RouteProtector from '@/components/auth/RouteProtector';
import { fetchUserSurveys, fetchAllSurveyParticipants } from '@/lib/firestore';
import { IconDots, IconTrash, IconShare, IconUsers, IconPlus } from '@tabler/icons-react';
import { formatTimestamp } from "@/lib/utils";
import classes from './Dashboard.module.css';
import LiveDot from "../LiveDot";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [gettingSurveys, setGettingSurveys] = useState(true);
  const [openSurveyMenu, setOpenSurveyMenu] = useState<string | null>(null);

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

  const copyLink = (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const link = window.location.href.replace(window.location.pathname, `/${surveyId}`);
    navigator.clipboard.writeText(link);
    alert('Survey link copied to clipboard');
  };

  const deleteSurvey = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this survey?')) {

    }
  };

  return (
    <RouteProtector>
      <Container>
        <div>
          <Title order={2}>Dashboard</Title>
          <Button onClick={createSurvey} leftSection={<IconPlus size={14} />} mt="lg">
            Create survey
          </Button>
        </div>

        <Group visibleFrom="xs" justify="space-between" mt="xl" pl="10px" pr="20px" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}>
          <b>Survey</b>
          <b>Participants</b>
          <b>Deadline</b>
          <b>Status</b>
          <div style={{ visibility: "hidden" }}>
            <ActionIcon variant="subtle" color="gray" radius="xl" c="dimmed">
              <IconDots />
            </ActionIcon>
          </div>
        </Group>
        <Group hiddenFrom="xs" justify="space-between" mt="xl" pl="10px" pr="20px">
          <b>Survey</b>
        </Group>

        {surveys.length === 0 && !gettingSurveys &&
          <Text mt="sm" pl="10px">You have not created any surveys yet.</Text>}

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
                </Text>
              </div>
              <div>
                <ActionIcon variant="transparent" color="gray" hiddenFrom="xs">
                  <IconUsers size={15} />
                  {participants[survey.id]}
                </ActionIcon>
                <Text visibleFrom="xs">{participants[survey.id]}</Text>
              </div>
              <div>-</div>
              <div><LiveDot /></div>
              <div>
                <Menu
                  opened={openSurveyMenu === survey.id}
                  onClose={() => setOpenSurveyMenu(null)}
                  trigger="click"
                  position="bottom-end"
                  withinPortal
                >
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" c="dimmed"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenSurveyMenu(openSurveyMenu === survey.id ? null : survey.id);
                      }}>
                      <IconDots />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconShare size={14} />}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => copyLink(e, survey.id)}>
                      Share
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item leftSection={<IconTrash size={14} />} color="red"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => deleteSurvey(e, survey.id)}>
                      Delete survey
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Group>
          </Link>
        ))}
      </Container>
    </RouteProtector>
  );
}
