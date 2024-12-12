'use client'
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSurvey } from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loading } from '@/components/Loading';
import { Survey, Response } from '@/lib/types';
import { Popover, Container, Box, Paper, Title, Text, Group, RangeSlider, Slider, Select, Stack, Button, SimpleGrid, Pagination, Input, Textarea, Modal, RadioGroup, Radio, Tabs, useMantineColorScheme, useMantineTheme, Center, Checkbox, ActionIcon, Flex, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFileDownload, IconArrowLeft, IconArrowBarUp, IconArrowBarDown } from '@tabler/icons-react';
import { exportToCSV, exportToJSON, geminiSummary, GEMINI_ERROR_MSG } from '@/lib/utils';
import { BarChart, LineChart } from '@mantine/charts';
// import { TableOfContents } from '../TableOfContents';

export default function Results(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [activePage, setPage] = useState(1);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const colors = ['indigo', 'yellow', 'teal', 'gray', 'red', 'pink', 'grape', 'violet', 'blue', 'cyan', 'green', 'lime', 'orange'];
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      if (!fetchedSurvey) {
        router.replace(`/${params.surveyId}/not-found`);
        return;
      }
      setSurvey(fetchedSurvey);

      const unsubscribe = onSnapshot(doc(db, 'results', params.surveyId), (doc) => {
        if (doc.exists()) {
          setResponses(doc.data().responses || []);
        }
      });

      setLoading(false);
    };

    getData();
  }, [params.surveyId, router]);

  useEffect(() => {
    if (survey?.questions) {
      const initialExpandedState = Object.fromEntries(survey.questions.map((_, index) => [index, true]));
      setExpandedQuestions(initialExpandedState);
    }
  }, [survey?.questions]);

  const toggleExpand = (index: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSummary = async () => {
    if (!survey || aiSummary) return;
    const fetchedSummary = await geminiSummary(survey, responses);
    setAiSummary(fetchedSummary || null);
  };

  // const links = survey?.questions.map((question, index) => ({
  //   label: question.question,
  //   link: `#question-${index}`,
  //   order: 1,
  // })) || [];

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
          {/* <TableOfContents links={links} /> */}
          <Container>
            <Stack gap="lg" mt={'lg'}>
              {survey?.questions.map((question, index) => {
                const questionResponses = responses.map((response) => response[index]).filter(response => response !== undefined && response !== null && response !== '');
                let result;

                switch (question.type) {
                  case 'text':
                    result = (
                      <Stack gap='xs'>
                        {questionResponses.map((response, idx) => (
                          <Paper key={idx} bg={colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]} radius='sm' p='6px'>
                            <Text size='sm'>{response}</Text>
                          </Paper>
                        ))}
                      </Stack>
                    );
                    break;

                  case 'number':
                    const numberCounts = questionResponses.reduce((acc, option) => {
                      acc[option] = questionResponses.filter((resp) => resp === option).length;
                      return acc;
                    }, {} as Record<string, number>);
                    const average = (questionResponses.reduce((acc, response) => acc + response, 0) / questionResponses.length).toFixed(2);
                    result = (
                      <Group align='flex-start' grow wrap="nowrap">
                        <Text>
                          Average number: {average}
                        </Text>
                        <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                          <BarChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                            data={Object.entries(numberCounts || {}).map(([option, count]) => ({ name: option, Count: count }))} />
                        </Box>
                      </Group>
                    );
                    break;

                  case 'singleChoice':
                    const singleChoiceCounts = question.options?.reduce((acc, option) => {
                      acc[option] = questionResponses.filter((resp) => resp === option).length;
                      return acc;
                    }, {} as Record<string, number>);
                    result = (
                      <Group align='flex-start' grow wrap="nowrap">
                        <Stack gap='xs'>
                          <SimpleGrid cols={2}>
                            {Object.entries(singleChoiceCounts || {}).map(([option, count]) => (
                              <Text key={option}>
                                {option}: {count} ({questionResponses.length > 0 ? ((count / questionResponses.length) * 100).toFixed(0) : 0}%)
                              </Text>
                            ))}
                          </SimpleGrid>
                        </Stack>
                        <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                          <BarChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                            data={Object.entries(singleChoiceCounts || {}).map(([option, count]) => ({ name: option, Count: count }))} />
                        </Box>
                      </Group>
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
                    const totalSelections = Object.values(multipleChoiceCounts || {}).reduce((sum, count) => sum + count, 0);
                    result = (
                      <Group align='flex-start' grow wrap="nowrap">
                        <Stack gap='xs'>
                          <SimpleGrid cols={2}>
                            {Object.entries(multipleChoiceCounts || {}).map(([option, count]) => (
                              <Text key={option}>
                                {option}: {count} ({totalSelections > 0 ? ((count / totalSelections) * 100).toFixed(0) : 0}%)
                              </Text>
                            ))}
                          </SimpleGrid>
                        </Stack>
                        <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                          <BarChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                            data={Object.entries(multipleChoiceCounts || {}).map(([option, count]) => ({ name: option, Count: count }))} />
                        </Box>
                      </Group>
                    );
                    break;

                  case 'dropdownList':
                    const dropdownCounts = question.options?.reduce((acc, option) => {
                      acc[option] = questionResponses.filter((resp) => resp === option).length;
                      return acc;
                    }, {} as Record<string, number>);
                    result = (
                      <Group align='flex-start' grow wrap="nowrap">
                        <Stack gap='xs'>
                          <SimpleGrid cols={2}>
                            {Object.entries(dropdownCounts || {}).map(([option, count]) => (
                              <Text key={option}>
                                {option}: {count} ({questionResponses.length > 0 ? ((count / questionResponses.length) * 100).toFixed(0) : 0}%)
                              </Text>
                            ))}
                          </SimpleGrid>
                        </Stack>
                        <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                          <BarChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                            data={Object.entries(dropdownCounts || {}).map(([option, count]) => ({ name: option, Count: count }))} />
                        </Box>
                      </Group>
                    );
                    break;

                  case 'discreteScale':
                    if (question.rangeEnabled) {
                      const firstElementAverage = (questionResponses.reduce((sum, [first]) => sum + first, 0) / questionResponses.length).toFixed(2);
                      const secondElementAverage = (questionResponses.reduce((sum, [, second]) => sum + second, 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average response: {firstElementAverage} - {secondElementAverage}
                        </Text>
                      );

                    } else {
                      const discreteAverage = (questionResponses.reduce((sum, value) => sum + (value || 0), 0) / questionResponses.length).toFixed(2);
                      const discreteCounts = question.options?.reduce((acc, option) => {
                        acc[option] = questionResponses.filter((resp) => question.options?.[resp] === option).length;
                        return acc;
                      }, {} as Record<string, number>);
                      result = (
                        <Group align='flex-start' grow wrap="nowrap">
                          <Text>
                            Average response: {discreteAverage}
                          </Text>
                          <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                            <BarChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                              data={Object.entries(discreteCounts || {}).map(([option, count], index) => ({ name: option || questionResponses[index], Count: count }))} />
                          </Box>
                        </Group>
                      );
                    }
                    break;

                  case 'continousScale':
                    if (question.rangeEnabled) {
                      const firstElementAverage = (questionResponses.reduce((sum, [first]) => sum + first, 0) / questionResponses.length).toFixed(2);
                      const secondElementAverage = (questionResponses.reduce((sum, [, second]) => sum + second, 0) / questionResponses.length).toFixed(2);
                      result = (
                        <Text>
                          Average response: {firstElementAverage} - {secondElementAverage}
                        </Text>
                      );
                    } else {
                      const continousAverage = (questionResponses.reduce((sum, value) => sum + (value || 0), 0) / questionResponses.length).toFixed(2);
                      const continousCounts = questionResponses.reduce((acc, option) => {
                        acc[option] = questionResponses.filter((resp) => resp === option).length;
                        return acc;
                      }, {} as Record<number, number>);
                      const fullRange = []
                      for (let i = 0; i <= 100; i++) {
                        if (continousCounts[i]) {
                          fullRange.push(continousCounts[i]);
                        } else {
                          fullRange.push(0);
                        }
                      }
                      result = (
                        <Group align='flex-start' grow wrap="nowrap">
                          <Text>
                            Average response: {continousAverage} / 100
                          </Text>
                          <Box w="100%" style={{ overflow: 'hidden' }} mb='sm' mr='md'>
                            <LineChart h={200} dataKey='name' series={[{ name: 'Count', color: colors[index < colors.length ? index : index % colors.length] }]} gridAxis="xy"
                              data={Object.entries(fullRange || {}).map(([option, count]) => ({ name: option, Count: count }))} curveType="linear" />
                          </Box>
                        </Group>
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
                  <Paper key={index} p="md" withBorder id={`question-${index}`}>
                    <Group justify='space-between' align='flex-start' wrap='nowrap'>
                      <Box>
                        <Title order={4}>{question.question}</Title>
                        <Text c="dimmed" size="sm" mb="md">
                          Total responses: {questionResponses.length}
                        </Text>
                      </Box>
                      <ActionIcon variant='transparent' color='gray' c='dimmed' onClick={() => toggleExpand(index)}>
                        {expandedQuestions[index] ? <IconArrowBarUp size={18} title='Collapse responses' /> : <IconArrowBarDown size={18} title='Expand responses' />}
                      </ActionIcon>
                    </Group>
                    {expandedQuestions[index] ?
                      result :
                      <Center mb='-1rem' mt='-0.5rem'>
                        <Button size='sm' color="indigo" variant='transparent' onClick={() => toggleExpand(index)} style={{ fontWeight: 'normal' }}>
                          Expand responses
                        </Button>
                      </Center>}
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
                  onClick={open}
                >
                  Export results
                </Button>
              </Group>
              <Group justify='end'>
                <Popover width='20rem' position="top-end" withArrow shadow="md" onOpen={getSummary} arrowPosition='center' offset={{ mainAxis: 8, crossAxis: -8 }}>
                  <Popover.Target>
                    <Button
                      leftSection="✨"
                      variant='default'
                    >
                      Summarize with AI
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    {!aiSummary ? <Center p="xl">Thinking...</Center> : (
                      aiSummary === GEMINI_ERROR_MSG ?
                        <Center c='red'>{aiSummary}</Center> : <Center>{aiSummary}</Center>)}
                  </Popover.Dropdown>
                </Popover>
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
                  onClick={open}
                >
                  Export results
                </Button>
                <Popover width='15rem' position="top-end" withArrow shadow="md" onOpen={getSummary} arrowPosition='center' offset={{ mainAxis: 8, crossAxis: -8 }}>
                  <Popover.Target>
                    <Button
                      leftSection="✨"
                      variant='default'
                    >
                      Summarize
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    {!aiSummary ? <Center p="xl">Thinking...</Center> : (
                      aiSummary === GEMINI_ERROR_MSG ?
                        <Center c='red'>{aiSummary}</Center> : <Center>{aiSummary}</Center>)}
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Box>

            <Modal
              opened={opened}
              onClose={close}
              title={<Flex gap='xs'><IconFileDownload size={17} />Export results</Flex>}
              overlayProps={{ blur: 6, backgroundOpacity: 0.3 }}
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
                if (!responses[activePage - 1]) return null;

                const questionResponses = responses[activePage - 1];
                let result;

                if (questionResponses[index] === undefined || questionResponses[index] === null || questionResponses[index] === '') {
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

                    case 'number':
                      result = (
                        <NumberInput
                          value={questionResponses[index].toString() || ''}
                          disabled
                          w="fit-content"
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