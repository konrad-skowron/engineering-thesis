import React from 'react';
import { render, screen, act } from '../../../../test-utils';
import Results from '../../../../src/app/(main)/[surveyId]/results/page';
import { fetchSurvey, fetchSurveyResponses } from '@/lib/firestore';

const id = 'someId';

const survey = {
  active: true,
  authorName: "Author Name",
  title: "Test survey",
  questions: [
    { question: "What is your name?", type: "text", rangeEnabled: false }
  ]
};

const responses = [
  ['John Doe'],
  ['Jane Doe']
];

jest.mock('../../../../src/lib/firestore.ts', () => ({
  fetchSurvey: jest.fn(),
  fetchSurveyResponses: jest.fn(),
}));

describe('Results', () => {
  it('renders a survey results', async () => {
    (fetchSurvey as jest.Mock).mockResolvedValue(survey);
    (fetchSurveyResponses as jest.Mock).mockResolvedValue(responses);

    await act(async () => {
      render(<Results params={Promise.resolve({ surveyId: id })} />);
    });

    expect(screen.getByText('Test survey')).toBeInTheDocument();
    expect(screen.getAllByText('What is your name?')[0]).toBeInTheDocument();
    expect(screen.getByText('Total responses: 2')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Jane Doe')[0]).toBeInTheDocument();
  });

  it('renders no results yet', async () => {
    (fetchSurvey as jest.Mock).mockResolvedValue(survey);
    (fetchSurveyResponses as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      render(<Results params={Promise.resolve({ surveyId: id })} />);
    });

    expect(screen.getByText('Test survey')).toBeInTheDocument();
    expect(screen.getByText('What is your name?')).toBeInTheDocument();
    expect(screen.getByText('Total responses: 0')).toBeInTheDocument();
    expect(screen.getByText('No responses yet.')).toBeInTheDocument();
  });
});
