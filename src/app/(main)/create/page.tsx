'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { saveSurvey } from '@/lib/firestore';
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
  Text
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import RouteProtector from '@/components/auth/RouteProtector';

export default function Create() {
  const router = useRouter();
  const { user } = useAuth();
  const [surveyTitle, setSurveyTitle] = useState<string>('');
  const [surveyDescription, setSurveyDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([{ type: 'text', question: '', required: false }]);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'text', question: '', required: false }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
    if (field === 'type') {
      updatedQuestions[index] = {
        type: value as QuestionType,
        question: updatedQuestions[index].question,
        required: updatedQuestions[index].required,
        options: value === 'multipleChoice' ? [''] : undefined
      };
    } else {
      (updatedQuestions[index] as any)[field] = value;
    }
    setQuestions(updatedQuestions);
  };

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
    if (!user) {
      return;
    }
    const surveyId = await saveSurvey(surveyTitle, surveyDescription, questions, user);
    router.push(`/${surveyId}`);
  };

  return (
    <RouteProtector>
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Title order={2}>Create a Survey</Title>
          <Text c="dimmed">Complete the below fields to create your survey.</Text>
          
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
                description="(optional)"
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
                minRows={4}
              />
            </Stack>
          </Paper>
  
          {questions.map((q, index) => (
            <Paper key={index} shadow="xs" p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4}>Question {index + 1}</Title>
                  <ActionIcon 
                    color="red" 
                    variant="subtle"
                    onClick={() => removeQuestion(index)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
  
                <TextInput
                  placeholder="Enter your question"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  required
                />
  
                <Select
                  label="Type"
                  placeholder="Select question type"
                  value={q.type}
                  w="20rem"
                  onChange={(value: any) => updateQuestion(index, 'type', value)}
                  data={[
                    { value: 'text', label: 'Text Response' },
                    { value: 'singleChoice', label: 'Single Choice' },
                    { value: 'multipleChoice', label: 'Multiple Choice' },
                    { value: 'ranking', label: 'Ranking' },
                    { value: 'discreteScale', label: 'Discrete Scale' },
                    { value: 'continousScale', label: 'Continuous Scale' }
                  ]}
                />
  
                {q.type === 'multipleChoice' && (
                  <Box>
                    <Title order={6} mb="xs">Options</Title>
                    <Stack gap="xs">
                      {q.options?.map((option, optionIndex) => (
                        <Group key={optionIndex} gap="xs">
                          <TextInput
                            style={{ flex: 1 }}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                          />
                          <ActionIcon 
                            color="red" 
                            variant="subtle"
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      ))}
                      <Button 
                        variant="light" 
                        leftSection={<IconPlus size={14} />}
                        onClick={() => addOption(index)}
                        size="xs"
                      >
                        Add Option
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Paper>
          ))}
  
          <Group>
            <Button
              variant="default"
              leftSection={<IconPlus size={14} />}
              onClick={addQuestion}
            >
              Add question
            </Button>
  
            <Button
              color="blue"
              onClick={saveAndRedirect}
            >
              Create survey
            </Button>
          </Group>
        </Stack>
      </Container>
    </RouteProtector>
  );
}
