'use client'
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, use } from 'react';
import { fetchSurvey, saveSurveyResponses } from '@/lib/firestore';
import { Survey } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button, Container, Group, Input, Center } from '@mantine/core';
import { IconArrowRight, IconChartBar, IconShare } from '@tabler/icons-react';
import { copyLink } from '@/lib/utils';

export default function SurveyForm(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const getSurvey = async () => {
      const fetchedSurvey = await fetchSurvey(params.surveyId);
      setSurvey(fetchedSurvey);
      setLoading(false);
    };

    getSurvey();
  }, [params.surveyId]);

  const handleInputChange = (questionIndex: number, response: string) => {
    setResponses({ ...responses, [questionIndex]: response });
  };

  const handleSubmit = () => {
    saveSurveyResponses(params.surveyId, responses);
    alert('Your responses have been saved. Thank you for participating in this poll.');
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
      <Container>
        <Center>
          This survey has been closed.
        </Center>
      </Container>
    );
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
                value={responses[index] || ''}
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
                      checked={responses[index] === option}
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
        <Group mt="xl" grow>
          <Group>
            <Button type="submit" rightSection={<IconArrowRight size={16} />}>
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
            <Button
              onClick={copyLink}
              leftSection={<IconShare size={16} />}
              variant='default'
            >
              Share
            </Button>
          </Group>
        </Group>
      </form>
    </Container>
  );
}
