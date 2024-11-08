'use client'
import { Loading } from '@/components/Loading';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

export default function Settings() {
  const { user, loading, signingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading && !signingOut) {
      router.replace("/login");
    }
  }, [user, loading, signingOut, router]);

  if (!user) {
    return <Loading />;
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      
    }
  };

  return (
    <Container>
      <div>
        <h2>Settings</h2>
        <Button variant="light" color="red" leftSection={<IconTrash />} onClick={handleDeleteAccount}>Delete account</Button>
      </div>
    </Container>
  );
}