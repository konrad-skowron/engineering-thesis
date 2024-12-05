import { render, screen } from '../../../test-utils';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Account from '../../../src/app/(main)/account/page';
import { act } from 'react';
import { fetchUserSurveys, fetchAllSurveyParticipants } from '@/lib/firestore';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: '12345',
      email: 'testuser@example.com',
      displayName: 'Test User',
    },
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({
      uid: '12345',
      email: 'testuser@example.com',
      displayName: 'Test User',
    });
  }),
}));

jest.mock('../../../src/components/AuthProvider.tsx', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/lib/firestore.ts', () => ({
  fetchUserSurveys: jest.fn(),
  fetchAllSurveyParticipants: jest.fn(),
}));

describe('Account Page', () => {
  it('renders dashboard if user is logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        uid: '12345',
        email: 'testuser@example.com',
        displayName: 'Test User',
      },
      loading: false,
      signingOut: false,
      logIn: jest.fn(),
      signUp: jest.fn(),
      logInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      resetPassword: jest.fn(),
    });
    (fetchUserSurveys as jest.Mock).mockResolvedValue([]);
    (fetchAllSurveyParticipants as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(<Account />);
    })

    const heading = screen.getByText('Dashboard');

    expect(heading).toBeInTheDocument();
  });

  it('redirects to the login page if user is not logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signingOut: false,
      logIn: jest.fn(),
      signUp: jest.fn(),
      logInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
      resetPassword: jest.fn(),
    });
    (fetchUserSurveys as jest.Mock).mockResolvedValue([]);
    (fetchAllSurveyParticipants as jest.Mock).mockResolvedValue({});
  
    const replace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace });
  
    await act(async () => {
      render(<Account />);
    });
  
    expect(replace).toHaveBeenCalledWith('/login');
  });  
});
