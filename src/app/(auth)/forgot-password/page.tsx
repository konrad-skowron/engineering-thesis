import ResetPasswordForm from "@/components/pages/ResetPasswordForm";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset password'
};

export default function ForgotPassword() {
  return (
    <ResetPasswordForm />
  );
}
