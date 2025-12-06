'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Container, Button, Group, Text, Menu, ActionIcon, Title, useComputedColorScheme, Box } from '@mantine/core';
import { useState, useEffect } from "react";
import RouteProtector from '@/components/RouteProtector';
import { fetchUserSurveys, fetchAllSurveyParticipants, deleteSurvey, setSurveyActive, fetchSurvey, saveSurvey, fetchSurveyResults } from '@/lib/firebase/firestore';
import { IconDots, IconTrash, IconShare, IconUsers, IconPlus, IconChartBar, IconLockOpen, IconLock, IconEdit, IconCopyPlus, IconFileTypeCsv, IconJson } from '@tabler/icons-react';
import { formatTimestamp, exportToCSV, exportToJSON } from "@/lib/utils";
import classes from './Dashboard.module.css';
import LiveDot from "../LiveDot";
import Completed from "../Completed";
import { Loading } from "../Loading";
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [gettingSurveys, setGettingSurveys] = useState(true);
  const [openSurveyMenu, setOpenSurveyMenu] = useState<string | null>(null);
  const colorScheme = useComputedColorScheme();
  const t = useTranslations('dashboard');

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
      alert(t('surveyLimitReached'));
      return;
    }
    router.push('/create');
  };

  const showResults = (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/${surveyId}/results`);
  };

  const editSurvey = (e: React.MouseEvent<HTMLDivElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (participants[surveyId] > 0) return;
    router.push(`/${surveyId}/edit`);
  };

  const duplicateSurvey = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const originalSurvey = await fetchSurvey(surveyId);
    if (!originalSurvey) {
      alert(t('duplicateFailed'));
      return;
    }
    const { title, description, questions } = originalSurvey;
    const newTitle = `${title} ${t('copy')}`;
    const newSurveyId = await saveSurvey(newTitle, description, questions, user);
    if (newSurveyId) {
      const fetchedSurveys = await fetchUserSurveys(user);
      fetchedSurveys.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setSurveys(fetchedSurveys);
      const surveyIds = fetchedSurveys.map(survey => survey.id);
      const participantsMap = await fetchAllSurveyParticipants(surveyIds);
      setParticipants(participantsMap);
    } else {
      alert(t('duplicateFailed'));
    }
  };

  const copyLink = (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const link = window.location.href.replace(window.location.pathname, `/${surveyId}`);
    navigator.clipboard.writeText(link);
    alert(t('linkCopied'));
  };

  const handleExportCSV = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const survey = await fetchSurvey(surveyId);
    const responses = await fetchSurveyResults(surveyId);
    if (survey && responses) {
      exportToCSV(survey, responses);
    }
  };

  const handleExportJSON = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const survey = await fetchSurvey(surveyId);
    const responses = await fetchSurveyResults(surveyId);
    if (survey && responses) {
      exportToJSON(survey, responses);
    }
  };

  const handleDeleteSurvey = async (e: React.MouseEvent<HTMLButtonElement>, surveyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t('deleteConfirm')) && user) {
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
            <Title order={2}>{t('title')}</Title>
            <Button onClick={createSurvey} leftSection={<IconPlus size={16} />} mt="lg" mb="xs">
              {t('createSurvey')}
            </Button>
          </div>

          <Group visibleFrom="xs" justify="space-between" mt="xl" mb='-0.5rem' pl="25px" pr="25px" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto' }}>
            <b>{t('survey')}</b>
            <b>{t('participants')}</b>
            <b>{t('status')}</b>
            <div style={{ visibility: "hidden" }}>
              <ActionIcon variant="subtle" color="gray" radius="xl" c="dimmed">
                <IconDots />
              </ActionIcon>
            </div>
          </Group>
          <Group hiddenFrom="xs" justify="space-between" mt="xl" mb='-0.5rem' pl="25px" pr="25px">
            <b>{t('survey')}</b>
          </Group>

          {surveys.length === 0 &&
            <Text mt="md" pl="25px">{t('noSurveys')}</Text>}

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
                        {t('showResults')}
                      </Menu.Item>
                      <Box onClick={(e: React.MouseEvent<HTMLDivElement>) => editSurvey(e, survey.id)} title={participants[survey.id] > 0 ? t('cannotEditWithParticipants') : ""}>
                        <Menu.Item leftSection={<IconEdit size={14} />} disabled={participants[survey.id] > 0}>
                          {t('edit')}
                        </Menu.Item>
                      </Box>
                      <Menu.Item leftSection={<IconCopyPlus size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => duplicateSurvey(e, survey.id)}>
                        {t('duplicate')}
                      </Menu.Item>
                      {survey.active ? (
                        <Menu.Item leftSection={<IconLock size={14} />}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggleActive(e, survey.id, false)}>
                          {t('close')}
                        </Menu.Item>) : (
                        <Menu.Item leftSection={<IconLockOpen size={14} />}
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleToggleActive(e, survey.id, true)}>
                          {t('reopen')}
                        </Menu.Item>)}
                      <Menu.Item leftSection={<IconShare size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => copyLink(e, survey.id)}>
                        {t('share')}
                      </Menu.Item>
                      <Menu.Item leftSection={<IconFileTypeCsv size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleExportCSV(e, survey.id)}>
                        {t('exportCsv')}
                      </Menu.Item>
                      <Menu.Item leftSection={<IconJson size={14} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleExportJSON(e, survey.id)}>
                        {t('exportJson')}
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item leftSection={<IconTrash size={14} />} color="red"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDeleteSurvey(e, survey.id)}>
                        {t('deleteSurvey')}
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
