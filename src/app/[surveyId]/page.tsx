'use client'
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import React, { useState, useEffect, use } from 'react';

interface Question {
  question: string;
  type: 'text' | 'multipleChoice';
  options?: string[];
}

interface Survey {
  title: string;
  questions: Question[];
}

export default function SurveyPage(props: { params: Promise<{ surveyId: string }> }) {
  const params = use(props.params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'surveys', params.surveyId));
        if (docSnap.exists()) {
          setSurvey(docSnap.data() as Survey);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.surveyId]);

  const handleInputChange = (questionIndex: number, value: string) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(answers);
  };

  if (!survey) {
    notFound();
  }

  return (
    <>
      { survey ? (
        <div className="survey-container">
          <h1>{survey.title}</h1>
          <form onSubmit={handleSubmit}>
            {survey.questions.map((question, index) => (
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
        ) : <div>Loading...</div> }
    </>
  );
}
