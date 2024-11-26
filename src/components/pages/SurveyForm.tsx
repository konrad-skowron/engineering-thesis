'use client'
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, use } from 'react';
import { fetchSurvey, saveSurveyResponse } from '@/lib/firestore';
import { Survey, Question } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { IconArrowRight, IconChartBar, IconShare } from '@tabler/icons-react';
import {
  Input,
  Center,
  Container,
  Title,
  Text,
  Textarea,
  Select,
  Button,
  Paper,
  Stack,
  Group,
  Checkbox,
  Radio,
  RadioGroup,
  RangeSlider,
  Slider,
  Box
} from '@mantine/core';
import { TableOfContents } from '../TableOfContents';
import { ButtonCopy } from '../ButtonCopy';

export default function SurveyForm(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<{ [index: number]: any }>({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const discreteScaleRangeDv = [10, 30];
  const discreteScaleDv = (length: number) => Math.floor((length) / 2);
  const continuousScaleRangeDv = [20, 60];
  const continuousScaleDv = 50;

  useEffect(() => {
    const getSurvey = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      setSurvey(fetchedSurvey);
      setLoading(false);
    };

    getSurvey();
  }, [params.surveyId]);

  const updateResponse = (index: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSubmit = async () => {
    const newResponses = { ...responses };

    for (const [index, question] of survey?.questions.entries() || []) {
      if (!newResponses[index]) {
        switch (question.type) {
          case 'discreteScale':
            if (question.rangeEnabled) {
              newResponses[index] = discreteScaleRangeDv;
            } else {
              newResponses[index] = discreteScaleDv(question.options?.length || 1);
            }
            break;
          case 'continousScale':
            if (question.rangeEnabled) {
              newResponses[index] = continuousScaleRangeDv;
            } else {
              newResponses[index] = continuousScaleDv;
            }
            break;
        }
      }

      if (question.required && !newResponses[index]) {
        alert(`Please provide a response for question "${question.question}"`);
        return;
      }
    }

    await saveSurveyResponse(params.surveyId, newResponses);
    setSubmitted(true);
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'text':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
            <Textarea
              value={responses[index] || ''}
              onChange={(e) => updateResponse(index, e.target.value)}
              required={question.required}
              resize="vertical"
            />
          </>
        );

      case 'singleChoice':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
            <RadioGroup
              value={responses[index] || ''}
              onChange={(value) => updateResponse(index, value)}
              required={question.required}
            >
              <Stack>
                {question.options?.map((option, optIndex) => (
                  <Radio
                    key={optIndex}
                    value={option}
                    label={option}
                  />
                ))}
              </Stack>
            </RadioGroup>
          </>
        );

      case 'multipleChoice':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
            <Checkbox.Group
              value={responses[index] || []}
              onChange={(value) => updateResponse(index, value)}
              required={question.required}
            >
              <Stack>
                {question.options?.map((option, optIndex) => (
                  <Checkbox
                    key={optIndex}
                    value={option}
                    label={option}
                  />
                ))}
              </Stack>
            </Checkbox.Group>
          </>
        );

      case 'dropdownList':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
            <Select
              w="fit-content"
              data={question.options || []}
              value={responses[index] || null}
              onChange={(value) => updateResponse(index, value)}
              required={question.required}
            />
          </>
        );

      case 'discreteScale':
        if (question.rangeEnabled) {
          const getScale = (v: number) => v / 10;

          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
              <Stack>
                <RangeSlider
                  scale={getScale}
                  min={0}
                  max={question.options ? question.options?.length * 10 - 10 : 50}
                  step={10}
                  marks={question.options?.map((opt, i) => ({ value: i * 10, label: opt.split(' ').join('\n') }))}
                  onChange={(value) => updateResponse(index, [value[0] / 10, value[1] / 10])}
                  defaultValue={responses[index] || discreteScaleRangeDv}
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
            </>
          );
        } else {
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
              <Slider
                label={(value) => question.options?.[value] || value}
                marks={question.options?.map((opt, i) => ({ value: i, label: opt.split(' ').join('\n') }))}
                min={0}
                max={(question.options?.length || 1) - 1}
                defaultValue={discreteScaleDv(question.options?.length || 1)}
                onChange={(value) => updateResponse(index, value)}
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
            </>
          );
        }

      case 'continousScale':
        if (question.rangeEnabled) {
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
              <Stack>
                <Group
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                  p="5%">
                  <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                  <RangeSlider
                    value={responses[index] || continuousScaleRangeDv}
                    onChange={(value) => updateResponse(index, value)}
                  />
                  <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                </Group>
              </Stack>
            </>
          );
        } else {
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title='required'></Input.Label>}</Text>
              <Stack>
                <Group
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                  p="5%">
                  <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                  <Slider
                    value={responses[index] || continuousScaleDv}
                    onChange={(value) => updateResponse(index, value)}
                    color="default"
                  />
                  <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                </Group>
              </Stack>
            </>
          );
        }

      default:
        return null;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!survey && !loading) {
    router.replace('/' + params.surveyId + '/not-found');
    return <Loading />;
  }

  if (!survey?.active) {
    return (
      <Container p='xl'>
        <Center>
          This survey has been closed.
        </Center>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container pt="xl" pb="xl">
        <Paper shadow="xs" p="md" withBorder>
          <Title order={2} c='green'>Success</Title>
          <Text mt='xs'>Your responses have been saved. Thank you for participating in this survey.</Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      <Container pt="xl">
        <Title order={2}>{survey.title}</Title>
        <Text c="dimmed" mb="xl">{survey.description}</Text>
      </Container>
      <TableOfContents links={survey.questions.map((question, index) => ({ label: question.question, link: `#question-${index}`, order: 1 }))} />
      <Container pb='xl'>
        <Stack gap="lg">
          {survey.questions.map((question, index) => (
            <Paper key={index} shadow="xs" p="md" withBorder id={`question-${index}`}>
              {renderQuestion(question, index)}
            </Paper>
          ))}

          <Group style={{ display: 'grid', gridTemplateColumns: '1fr auto' }} visibleFrom='xs'>
            <Group wrap="nowrap">
              <Button onClick={handleSubmit} rightSection={<IconArrowRight size={16} />}>
                Submit
              </Button>
              {user && user.uid === survey?.author &&
                <Link href={`/${params.surveyId}/results`}>
                  <Button variant='default' leftSection={<IconChartBar size={16} />}>
                    Show results
                  </Button>
                </Link>}
            </Group>
            <Group justify='end'>
              <ButtonCopy url={window.location.href} />
            </Group>
          </Group>
          <Box hiddenFrom='xs'>
            {user && user.uid === survey?.author ? (
              <Box>
                <Group grow>
                  <Button onClick={handleSubmit} rightSection={<IconArrowRight size={16} />}>
                    Submit
                  </Button>
                </Group>
                <Group grow mt="md">
                  <Button variant='default' leftSection={<IconChartBar size={16} />} onClick={() => router.push(`/${params.surveyId}/results`)}>
                    Show results
                  </Button>
                  <ButtonCopy url={window.location.href} />
                </Group>
              </Box>) : (
              <Group grow>
                <Button onClick={handleSubmit} rightSection={<IconArrowRight size={16} />}>
                  Submit
                </Button>
                <ButtonCopy url={window.location.href} />
              </Group>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
