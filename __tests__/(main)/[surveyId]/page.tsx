import React from 'react';
import { render, screen, userEvent, act, waitFor } from '../../../test-utils';
import SurveyPage from '../../../src/app/(main)/[surveyId]/page';
import { useRouter } from 'next/navigation';
import { getDoc } from 'firebase/firestore';

const id = 'someId';

const survey = {
  active: true,
  title: "Test survey",
  questions: [
    { question: "What is your name?", type: "text" },
    { question: "What is your gender?", type: "singleChoice" }
  ]
};

describe('SurveyPage', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  it('renders a survey', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => survey,
    });

    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    });

    const surveyTitle = 'Test survey';
    const title = screen.getByText(surveyTitle);
    const question1 = screen.getByText('What is your name?');
    const question2 = screen.getByText('What is your gender?');

    expect(title).toBeInTheDocument();
    expect(question1).toBeInTheDocument();
    expect(question2).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('submits the form when the submit button is clicked', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => survey,
    });

    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    });

    const submitButtons = screen.getAllByText('Submit');
    userEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('redirects to not-found if the survey does not exist', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false, // Simulate a nonexistent survey
    });

    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/${id}/not-found`);
    });
  });
});