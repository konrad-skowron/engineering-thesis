'use client'
import { notFound, useRouter } from 'next/navigation';
import React, { useState, useEffect, use } from 'react';
import { fetchSurvey, Survey, Question } from '@/lib/firestore';
import { Loading } from '@/components/Loading';

export default function SurveyPage(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
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

  const handleInputChange = (questionIndex: number, value: string) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(answers);
  };

  if (loading) {
    return <Loading />;
  }

  if (!survey && !loading) {
    router.replace('/' + params.surveyId + '/not-found');
    return <Loading />;
  }

  return (
    <div className="survey-container">
      <h1>{survey?.title}</h1>
      <form onSubmit={handleSubmit}>
        {survey?.questions.map((question, index) => (
          <div key={index} className="question-container">
            <h3>{question.question}</h3>
            {question.type === 'text' ? (
              <input
                type="text"
                value={answers[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                required
              />
            ) : question.type === 'multipleChoice' ? (
              <div>
                {question.options?.map((option, optionIndex) => (
                  <label key={optionIndex}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
