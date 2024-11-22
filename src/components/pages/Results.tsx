'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey, fetchSurveyResponses } from '@/lib/firestore';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Survey, Response } from '@/lib/types';
import { Container, Box, Paper, Title, Text, Group, Stack, Button, MantineTheme, ScrollArea, Modal, ActionIcon, Tabs, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconFileDownload, IconArrowLeft, IconShare } from '@tabler/icons-react';
import { calculateResults, copyLink, exportToCSV, exportToJSON } from '@/lib/utils';

export default function Results(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const [opened, setOpened] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const getData = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      if (!fetchedSurvey) {
        router.replace(`/${params.surveyId}/not-found`);
        return;
      }

      const fetchedResponses = await fetchSurveyResponses(params.surveyId);
      setSurvey(fetchedSurvey);
      setResponses(fetchedResponses);
      setLoading(false);
    };

    getData();
  }, [params.surveyId, user, router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <Box bg={colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]} pb="lg" pt='xl'>
        <Container>
          <Title order={1}>{survey?.title}</Title>
          <Text mb="lg" c={'dimmed'} size='sm'>by {survey?.authorName}</Text>
          <Text mb="lg">Total responses: {responses.length}</Text>
        </Container>
      </Box>

      <Tabs defaultValue="summary" variant='outline' pb='xl'>
        <Tabs.List justify='Center' bg={colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]}>
          <Tabs.Tab value="summary" 
            bg={summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[7] : 'white') : (colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0])}
            onClick={() => setSummaryOpen(true)}
            style={{ borderBottomColor: !summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]) : 'transparent'}}>
            Summary
          </Tabs.Tab>
          <Tabs.Tab value="individual"
            bg={!summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[7] : 'white') : (colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0])}
            onClick={() => setSummaryOpen(false)}
            style={{ borderBottomColor: summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]) : 'transparent'}}>
            Individual
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary">
          <Container>

            <Stack gap="lg" mt={'lg'}>
              {survey?.questions.map((question, index) => (
                <Paper key={index} p="md" withBorder>
                  <Title order={3} mb="md">{question.question}</Title>
                  {question.type === 'multipleChoice' ? (
                    <Stack gap="sm">
                      {Object.entries(calculateResults(survey, responses, index) || { 'No responses yet.': { count: 0, percentage: 0 } }).map(([option, data]) => (
                        <Box key={option}>
                          <Group pos="absolute">
                            <Text>{option}</Text>
                            <Text weight={500}>
                              {data.count} ({data.percentage}%)
                            </Text>
                          </Group>
                          <Box
                            sx={(theme: MantineTheme) => ({
                              backgroundColor: theme.colors.blue[4],
                              height: 8,
                              borderRadius: theme.radius.sm,
                              width: `${data.percentage}%`,
                              transition: 'width 0.3s ease'
                            })}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Stack gap="xs">
                      <ScrollArea h={150} type="auto">
                        {(calculateResults(survey, responses, index) as string[] || ['No responses yet.']).map((response, i) => (
                          <Text key={i}>{response}</Text>
                        ))}
                      </ScrollArea>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>

            <Group style={{ display: 'grid', gridTemplateColumns: '1fr auto' }} mt='lg' visibleFrom='xs'>
              <Group wrap="nowrap">
                <Button
                  onClick={() => router.push(`/${params.surveyId}`)}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back to survey
                </Button>
                <Button
                  leftSection={<IconFileDownload size={16} />}
                  variant='default'
                  onClick={() => setOpened(!opened)}
                >
                  Export results
                </Button>
              </Group>
              <Group justify='end'>
                <Button
                  onClick={copyLink}
                  leftSection={<IconShare size={16} />}
                  variant='default'
                >
                    Share
                </Button>
              </Group>
            </Group>
            <Box mt='lg' hiddenFrom='xs'>
              <Group grow>
                <Button
                  onClick={() => router.push(`/${params.surveyId}`)}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back to survey
                </Button>
              </Group>
              <Group grow mt='sm'>
                <Button
                  leftSection={<IconFileDownload size={16} />}
                  variant='default'
                  onClick={() => setOpened(!opened)}
                >
                  Export results
                </Button>
                <Button
                  onClick={copyLink}
                  leftSection={<IconShare size={16} />}
                  variant='default'
                >
                    Share
                </Button>
              </Group>
            </Box>

            <Modal
              opened={opened}
              onClose={() => setOpened(false)}
              title="Export results"
              overlayProps={{ blur: 4 }}
              centered
            >
              <Group grow>
                <Button
                  onClick={() => survey && responses && exportToCSV(survey, responses)}
                >
                  Generate .csv
                </Button>
                <Button
                  onClick={() => survey && responses && exportToJSON(survey, responses)}
                >
                  Generate .json
                </Button>
              </Group>
            </Modal>
          </Container>
        </Tabs.Panel>

        <Tabs.Panel value="individual">
          <Container>
            Individual response
          </Container>
        </Tabs.Panel>
      </Tabs>
    </Box >
  );
}