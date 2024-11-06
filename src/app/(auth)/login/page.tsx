'use client'
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { AuthenticationForm } from "@/components/AuthenticationForm";
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/account');
    }
  }, [user, router]);

  return (
    <AuthenticationForm type={'log in'} />
  );
}
