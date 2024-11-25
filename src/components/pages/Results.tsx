'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey, fetchSurveyResponses } from '@/lib/firestore';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Survey, Response } from '@/lib/types';
import { Container, Box, Paper, Title, Text, Group, RangeSlider, Slider, Select, Stack, Button, Pagination, Input, Textarea, Modal, RadioGroup, Radio, Tabs, useMantineColorScheme, useMantineTheme, Center, Checkbox } from '@mantine/core';
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
                    if (question.rangeEnabled) {
                      const firstElementAverage = (questionResponses.reduce((sum, [first]) => sum + first, 0) / questionResponses.length).toFixed(2);
                      const secondElementAverage = (questionResponses.reduce((sum, [, second]) => sum + second, 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average range: {firstElementAverage} - {secondElementAverage}
                        </Text>
                      );
                      
                    } else {
                      const discreteAverage = (questionResponses.reduce((sum, value) => sum + (value || 0), 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average response: {discreteAverage}
                        </Text>
                      );
                    }
                    break;

                  case 'continousScale':
                    if (question.rangeEnabled) {
                      const firstElementAverage = (questionResponses.reduce((sum, [first]) => sum + first, 0) / questionResponses.length).toFixed(2);
                      const secondElementAverage = (questionResponses.reduce((sum, [, second]) => sum + second, 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average range: {firstElementAverage} - {secondElementAverage}
                        </Text>
                      );
                    } else {
                      const continousAverage = (questionResponses.reduce((sum, value) => sum + (value || 0), 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average response: {continousAverage} / 100
                        </Text>
                      );
                    }
                    break;

                  default:
                    result = <Text c="red">No data available for this question type.</Text>;
                }

                if (questionResponses.length === 0) {
                  result = <Text c="dimmed">No responses yet.</Text>;
                }

                return (
                  <Paper key={index} p="md" withBorder>
                    <Title order={4}>{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Title>
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

                if (questionResponses[index] === undefined) {
                  result = <Text c="dimmed">No response.</Text>;
                } else {

                  switch (question.type) {
                    case 'text':
                      result = (
                        <Textarea
                          value={questionResponses[index].toString() || ''}
                          disabled
                        />
                      );
                      break;

                    case 'singleChoice':
                      result = (
                        <RadioGroup
                          value={questionResponses[index].toString() || null}
                        >
                          <Stack>
                            {question.options?.map((option, optIndex) => (
                              <Radio
                                key={optIndex}
                                value={option}
                                label={option}
                                disabled
                              />
                            ))}
                          </Stack>
                        </RadioGroup>
                      );
                      break;

                    case 'multipleChoice':
                      result = (
                        <Checkbox.Group
                          value={questionResponses[index] || []}
                        >
                          <Stack>
                            {question.options?.map((option, optIndex) => (
                              <Checkbox
                                key={optIndex}
                                value={option}
                                label={option}
                                disabled
                              />
                            ))}
                          </Stack>
                        </Checkbox.Group>
                      );
                      break;

                    case 'dropdownList':
                      result = (
                        <Select
                          w="fit-content"
                          data={question.options || []}
                          value={questionResponses[index].toString() || null}
                          disabled
                        />
                      );
                      break;

                    case 'discreteScale':
                      if (question.rangeEnabled) {
                        const getScale = (v: number) => v / 10;

                        result = (
                          <Stack>
                            <RangeSlider
                              labelAlwaysOn
                              color={colorScheme === 'dark' ? 'rgb(105, 105, 105)' : 'rgb(206, 212, 218)'}
                              scale={getScale}
                              min={0}
                              max={question.options ? question.options?.length * 10 - 10 : 50}
                              step={10}
                              marks={question.options?.map((opt, i) => ({ value: i * 10, label: opt.split(' ').join('\n') }))}
                              value={questionResponses[index].map((v: number) => v * 10) || [0, 50]}
                              p="8%"
                              mb="xl"
                              styles={{
                                markLabel: {
                                  whiteSpace: 'pre-wrap',
                                  display: 'block',
                                  textAlign: 'center'
                                }
                              }}
                            />
                          </Stack>
                        );
                      } else {
                        result = (
                          <Slider
                            labelAlwaysOn
                            label={(value) => question.options?.[value] || value}
                            marks={question.options?.map((opt, i) => ({ value: i, label: opt.split(' ').join('\n') }))}
                            min={0}
                            max={(question.options?.length || 1) - 1}
                            value={questionResponses[index] || 0}
                            color="default"
                            p="8%"
                            mb="xl"
                            styles={{
                              markLabel: {
                                whiteSpace: 'pre-wrap',
                                display: 'block',
                                textAlign: 'center'
                              }
                            }}
                          />
                        );
                      }
                      break;

                    case 'continousScale':
                      if (question.rangeEnabled) {
                        result = (
                          <Stack>
                            <Group
                              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                              p="5%">
                              <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                              <RangeSlider
                                labelAlwaysOn
                                value={questionResponses[index] || [0, 50]}
                                color={colorScheme === 'dark' ? 'rgb(105, 105, 105)' : 'rgb(206, 212, 218)'}
                              />
                              <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                            </Group>
                          </Stack>
                        );
                      } else {
                        result = (
                          <Stack>
                            <Group
                              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                              p="5%">
                              <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                              <Slider
                                value={questionResponses[index]}
                                color="default"
                                labelAlwaysOn
                              />
                              <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                            </Group>
                          </Stack>
                        );
                      }
                      break;

                    default:
                      result = <Text c="red">No data available for this question type.</Text>;
                  }
                }

                return (
                  <Paper key={index} p="md" withBorder>
                    <Title order={4} mb='md'>{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Title>
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