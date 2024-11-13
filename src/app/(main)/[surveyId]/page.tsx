'use client'
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, use } from 'react';
import { fetchSurvey, saveSurveyAnswers } from '@/lib/firestore';
import { Survey } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button, Container, Group, Input } from '@mantine/core';

export default function SurveyPage(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const getSurvey = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      setSurvey(fetchedSurvey);
      setLoading(false);
    };

    getSurvey();
  }, [params.surveyId]);

  const handleInputChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = () => {
    saveSurveyAnswers(params.surveyId, answers);
    alert('Your answers have been saved. Thank you for participating in this poll.');
  };

  if (loading) {
    return <Loading />;
  }

  if (!survey && !loading) {
    router.replace('/' + params.surveyId + '/not-found');
    return <Loading />;
  }

  return (
    <Container>
      <h1>{survey?.title}</h1>
      <form onSubmit={handleSubmit}>
        {survey?.questions.map((question, index) => (
          <div key={index} className="question-container">
            <h3>{question.question}</h3>
            {question.type === 'text' ? (
              <Input
                type="text"
                value={answers[index] || ''}
                onChange={(e: any) => handleInputChange(index, e.target.value)}
                required
              />
            ) : question.type === 'multipleChoice' && (
              <div>
                {question.options?.map((option, optionIndex) => (
                  <label key={optionIndex}>
                    <Input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={(e: any) => handleInputChange(index, e.target.value)}
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        <Group mt="xl">
          <Button type="submit">Submit</Button>
          {user && user.uid === survey?.author &&
            <Link href={`/${params.surveyId}/results`}>
              <Button variant='default'>Show results</Button>
            </Link>}
        </Group>
      </form>
    </Container>
  );
}
