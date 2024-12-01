import React from 'react';
import { render, screen } from '../../../test-utils';
import Register from '../../../src/app/(auth)/register/page';

describe('Register', () => {
  it('renders a registration form', () => {
    render(<Register />);

    const form = screen.getByText('Already have an account?');

    expect(form).toBeInTheDocument();
  });
});