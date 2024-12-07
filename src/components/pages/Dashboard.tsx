'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Group, Text, Menu, ActionIcon, Title, useMantineColorScheme } from '@mantine/core';
import { useState, useEffect } from "react";
import RouteProtector from '@/components/RouteProtector';
import { fetchUserSurveys, fetchAllSurveyParticipants, deleteSurvey, setSurveyActive } from '@/lib/firestore';
import { IconDots, IconTrash, IconShare, IconUsers, IconPlus, IconChartBar, IconLockOpen, IconLock } from '@tabler/icons-react';
import { formatTimestamp } from "@/lib/utils";
import classes from './Dashboard.module.css';
import LiveDot from "../LiveDot";
import Completed from "../Completed";
import { Loading } from "../Loading";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [gettingSurveys, setGettingSurveys] = useState(true);
  const [openSurveyMenu, setOpenSurveyMenu] = useState<string | null>(null);
  const { colorScheme } = useMantineColorScheme();

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

  const showResults = (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/${surveyId}/results`);
  };

  const copyLink = (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const link = window.location.href.replace(window.location.pathname, `/${surveyId}`);
    navigator.clipboard.writeText(link);
    alert('Survey link copied to clipboard');
  };

  const handleDeleteSurvey = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this survey?') && user) {
      await deleteSurvey(surveyId, user);
      setSurveys(surveys.filter(survey => survey.id !== surveyId));
    }
  };

  const handleToggleActive = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string, isActive: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setSurveyActive(surveyId, isActive);
    setSurveys(surveys.map(survey => survey.id === surveyId ? { ...survey, active: isActive } : survey));
  };

  return (
    <RouteProtector>
      {!gettingSurveys ? (
        <Container pt="xl" pb="xl">
          <div>
            <Title order={2}>Dashboard</Title>
            <Button onClick={createSurvey} leftSection={<IconPlus size={16} />} mt="lg" mb="xs">
              Create survey
            </Button>
          </div>

          <Group visibleFrom="xs" justify="space-between" mt="xl" mb='-0.5rem' pl="25px" pr="25px" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto' }}>
            <b>Survey</b>
            <b>Participants</b>
            <b>Status</b>
            <div style={{ visibility: "hidden" }}>
              <ActionIcon variant="subtle" color="gray" radius="xl" c="dimmed">
                <IconDots />
              </ActionIcon>
            </div>
          </Group>
          <Group hiddenFrom="xs" justify="space-between" mt="xl" mb='-0.5rem' pl="25px" pr="25px">
            <b>Survey</b>
          </Group>

          {surveys.length === 0 &&
            <Text mt="md" pl="25px">You have not created any surveys yet.</Text>}

          {surveys.map((survey, index) => (
            <Link key={index} href={`/${survey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group mt="md" p="25px" className={classes.survey}>
                <div>
                  <Text fw={500} lh={1} mr={3}>
                    {survey.title}
                    <br />
                    <Text size="sm" c="dimmed" component="span">
                      {formatTimestamp(survey.createdAt)}
                    </Text>
                  </Text>
                </div>
                <div>
                  <Group gap={1} wrap="nowrap">
                    <ActionIcon variant="transparent" hiddenFrom="xs" color={colorScheme === 'dark' ? 'gray' : 'black'}>
                      <IconUsers size={15} />
                    </ActionIcon>
                    <Text>{participants[survey.id]}</Text>
                  </Group>
                </div>
                <div>
                  {survey.active ? <LiveDot /> : <Completed />}
                </div>
                <div>
                  <Menu
                    opened={openSurveyMenu === survey.id}
                    onClose={() => setOpenSurveyMenu(null)}
                    trigger="click"
                    position="bottom-end"
                    withinPortal
                  >
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" c="dimmed" radius="xl"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenSurveyMenu(openSurveyMenu === survey.id ? null : survey.id);
                        }}>
                        <IconDots />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconChartBar size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => showResults(e, survey.id)}>
                        Show results
                      </Menu.Item>
                      {survey.active ? (
                        <Menu.Item leftSection={<IconLock size={14} />}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggleActive(e, survey.id, false)}>
                          Close survey
                        </Menu.Item>) : (
                        <Menu.Item leftSection={<IconLockOpen size={14} />}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggleActive(e, survey.id, true)}>
                          Reopen survey
                        </Menu.Item>)}
                      <Menu.Item leftSection={<IconShare size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => copyLink(e, survey.id)}>
                        Share
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item leftSection={<IconTrash size={14} />} color="red"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDeleteSurvey(e, survey.id)}>
                        Delete survey
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
              </Group>
            </Link>
          ))}
        </Container>
      ) : (
        <Loading />
      )}
    </RouteProtector>
  );
}
