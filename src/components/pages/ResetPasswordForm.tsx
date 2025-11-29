'use client'
import { useForm } from '@mantine/form';
import {
  TextInput,
  Text,
  Paper,
  Group,
  Button,
  Stack,
  Container,
  Title
} from '@mantine/core';
import { useAuth } from '@/components/AuthProvider';
import classes from './AuthForm.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ResetPasswordForm() {
  const { user, resetPassword } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');

  useEffect(() => {
    if (user) {
      router.replace('/account');
    }
  }, [user, router]);

  const form = useForm({
    initialValues: {
      email: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('invalidEmail'))
    },
  });

  const handleForgotPassword = () => {
    if (!form.isValid()) {
      return;
    }
    resetPassword(form.values.email);
    alert(t('passwordResetSent'));
    router.replace('/login');
  };

  return (
    <Container size={480} my={40}>
      <Title ta="center" className={classes.title}>
        {t('forgotPasswordTitle')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('forgotPasswordSubtitle')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(() => { })}>
          <Stack>
            <TextInput
              label="Email"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && t('invalidEmail')}
              radius="md"
            />

            <Text size="sm" mt="xs">
              {t('forgotPasswordInstructions')}
            </Text>
          </Stack>

          <Group justify="space-between" mb="lg" mt="xl">
            <Button type="submit" radius="xl" fullWidth onClick={() => handleForgotPassword()}>
              {t('resetPassword')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}