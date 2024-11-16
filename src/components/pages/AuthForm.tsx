'use client'
import { upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Container,
  Title
} from '@mantine/core';
import { GoogleButton } from '@/components/GoogleButton';
import { useAuth } from '@/components/auth/AuthProvider';
import classes from './AuthForm.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthenticationFormProps extends PaperProps {
  type: 'log in' | 'sign up';
}

export function AuthForm({ type, ...props }: AuthenticationFormProps) {
  const { user, logInWithGoogle, logIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/account');
    }
  }, [user, router]);

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleLogin = async () => {
    if (type === 'log in') {
      await logIn(form.values.email, form.values.password);
    } else {
      await signUp(form.values.email, form.values.password);
    }
    router.replace('/account');
  };

  const handleGoogleSignIn = async () => {
    await logInWithGoogle();
    router.replace('/account');
  };

  return (
    <Container size={480} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome to Survey Maker
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {type === 'log in'
          ? "Don't have an account yet? "
          : 'Already have an account? '}
        <Anchor size="sm" component="button" onClick={() => type === 'log in' ? router.replace('/register') : router.replace('/login')}>
          {type === 'log in'
            ? 'Sign up'
            : 'Log in'}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(() => { })}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="example@domain.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            {type === 'log in' && (
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            )}
          </Group>

          <Group justify="space-between" mb="lg" mt="xl">
            <Button type="submit" radius="xl" fullWidth onClick={() => handleLogin()}>
              {upperFirst(type)}
            </Button>
          </Group>

          <Divider label="Or continue with" labelPosition="center" my="lg" />

          <Group grow mb="sm" mt="lg">
            <a onClick={handleGoogleSignIn}>
              <GoogleButton radius="xl" style={{ width: '100%' }}>Google</GoogleButton>
            </a>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}