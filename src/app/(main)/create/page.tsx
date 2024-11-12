'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { saveSurvey } from '@/lib/firestore';
import { Question, QuestionType } from '@/lib/types';
import { Container } from '@mantine/core';
import RouteProtector from '@/components/auth/RouteProtector';

export default function Create() {
  const router = useRouter();
  const { user } = useAuth();
  const [surveyTitle, setSurveyTitle] = useState<string>('');
  const [surveyDescription, setSurveyDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

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

  const saveAndRedirect = async () => {
    if (!user) {
      return;
    }
    const surveyId = await saveSurvey(surveyTitle, surveyDescription, questions, user);
    router.push(`/${surveyId}`);
  };

  return (
    <RouteProtector>
      <Container>
        <h1>Complete the below fields to create your survey</h1>
        <input
          type="text"
          value={surveyTitle}
          onChange={(e) => setSurveyTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          type="text"
          value={surveyDescription}
          onChange={(e) => setSurveyDescription(e.target.value)}
          placeholder="Description"
        />
        {questions.map((q, index) => (
          <p key={index}>
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Question"
            />
            <select
              value={q.type}
              onChange={(e) => updateQuestion(index, 'type', e.target.value)}
            >
              <option value="text">Text</option>
              <option value="singleChoice">Single Choice</option>
              <option value="multipleChoice">Multiple Choice</option>
              <option value="ranking">Ranking</option>
              <option value="discreteScale">Discrete Scale</option>
              <option value="continousScale">Continous Scale</option>
            </select>
            {q.type === 'multipleChoice' && (
              <div>
                {q.options?.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                ))}
                <button type="button" onClick={() => addOption(index)}>Add Option</button>
              </div>
            )}
          </p>
        ))}
        <p></p>
        <button onClick={addQuestion}>Add Question</button>
        <button onClick={saveAndRedirect}>Save Survey</button>
      </Container>
    </RouteProtector>
  );
}
