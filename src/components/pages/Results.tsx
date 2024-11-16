'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey, fetchSurveyAnswers } from '@/lib/firestore';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Survey, Answer } from '@/lib/types';
import { Container, Box, Paper, Title, Text, Group, Stack, Button, MantineTheme, ScrollArea, Modal } from '@mantine/core';
import { IconFileDownload, IconArrowLeft, IconShare } from '@tabler/icons-react';
import { calculateResults, copyLink, exportToCSV, exportToJSON } from '@/lib/utils';

export default function Results(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const [opened, setOpened] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    const getData = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      if (!fetchedSurvey) {
        router.replace(`/${params.surveyId}/not-found`);
        return;
      }

      const fetchedAnswers = await fetchSurveyAnswers(params.surveyId);
      setSurvey(fetchedSurvey);
      setAnswers(fetchedAnswers);
      setLoading(false);
    };

    getData();
  }, [params.surveyId, user, router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Container p="md">
      <Title order={1}>{survey?.title}</Title>
      <Text mb="lg" c={'dimmed'} size='sm'>by {survey?.authorName}</Text>
      <Text mb="lg">Total responses: {answers.length}</Text>

      <Stack gap="xl">
        {survey?.questions.map((question, index) => (
          <Paper key={index} p="md" withBorder>
            <Title order={3} mb="md">{question.question}</Title>

            {question.type === 'multipleChoice' ? (
              <Stack gap="sm">
                {Object.entries(calculateResults(survey, answers, index) || { 'No responses yet.': { count: 0, percentage: 0 } }).map(([option, data]) => (
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
                  {(calculateResults(survey, answers, index) as string[] || ['No responses yet.']).map((answer, i) => (
                    <Text key={i}>{answer}</Text>
                  ))}
                </ScrollArea>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Group mt="xl" grow>
        <Group>
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


      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Export results"
        overlayProps={{ blur: 4 }}
        centered
      >
        <Group grow>
          <Button
            onClick={() => survey && answers && exportToCSV(survey, answers)}
          >
            Generate .csv
          </Button>
          <Button
            onClick={() => survey && answers && exportToJSON(survey, answers)}
          >
            Generate .json
          </Button>
        </Group>
      </Modal>
    </Container >
  );
}