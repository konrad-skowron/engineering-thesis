'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { saveSurvey, fetchSurvey, updateSurvey, fetchAllSurveyParticipants, fetchUserSurveys } from '@/lib/firebase/firestore';
import { Question, QuestionType } from '@/lib/types';
import {
  Container,
  Title,
  TextInput,
  Textarea,
  Select,
  Button,
  Paper,
  Stack,
  Group,
  Box,
  ActionIcon,
  Text,
  Checkbox,
  Radio,
  Switch,
  Divider
} from '@mantine/core';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import RouteProtector from '@/components/RouteProtector';
import { Loading } from '@/components/Loading';
import { useTranslations } from 'next-intl';

export default function SurveyCreator() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [surveyTitle, setSurveyTitle] = useState<string>('');
  const [surveyDescription, setSurveyDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([{ type: 'text', question: '', rangeEnabled: false, required: false }]);
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const surveyId = params?.surveyId as string | undefined;
  const t = useTranslations('surveyCreator');
  const tCommon = useTranslations('common');

  useEffect(() => {
    let ignore = false;
    const checkEditPermissions = async () => {
      if (surveyId) {
        setLoading(true);
        const survey = await fetchSurvey(surveyId);
        if (!survey) {
          if (!ignore) {
            setEditError(t('surveyNotFound'));
            setCanEdit(false);
            setLoading(false);
          }
          return;
        }
        if (survey.author !== user?.uid) {
          if (!ignore) {
            setEditError(t('notAuthor'));
            setCanEdit(false);
            setLoading(false);
          }
          return;
        }
        const participantsMap = await fetchAllSurveyParticipants([surveyId]);
        const participants = participantsMap[surveyId] || 0;
        if (participants > 0) {
          if (!ignore) {
            setEditError(t('hasResponses'));
            setCanEdit(false);
            setLoading(false);
          }
          return;
        }
        if (!ignore) {
          setSurveyTitle(survey.title);
          setSurveyDescription(survey.description);
          setQuestions(survey.questions);
          setCanEdit(true);
          setEditError(null);
          setLoading(false);
        }
      }
    };
    const init = async () => {
      if (!user) return;
      const surveys = await fetchUserSurveys(user);
      const surveysCount = surveys.length;
      if (surveysCount >= 10) {
        alert(t('surveyLimitReached'));
        router.replace('/account');
        return;
      }
      await checkEditPermissions();
    };
    init();
    return () => { ignore = true; };
  }, [surveyId, user, t, router]);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'text', question: '', rangeEnabled: false, required: false }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'type') {
      updatedQuestions[index] = {
        type: value as QuestionType,
        question: updatedQuestions[index].question,
        required: updatedQuestions[index].required,
        rangeEnabled: updatedQuestions[index].rangeEnabled,
        options: setOptions(value)
      };
    } else {
      (updatedQuestions[index] as any)[field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const setOptions = (type: string) => {
    if (type === 'singleChoice' || type === 'multipleChoice' || type === 'dropdownList') {
      return [''];
    } else if (type === 'discreteScale') {
      return [
        t('defaultScaleOptions.stronglyDisagree'),
        t('defaultScaleOptions.disagree'),
        t('defaultScaleOptions.neutral'),
        t('defaultScaleOptions.agree'),
        t('defaultScaleOptions.stronglyAgree')
      ];
    } else if (type === 'continousScale') {
      return ['', ''];
    } else {
      return [];
    }
  }

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options!.push('');
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (indexToRemove: number) => {
    setQuestions((prevQuestions: Question[]) =>
      prevQuestions.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prevQuestions: Question[]) =>
      prevQuestions.map((question, qIndex) => {
        if (qIndex === questionIndex && question.options) {
          return {
            ...question,
            options: question.options.filter((_, oIndex) => oIndex !== optionIndex)
          };
        }
        return question;
      })
    );
  };

  const saveAndRedirect = async () => {
    if (!user) return;
    if (!surveyTitle) {
      alert(t('enterTitle'));
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        alert(t('fillFields'));
        return;
      }
    }
    let id = surveyId;
    if (surveyId) {
      await updateSurvey(surveyId, surveyTitle, surveyDescription, questions, user);
    } else {
      id = await saveSurvey(surveyTitle, surveyDescription, questions, user);
    }
    router.push(`/${id}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!canEdit && editError) {
    return (
      <RouteProtector>
        <Container pt="xl" pb="xl">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={2} c="red">{t('accessDenied')}</Title>
            <Text mt='xs'>{editError}</Text>
          </Paper>
        </Container>
      </RouteProtector>
    );
  }

  return (
    <RouteProtector>
      <Container pt="xl" pb="xl">
        <Title order={2}>{t('title')}</Title>
        <Text c="dimmed" mb="lg">{t('subtitle')}</Text>
        <Stack gap="lg">

          <Paper shadow="xs" p="md" withBorder>
            <Stack gap="md">
              <TextInput
                size='md'
                label={t('surveyTitle')}
                placeholder={t('surveyTitlePlaceholder')}
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                required
              />

              <Textarea
                label={t('description')}
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
                resize="vertical"
              />
            </Stack>
          </Paper>

          {questions.map((q, index) => (
            <Paper key={index} shadow="xs" p="md" withBorder>
              <Stack gap="md">
                <Group justify='space-between' style={{ display: 'grid', gridTemplateColumns: 'minmax(auto, 100%) auto auto' }}>
                  <TextInput
                    label={`${t('question')} ${index + 1}`}
                    placeholder={t('questionPlaceholder')}
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    required
                  />

                  <Select
                    label={t('type')}
                    allowDeselect={false}
                    placeholder={t('selectType')}
                    value={q.type}
                    onChange={(value: any) => updateQuestion(index, 'type', value)}
                    data={[
                      { value: 'text', label: t('textResponse') },
                      { value: 'number', label: t('numberResponse') },
                      { value: 'singleChoice', label: t('singleChoice') },
                      { value: 'multipleChoice', label: t('multipleChoice') },
                      { value: 'discreteScale', label: t('discreteScale') },
                      { value: 'continousScale', label: t('continuousScale') },
                      { value: 'dropdownList', label: t('dropdownList') },
                    ]}
                  />

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeQuestion(index)}
                    style={{
                      height: 'auto',
                      alignSelf: 'stretch',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>

                <Divider />

                <Switch
                  label={t('required')}
                  checked={q.required}
                  onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                />

                {(q.type === 'discreteScale' || q.type === 'continousScale') && (
                  <Switch
                    label={t('enableRanges')}
                    checked={q.rangeEnabled}
                    onChange={(e) => updateQuestion(index, 'rangeEnabled', e.target.checked)}
                  />
                )}

                {q.type !== 'text' && q.type !== 'number' && (
                  <Box>
                    {q.type !== 'continousScale' ? (
                      <>
                        <Title order={6} mb="xs">
                          {q.type === 'discreteScale' ? t('values') : t('options')}
                        </Title>
                        <Stack gap="xs">
                          {q.options?.map((option, optionIndex) => (
                            <Group key={optionIndex} gap="xs">
                              {q.type === 'singleChoice' && <Radio disabled />}
                              {q.type === 'multipleChoice' && <Checkbox disabled />}
                              {q.type === 'dropdownList' && <Text>{optionIndex + 1}.</Text>}
                              {q.type === 'discreteScale' && <Text>{optionIndex}</Text>}
                              <TextInput
                                style={{ flex: 1 }}
                                placeholder={q.type === 'discreteScale' ? t('labelOptional') : `${t('option')} ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                              />
                              <ActionIcon
                                color="gray"
                                variant="subtle"
                                onClick={() => removeOption(index, optionIndex)}
                              >
                                <IconX size={18} />
                              </ActionIcon>
                            </Group>
                          ))}
                          <Button
                            variant="light"
                            leftSection={<IconPlus size={14} />}
                            onClick={() => addOption(index)}
                            mt='xs'
                            size='xs'
                          >
                            {q.type === 'discreteScale' ? t('addValue') : t('addOption')}
                          </Button>
                        </Stack>
                      </>) : (
                      <Group grow>
                        <TextInput
                          label={t('leftLabel')}
                          placeholder={t('labelOptional')}
                          onChange={(e) => updateOption(index, 0, e.target.value)}
                        />
                        <TextInput
                          label={t('rightLabel')}
                          placeholder={t('labelOptional')}
                          onChange={(e) => updateOption(index, 1, e.target.value)}
                        />
                      </Group>
                    )}
                  </Box>
                )}
              </Stack>
            </Paper>
          ))}

          <Group visibleFrom='xs' style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
            <Button
              variant="default"
              leftSection={<IconPlus size={16} />}
              onClick={addQuestion}
            >
              {t('addQuestion')}
            </Button>

            {surveyId ? (
              <Group justify='end'>
                <Button
                  color="blue"
                  onClick={saveAndRedirect}
                >
                  {t('saveSurvey')}
                </Button>
                <Button
                  variant="default"
                  onClick={router.back}
                >
                  {tCommon('cancel')}
                </Button>
              </Group>
            ) :
              <Group justify='flex-start'>
                <Button
                  color="blue"
                  onClick={saveAndRedirect}
                >
                  {t('createSurvey')}
                </Button>
              </Group>
            }

          </Group>
          <Group hiddenFrom='xs' grow>
            <Button
              variant="default"
              leftSection={<IconPlus size={16} />}
              onClick={addQuestion}
            >
              {t('addQuestion')}
            </Button>

            <Button
              color="blue"
              onClick={saveAndRedirect}
            >
              {surveyId ? t('saveSurvey') : t('createSurvey')}
            </Button>
          </Group>
        </Stack>
      </Container>
    </RouteProtector>
  );
}
