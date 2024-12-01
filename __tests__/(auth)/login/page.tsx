import React from 'react';
import { render, screen } from '../../../test-utils';
import Login from '../../../src/app/(auth)/login/page';

describe('Login', () => {
  it('renders a login form', () => {
    render(<Login />);

    const form = screen.getByText('Don\'t have an account yet?');

    expect(form).toBeInTheDocument();
  });
});