'use client'
import React from "react";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Center } from '@mantine/core';
import { AuthenticationForm } from "@/components/AuthenticationForm";
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/account');
    }
  }, [user, router]);

  return (
    <>
      { !loading && !user ? (
        <Center>
          <AuthenticationForm w={420} type={'sign in'} />
        </Center>
      ) : <div>Loading...</div> }
    </>
  );
}
