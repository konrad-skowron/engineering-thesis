'use client'
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, use } from 'react';
import { fetchSurvey, saveSurveyResponse } from '@/lib/firebase/firestore';
import { Survey, Question } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/AuthProvider';
import { IconArrowRight, IconChartBar, IconMinus, IconPlus, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
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
  Box,
  NumberInput,
  ActionIcon
} from '@mantine/core';
import { ButtonCopy } from '../ButtonCopy';
import { useTranslations } from 'next-intl';
// import { TableOfContents } from '../TableOfContents';

export default function SurveyForm(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<{ [index: number]: any }>({});
  const [submitted, setSubmitted] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [activeThumb, setActiveThumb] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('surveyForm');
  const tCommon = useTranslations('common');

  const discreteScaleDv = (length: number) => Math.floor(length / 2);
  const discreteScaleRangeDv = (length: number) => [Math.floor(length * 1 / 4) * 10, Math.floor(length * 3 / 4) * 10] as [number, number];
  const continuousScaleDv = 50;
  const continuousScaleRangeDv = [25, 75] as [number, number];

  useEffect(() => {
    const getSurvey = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      setSurvey(fetchedSurvey);
      setLoading(false);
    };

    const saved = localStorage.getItem(`survey_${params.surveyId}`);
    if (saved) {
      setResponses(JSON.parse(saved));
      setFieldsDisabled(true);
    }

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
              newResponses[index] = discreteScaleRangeDv(question.options?.length || 1);
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
        alert(`${t('provideResponse')} "${question.question}"`);
        return;
      }
    }

    await saveSurveyResponse(params.surveyId, newResponses);
    localStorage.setItem(`survey_${params.surveyId}`, JSON.stringify(newResponses)); // Save to localStorage
    setSubmitted(true);
    setFieldsDisabled(true);
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'text':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
            <Textarea
              value={responses[index] || ''}
              onChange={(e) => updateResponse(index, e.target.value)}
              required={question.required}
              resize="vertical"
              disabled={fieldsDisabled}
            />
          </>
        );

      case 'number':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
            <NumberInput
              placeholder={t('enterNumber')}
              value={responses[index] || ''}
              onChange={(value) => updateResponse(index, value)}
              required={question.required}
              w="fit-content"
              disabled={fieldsDisabled}
            />
          </>
        );

      case 'singleChoice':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
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
                    disabled={fieldsDisabled}
                  />
                ))}
              </Stack>
            </RadioGroup>
          </>
        );

      case 'multipleChoice':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
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
                    disabled={fieldsDisabled}
                  />
                ))}
              </Stack>
            </Checkbox.Group>
          </>
        );

      case 'dropdownList':
        return (
          <>
            <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
            <Select
              placeholder={t('pickValue')}
              data={question.options || []}
              value={responses[index] || null}
              onChange={(value) => updateResponse(index, value)}
              required={question.required}
              disabled={fieldsDisabled}
            />
          </>
        );

      case 'discreteScale':
        if (question.rangeEnabled) {
          const getScale = (v: number) => v / 10;
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
              <Stack>
                <RangeSlider
                  scale={getScale}
                  min={0}
                  max={question.options ? question.options?.length * 10 - 10 : 50}
                  step={10}
                  marks={question.options?.map((opt, i) => ({ value: i * 10, label: opt.split(' ').join('\n') }))}
                  defaultValue={
                    Array.isArray(responses[index]) && responses[index].length === 2
                      ? [responses[index][0] * 10, responses[index][1] * 10]
                      : discreteScaleRangeDv(question.options?.length || 1)
                  }
                  onChange={(value) => updateResponse(index, [value[0] / 10, value[1] / 10])}
                  p="8%"
                  mb="xl"
                  styles={{
                    markLabel: {
                      whiteSpace: 'pre-wrap',
                      display: 'block',
                      textAlign: 'center'
                    }
                  }}
                  disabled={fieldsDisabled}
                />
              </Stack>
            </>
          );
        } else {
          const currentValue = responses[index] ?? discreteScaleDv(question.options?.length || 1);
          const maxValue = (question.options?.length || 1) - 1;
          
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
              <Box>
                <Slider
                  label={(value) => question.options?.[value] || value + 1}
                  marks={question.options?.map((opt, i) => ({ 
                    value: i, 
                    label: opt.split(' ').join('\n')
                  }))}
                  min={0}
                  max={maxValue}
                  value={currentValue}
                  onChange={fieldsDisabled ? undefined : (value) => updateResponse(index, value)}
                  onChangeEnd={() => setActiveThumb(null)}
                  labelAlwaysOn={activeThumb === `discrete-${index}`}
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
                <Group justify="center" mt="md" hiddenFrom="sm">
                  <Button.Group>
                    <Button 
                      variant="default" 
                      radius="md" 
                      onClick={() => {
                        if (!fieldsDisabled) {
                          const newValue = Math.max(0, currentValue - 1);
                          updateResponse(index, newValue);
                        }
                      }}
                      disabled={fieldsDisabled || currentValue === 0}
                      aria-label={t('decreaseValue')}
                    >
                      <IconChevronDown color="var(--mantine-color-red-text)" />
                    </Button>
                    <Button.GroupSection variant="default" bg="var(--mantine-color-body)" miw={80}>
                      {currentValue}
                    </Button.GroupSection>
                    <Button 
                      variant="default" 
                      radius="md" 
                      onClick={() => {
                        if (!fieldsDisabled) {
                          const newValue = Math.min(maxValue, currentValue + 1);
                          updateResponse(index, newValue);
                        }
                      }}
                      disabled={fieldsDisabled || currentValue === maxValue}
                      aria-label={t('increaseValue')}
                    >
                      <IconChevronUp color="var(--mantine-color-teal-text)" />
                    </Button>
                  </Button.Group>
                </Group>
              </Box>
            </>
          );
        }

      case 'continousScale':
        if (question.rangeEnabled) {
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
              <Stack>
                <Group
                  visibleFrom='xs'
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                  p="5%">
                  <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                  <RangeSlider
                    defaultValue={responses[index] || continuousScaleRangeDv}
                    onChange={(value) => updateResponse(index, value)}
                    minRange={1}
                    disabled={fieldsDisabled}
                  />
                  <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                </Group>
                <Group
                  hiddenFrom='xs'
                  style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr' }}
                  p="5%">
                  <Text c="dimmed" size='sm'>{question.options?.[0]}</Text>
                  <RangeSlider
                    defaultValue={responses[index] || continuousScaleRangeDv}
                    onChange={(value) => updateResponse(index, value)}
                    minRange={1}
                    disabled={fieldsDisabled}
                  />
                  <Text c="dimmed" size='sm'>{question.options?.[1]}</Text>
                </Group>
              </Stack>
            </>
          );
        } else {
          const currentValue = responses[index] ?? continuousScaleDv;
          
          return (
            <>
              <Text mb="xs">{question.question} {question.required && <Input.Label required title={tCommon('required')}></Input.Label>}</Text>
              <Stack>
                <Group
                  visibleFrom='xs'
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto' }}
                  p="5%">
                  <Text 
                    c="dimmed" 
                    size='sm' 
                    style={{ cursor: fieldsDisabled ? 'default' : 'pointer' }}
                    onClick={() => !fieldsDisabled && updateResponse(index, 0)}
                  >
                    {question.options?.[0]}
                  </Text>
                  <Slider
                    label={(value) => value}
                    value={currentValue}
                    onChange={fieldsDisabled ? undefined : (value) => updateResponse(index, value)}
                    onChangeEnd={() => setActiveThumb(null)}
                    labelAlwaysOn={activeThumb === `continuous-${index}`}
                    color="default"
                  />
                  <Text 
                    c="dimmed" 
                    size='sm'
                    style={{ cursor: fieldsDisabled ? 'default' : 'pointer' }}
                    onClick={() => !fieldsDisabled && updateResponse(index, 100)}
                  >
                    {question.options?.[1]}
                  </Text>
                </Group>
                <Group
                  hiddenFrom='xs'
                  style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr' }}
                  p="5%">
                  <Text 
                    c="dimmed" 
                    size='sm'
                    style={{ cursor: fieldsDisabled ? 'default' : 'pointer' }}
                    onClick={() => !fieldsDisabled && updateResponse(index, 0)}
                  >
                    {question.options?.[0]}
                  </Text>
                  <Slider
                    label={(value) => value}
                    value={currentValue}
                    onChange={fieldsDisabled ? undefined : (value) => updateResponse(index, value)}
                    onChangeEnd={() => setActiveThumb(null)}
                    labelAlwaysOn={activeThumb === `continuous-${index}`}
                    color="default"
                  />
                  <Text 
                    c="dimmed" 
                    size='sm'
                    style={{ cursor: fieldsDisabled ? 'default' : 'pointer' }}
                    onClick={() => !fieldsDisabled && updateResponse(index, 100)}
                  >
                    {question.options?.[1]}
                  </Text>
                </Group>
                <Group justify="center" mt="sm" hiddenFrom="sm">
                  <Button.Group>
                    <Button 
                      variant="default" 
                      radius="md" 
                      onClick={() => {
                        if (!fieldsDisabled) {
                          const newValue = Math.max(0, currentValue - 1);
                          updateResponse(index, newValue);
                        }
                      }}
                      disabled={fieldsDisabled || currentValue === 0}
                      aria-label={t('decreaseValue')}
                    >
                      <IconChevronDown color="var(--mantine-color-red-text)" />
                    </Button>
                    <Button.GroupSection variant="default" bg="var(--mantine-color-body)" miw={80}>
                      {currentValue}
                    </Button.GroupSection>
                    <Button 
                      variant="default" 
                      radius="md" 
                      onClick={() => {
                        if (!fieldsDisabled) {
                          const newValue = Math.min(100, currentValue + 1);
                          updateResponse(index, newValue);
                        }
                      }}
                      disabled={fieldsDisabled || currentValue === 100}
                      aria-label={t('increaseValue')}
                    >
                      <IconChevronUp color="var(--mantine-color-teal-text)" />
                    </Button>
                  </Button.Group>
                </Group>
              </Stack>
            </>
          );
        }

      default:
        return null;
    }
  };

  if (!survey && !loading) {
    router.replace('/' + params.surveyId + '/not-found');
  }

  if (loading || !survey) {
    return <Loading />;
  }

  if (!survey?.active) {
    return (
      <Container p='xl'>
        <Center>
          {t('surveyClosed')}
        </Center>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container pt="xl" pb="xl">
        <Paper shadow="xs" p="md" withBorder>
          <Title order={2} c='green'>{t('success')}</Title>
          <Text mt='xs'>{t('thankYou')}</Text>
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
      {/* <TableOfContents links={survey.questions.map((question, index) => ({ label: question.question, link: `#question-${index}`, order: 1 }))} /> */}
      <Container pb='xl'>
        <Stack gap="lg">
          {survey.questions.map((question, index) => (
            <Paper key={index} shadow="xs" p="md" withBorder id={`question-${index}`}>
              {renderQuestion(question, index)}
            </Paper>
          ))}

          {!fieldsDisabled ? (
            <>
              <Group style={{ display: 'grid', gridTemplateColumns: '1fr auto' }} visibleFrom='xs'>
                <Group wrap="nowrap">
                  <Button onClick={handleSubmit} rightSection={<IconArrowRight size={16} />}>
                    {tCommon('submit')}
                  </Button>
                  {user && user.uid === survey?.author &&
                    <Link href={`/${params.surveyId}/results`}>
                      <Button variant='default' leftSection={<IconChartBar size={16} />}>
                        {t('showResults')}
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
                        {tCommon('submit')}
                      </Button>
                    </Group>
                    <Group grow mt="md">
                      <Button variant='default' leftSection={<IconChartBar size={16} />} onClick={() => router.push(`/${params.surveyId}/results`)}>
                        {t('showResults')}
                      </Button>
                      <ButtonCopy url={window.location.href} />
                    </Group>
                  </Box>) : (
                  <Group grow>
                    <Button onClick={handleSubmit} rightSection={<IconArrowRight size={16} />}>
                      {tCommon('submit')}
                    </Button>
                    <ButtonCopy url={window.location.href} />
                  </Group>
                )}
              </Box>
            </>
          ) : (
            <>
              <Group visibleFrom='xs' justify='end'>
                {user && user.uid === survey?.author &&
                  <Link href={`/${params.surveyId}/results`}>
                    <Button variant='default' leftSection={<IconChartBar size={16} />}>
                      {t('showResults')}
                    </Button>
                  </Link>}
              </Group>
              <Group hiddenFrom='xs' grow>
                {user && user.uid === survey?.author &&
                  <Button variant='default' leftSection={<IconChartBar size={16} />} onClick={() => router.push(`/${params.surveyId}/results`)}>
                    {t('showResults')}
                  </Button>}
              </Group>
              {!user || user.uid !== survey?.author ? (
                <Center mb='xs'>
                  <Text c="dimmed" size='sm'>{t('responseRecorded')}</Text>
                </Center>) : null}
            </>)}
        </Stack>
      </Container>
    </Box>
  );
}
