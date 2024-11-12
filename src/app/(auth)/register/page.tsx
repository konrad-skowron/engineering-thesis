import { AuthForm } from "@/components/pages/AuthForm";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up for free account'
};

export default function SignUp() {
  return (
    <AuthForm type={'sign up'} />
  );
}