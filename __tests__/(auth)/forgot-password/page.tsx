import React from 'react';
import { render, screen } from '../../../test-utils';
import ForgotPassword from '../../../src/app/(auth)/forgot-password/page';

describe('ForgotPassword', () => {
  it('renders a submit button', () => {
    render(<ForgotPassword />);

    const submitButton = screen.getByText('Reset password');

    expect(submitButton).toBeInTheDocument();
  });
});