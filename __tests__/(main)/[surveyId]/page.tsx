import React from 'react';
import { render, screen, userEvent, act, waitFor } from '../../../test-utils';
import SurveyPage from '../../../src/app/(main)/[surveyId]/page';

describe('SurveyPage', () => {
  const timeoutTime = 10000;
  const id = 'HafDUdDSgZGWs4dZXGfR';

  it('renders a title with the survey title', async () => {
    const surveyTitle = 'Test survey';

    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    })

    await waitFor(() => {
      const title = screen.getByText(surveyTitle);

      expect(title).toBeInTheDocument();
    }, { timeout: timeoutTime });
  }, timeoutTime);

  it('renders a list of questions', async () => {
    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    })

    await waitFor(() => {
      const question1 = screen.getByText('What is your name?');
      const question2 = screen.getByText('What is your gender?');

      expect(question1).toBeInTheDocument();
      expect(question2).toBeInTheDocument();
    }, { timeout: timeoutTime });
  }, timeoutTime);

  it('submits the form when the submit button is clicked', async () => {
    await act(async () => {
      render(<SurveyPage params={Promise.resolve({ surveyId: id })} />);
    })

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      userEvent.click(submitButton);

      expect(screen.getByText('Success')).toBeInTheDocument();
    }, { timeout: timeoutTime });
  }, timeoutTime);
});