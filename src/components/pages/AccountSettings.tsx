'use client'
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Container, Button, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import RouteProtector from '@/components/auth/RouteProtector';
import { deleteAllUserData } from '@/lib/firestore';

export default function AccountSettings() {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account?') && user) {
      deleteAllUserData(user);
      deleteAccount();
      router.push("/");
      alert("Account successfully deleted");
    }
  };

  return (
    <RouteProtector>
      <Container pt="xl" pb="xl">
        <div>
          <Title order={2}>Settings</Title>
          <Button variant="light" color="red" mt="lg" leftSection={<IconTrash size={16} />} onClick={handleDeleteAccount}>Delete account</Button>
        </div>
      </Container>
    </RouteProtector>
  );
}