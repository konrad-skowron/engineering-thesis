import { AuthForm } from "@/components/pages/AuthForm";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in to your account'
};

export default function Login() {
  return (
    <AuthForm type={'log in'} />
  );
}
