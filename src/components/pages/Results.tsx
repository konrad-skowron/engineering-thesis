'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey, fetchSurveyResponses } from '@/lib/firestore';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Survey, Response } from '@/lib/types';
import { Container, Box, Paper, Title, Text, Group, Stack, Button, Pagination, ScrollArea, Modal, ActionIcon, Tabs, useMantineColorScheme, useMantineTheme, Center, Divider } from '@mantine/core';
import { IconFileDownload, IconArrowLeft, IconShare } from '@tabler/icons-react';
import { copyLink, exportToCSV, exportToJSON } from '@/lib/utils';
import { BarChart, DonutChart } from '@mantine/charts';

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
  const [activePage, setPage] = useState(1);

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
          <Text c={'dimmed'} size='sm'>by {survey?.authorName}</Text>
        </Container>
      </Box>

      <Tabs defaultValue="summary" variant='outline' pb='xl'>
        <Tabs.List bg={colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]}>
          <Container w='100%'>
            <Group justify='end' gap={0}>
              <Tabs.Tab value="summary"
                bg={summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[7] : 'white') : (colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0])}
                onClick={() => setSummaryOpen(true)}
                style={{ borderBottomColor: !summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]) : 'transparent' }}>
                Summary
              </Tabs.Tab>
              <Tabs.Tab value="individual"
                bg={!summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[7] : 'white') : (colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0])}
                onClick={() => setSummaryOpen(false)}
                style={{ borderBottomColor: summaryOpen ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]) : 'transparent' }}>
                Individual
              </Tabs.Tab>
            </Group>
          </Container>
        </Tabs.List>

        <Tabs.Panel value="summary">
          <Container>
            <Stack gap="lg" mt={'lg'}>
              {survey?.questions.map((question, index) => {
                const questionResponses = responses.map((response) => response[index]).filter(response => response !== undefined);
                let result;

                switch (question.type) {
                  case 'text':
                    result = (
                      <Stack gap='xs'>
                        {questionResponses.map((response, idx) => (
                          <Text key={idx}>{response}</Text>
                        ))}
                      </Stack>
                    );
                    break;

                  case 'singleChoice':
                    const singleChoiceCounts = question.options?.reduce((acc, option) => {
                      acc[option] = questionResponses.filter((resp) => resp === option).length;
                      return acc;
                    }, {} as Record<string, number>);
                    result = (
                      <Stack gap='xs'>
                        {Object.entries(singleChoiceCounts || {}).map(([option, count]) => (
                          <Text key={option}>
                            {option}: {count}
                          </Text>
                        ))}
                      </Stack>
                    );
                    break;

                  case 'multipleChoice':
                    const multipleChoiceCounts = question.options?.reduce((acc, option) => {
                      acc[option] = questionResponses.reduce(
                        (count, response) => count + (response?.includes(option) ? 1 : 0),
                        0
                      );
                      return acc;
                    }, {} as Record<string, number>);
                    result = (
                      <Stack gap='xs'>
                        {Object.entries(multipleChoiceCounts || {}).map(([option, count]) => (
                          <Text key={option}>
                            {option}: {count}
                          </Text>
                        ))}
                      </Stack>
                    );
                    break;

                  case 'dropdownList':
                    const dropdownCounts = question.options?.reduce((acc, option) => {
                      acc[option] = questionResponses.filter((resp) => resp === option).length;
                      return acc;
                    }, {} as Record<string, number>);
                    result = (
                      <Stack gap='xs'>
                        {Object.entries(dropdownCounts || {}).map(([option, count]) => (
                          <Text key={option}>
                            {option}: {count}
                          </Text>
                        ))}
                      </Stack>
                    );
                    break;

                  case 'discreteScale':
                  case 'continousScale':
                    const average = (
                      questionResponses.reduce((sum, value) => sum + (value || 0), 0) /
                      questionResponses.length
                    ).toFixed(2);
                    result = (
                      <Text>
                        Average Score: {average}
                      </Text>
                    );
                    break;

                  default:
                    result = <Text c="red">No data available for this question type.</Text>;
                }

                if (questionResponses.length === 0) {
                  result = <Text c="dimmed">No responses yet.</Text>;
                }

                return (
                  <Paper key={index} p="md" withBorder>
                    <Title order={4}>{question.question}</Title>
                    <Text c="dimmed" size="sm" mb='md'>Total responses: {questionResponses.length}</Text>
                    {result}
                  </Paper>
                );
              })}
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
              <Group grow mt='md'>
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
            <Stack gap="lg" mt={'lg'}>
              {survey?.questions.map((question, index) => {
                const questionResponses = responses[activePage - 1];
                let result;

                switch (question.type) {
                  case 'text':
                  case 'singleChoice':
                  case 'dropdownList':
                    result = (
                      <Stack gap='xs'>
                        <Text>{questionResponses[index]}</Text>
                      </Stack>
                    );
                    break;

                  case 'multipleChoice':
                    result = (
                      <Stack>
                        {questionResponses[index] !== undefined &&
                          <Text>{questionResponses[index].join(', ')}</Text>}
                      </Stack>
                    );
                    break;

                  case 'discreteScale':
                  case 'continousScale':
                    result = (
                      <Text>
                        {questionResponses[index]}
                      </Text>
                    );
                    break;

                  default:
                    result = <Text c="red">No data available for this question type.</Text>;
                }

                if (questionResponses[index] === undefined) {
                  result = <Text c="dimmed">No response.</Text>;
                }

                return (
                  <Paper key={index} p="md" withBorder>
                    <Title order={4}>{question.question}</Title>
                    {result}
                  </Paper>
                );
              })}
            </Stack>
            <Center mt="lg">
              <Pagination
                total={responses.length}
                value={activePage}
                onChange={setPage}
              />
            </Center>
          </Container>
        </Tabs.Panel>

      </Tabs>
    </Box >
  );
}