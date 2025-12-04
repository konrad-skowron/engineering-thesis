'use client'
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Container, Button, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import RouteProtector from '@/components/RouteProtector';
import { deleteAllUserData } from '@/lib/firebase/firestore';
import { useTranslations } from 'next-intl';

export default function AccountSettings() {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();
  const t = useTranslations('settings');

  const handleDeleteAccount = () => {
    if (confirm(t('deleteConfirm')) && user) {
      deleteAllUserData(user);
      deleteAccount();
      router.push("/");
      alert(t('accountDeleted'));
    }
  };

  return (
    <RouteProtector>
      <Container pt="xl" pb="xl">
        <div>
          <Title order={2}>{t('title')}</Title>
          <Button variant="light" color="red" mt="lg" leftSection={<IconTrash size={16} />} onClick={handleDeleteAccount}>{t('deleteAccount')}</Button>
        </div>
      </Container>
    </RouteProtector>
  );
}