import React from 'react';
import { render, screen, act, waitFor } from '../../../../test-utils';
import SurveyResults from '../../../../src/app/(main)/[surveyId]/results/page';

describe('SurveyResults', () => {
  const timeoutTime = 10000;
  const id = 'HafDUdDSgZGWs4dZXGfR';

  it('renders a title with the survey title', async () => {
    const surveyTitle = 'Test survey';

    await act(async () => {
      render(<SurveyResults params={Promise.resolve({ surveyId: id })} />);
    })

    await waitFor(() => {
      const title = screen.getByText(surveyTitle);

      expect(title).toBeInTheDocument();
    }, { timeout: timeoutTime });
  }, timeoutTime);

  it('renders a list of questions with answers', async () => {
    await act(async () => {
      render(<SurveyResults params={Promise.resolve({ surveyId: id })} />);
    })

    await waitFor(() => {
      const question1 = screen.getByText('What is your name?');
      const answer1 = screen.getByText('Mike');
      const answer2 = screen.getByText('Emma');
      const answer3 = screen.getByText('Felix');

      expect(question1).toBeInTheDocument();
      expect(answer1).toBeInTheDocument();
      expect(answer2).toBeInTheDocument();
      expect(answer3).toBeInTheDocument();
    }, { timeout: timeoutTime });
  }, timeoutTime);
});