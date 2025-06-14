'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { saveSurvey, fetchSurvey, updateSurvey, fetchAllSurveyParticipants } from '@/lib/firebase/firestore';
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

  useEffect(() => {
    let ignore = false;
    const checkEditPermissions = async () => {
      if (surveyId) {
        setLoading(true);
        const survey = await fetchSurvey(surveyId);
        if (!survey) {
          if (!ignore) {
            setEditError('Survey not found.');
            setCanEdit(false);
            setLoading(false);
          }
          return;
        }
        if (survey.author !== user?.uid) {
          if (!ignore) {
            setEditError('You are not the author of this survey.');
            setCanEdit(false);
            setLoading(false);
          }
          return;
        }
        const participantsMap = await fetchAllSurveyParticipants([surveyId]);
        const participants = participantsMap[surveyId] || 0;
        if (participants > 0) {
          if (!ignore) {
            setEditError('Survey already has responses.');
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
    checkEditPermissions();
    return () => { ignore = true; };
  }, [surveyId, user]);

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
      return ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
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
      alert('Please enter a survey title.');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        alert('Please fill each required field.');
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
            <Title order={2} c="red">Access Denied</Title>
            <Text mt='xs'>{editError}</Text>
          </Paper>
        </Container>
      </RouteProtector>
    );
  }

  return (
    <RouteProtector>
      <Container pt="xl" pb="xl">
        <Title order={2}>Create a Survey</Title>
        <Text c="dimmed" mb="lg">Complete the below fields to create your survey.</Text>
        <Stack gap="lg">

          <Paper shadow="xs" p="md" withBorder>
            <Stack gap="md">
              <TextInput
                size='md'
                label="Title"
                placeholder="Enter survey title"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                required
              />

              <Textarea
                label="Description"
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
                    label={`Question ${index + 1}`}
                    placeholder="Enter your question"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    required
                  />

                  <Select
                    label="Type"
                    allowDeselect={false}
                    placeholder="Select question type"
                    value={q.type}
                    onChange={(value: any) => updateQuestion(index, 'type', value)}
                    data={[
                      { value: 'text', label: 'Text Response' },
                      { value: 'number', label: 'Number Response' },
                      { value: 'singleChoice', label: 'Single Choice' },
                      { value: 'multipleChoice', label: 'Multiple Choice' },
                      { value: 'discreteScale', label: 'Discrete Scale' },
                      { value: 'continousScale', label: 'Continuous Scale' },
                      { value: 'dropdownList', label: 'Dropdown List' },
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
                  label="Required"
                  checked={q.required}
                  onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                />

                {(q.type === 'discreteScale' || q.type === 'continousScale') && (
                  <Switch
                    label="Enable selecting ranges"
                    checked={q.rangeEnabled}
                    onChange={(e) => updateQuestion(index, 'rangeEnabled', e.target.checked)}
                  />
                )}

                {q.type !== 'text' && q.type !== 'number' && (
                  <Box>
                    {q.type !== 'continousScale' ? (
                      <>
                        <Title order={6} mb="xs">
                          {q.type === 'discreteScale' ? 'Values' : 'Options'}
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
                                placeholder={q.type === 'discreteScale' ? `Label (optional)` : `Option ${optionIndex + 1}`}
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
                            Add {q.type === 'discreteScale' ? 'value' : 'option'}
                          </Button>
                        </Stack>
                      </>) : (
                      <Group grow>
                        <TextInput
                          label='Left label'
                          placeholder={`Label (optional)`}
                          onChange={(e) => updateOption(index, 0, e.target.value)}
                        />
                        <TextInput
                          label='Right label'
                          placeholder={`Label (optional)`}
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
              Add question
            </Button>

            {surveyId ? (
              <Group justify='end'>
                <Button
                  color="blue"
                  onClick={saveAndRedirect}
                >
                  Save survey
                </Button>
                <Button
                  variant="default"
                  onClick={router.back}
                >
                  Cancel
                </Button>
              </Group>
            ) :
              <Group justify='flex-start'>
                <Button
                  color="blue"
                  onClick={saveAndRedirect}
                >
                  Create survey
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
              Add question
            </Button>

            <Button
              color="blue"
              onClick={saveAndRedirect}
            >
              {surveyId ? 'Save survey' : 'Create survey'}
            </Button>
          </Group>
        </Stack>
      </Container>
    </RouteProtector>
  );
}
