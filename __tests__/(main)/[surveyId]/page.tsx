import React from 'react';
import { render, screen, userEvent, act, waitFor } from '../../../test-utils';
import SurveyPage from '../../../src/app/(main)/[surveyId]/page';

describe('SurveyPage', () => {
  it('renders a title with the survey title', async () => {
    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: 'someId' })} />);
    })

    const surveyTitle = 'Test survey';
    const title = screen.getByText(surveyTitle);

    expect(title).toBeInTheDocument();
  });

  it('renders a list of questions', async () => {
    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: 'someId' })} />);
    })

    const question1 = screen.getByText('What is your name?');
    const question2 = screen.getByText('What is your gender?');

    expect(question1).toBeInTheDocument();
    expect(question2).toBeInTheDocument();
  });

  it('submits the form when the submit button is clicked', async () => {
    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: 'someId' })} />);
    })

    const submitButtons = screen.getAllByText('Submit');
    userEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});