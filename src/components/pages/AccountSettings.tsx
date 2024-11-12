'use client'
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { Container, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import RouteProtector from '@/components/auth/RouteProtector';

export default function AccountSettings() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      router.push("/");
      signOut();
      alert("Account successfully deleted");
    }
  };

  return (
    <RouteProtector>
      <Container>
        <div>
          <h2>Settings</h2>
          <Button variant="light" color="red" leftSection={<IconTrash />} onClick={handleDeleteAccount}>Delete account</Button>
        </div>
      </Container>
    </RouteProtector>
  );
}