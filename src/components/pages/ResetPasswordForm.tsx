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

export default function ResetPasswordForm() {
  const { user, resetPassword } = useAuth();
  const router = useRouter();

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
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email')
    },
  });

  const handleForgotPassword = () => {
    if (!form.isValid()) {
      return;
    }
    resetPassword(form.values.email);
    alert('Password reset instructions have been sent to your email.');
    router.replace('/login');
  };

  return (
    <Container size={480} my={40}>
      <Title ta="center" className={classes.title}>
        Forgot your password?
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        You can set a new one.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(() => { })}>
          <Stack>
            <TextInput
              label="Email"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            <Text size="sm" mt="xs">
              Please enter your email address to get instructions on how to set up a new password for your account.
            </Text>
          </Stack>

          <Group justify="space-between" mb="lg" mt="xl">
            <Button type="submit" radius="xl" fullWidth onClick={() => handleForgotPassword()}>
              Reset password
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}