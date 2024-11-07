'use client'
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from '@/components/AuthProvider';

export default function SignUp() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/account');
    }
  }, [user, router]);

  return (
    <AuthForm type={'sign up'} />
  );
}