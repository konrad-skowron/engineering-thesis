'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey, fetchSurveyAnswers } from '@/lib/firestore';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Survey, Answer } from '@/lib/types';
import { Container, Box, Paper, Title, Text, Group, Stack, Button, MantineTheme } from '@mantine/core';

export default function ResultsPage(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
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

      if (!user || user.uid !== fetchedSurvey.author) {
        router.replace(`/${params.surveyId}`);
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

  const calculateResults = (questionIndex: number) => {
    const question = survey?.questions[questionIndex];
    if (!question) return null;

    if (question.type === 'multipleChoice' && question.options) {

      const totalResponses = answers.length;
      const optionCounts = question.options.reduce((acc, option) => {
        const count = answers.filter(a => a[questionIndex] === option).length;
        return {
          ...acc,
          [option]: {
            count,
            percentage: totalResponses ? ((count / totalResponses) * 100).toFixed(1) : '0'
          }
        };
      }, {} as { [key: string]: { count: number; percentage: string } });

      return optionCounts;
    }

    if (question.type === 'text') {
      return answers.map(a => a[questionIndex]).filter(Boolean);
    }

    return null;
  };

  return (
    <Container p="md">
      <Title order={1} mb="xl">{survey?.title} - Results</Title>
      <Text mb="xl">Total responses: {answers.length}</Text>

      <Stack gap="xl">
        {survey?.questions.map((question, index) => (
          <Paper key={index} p="md" withBorder>
            <Title order={3} mb="md">{question.question}</Title>

            {question.type === 'multipleChoice' ? (
              <Stack gap="sm">
                {Object.entries(calculateResults(index) || {}).map(([option, data]) => (
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
                {(calculateResults(index) as string[] || []).map((answer, i) => (
                  <Text key={i}>{answer}</Text>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Button 
        onClick={() => router.push(`/${params.surveyId}`)}
        mt="xl"
        variant="outline"
      >
        Back to Survey
      </Button>
    </Container>
  );
}