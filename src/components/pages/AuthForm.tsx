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
  Title,
} from '@mantine/core';
import { GoogleButton } from '@/components/GoogleButton';
import { useAuth } from '@/components/AuthProvider';
import classes from './AuthForm.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AuthenticationFormProps extends PaperProps {
  type: 'log in' | 'sign up';
}

export function AuthForm({ type }: AuthenticationFormProps) {
  const { user, logInWithGoogle, logIn, signUp } = useAuth();
  const router = useRouter();
  const t = useTranslations();

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
      rememberMe: false,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.invalidEmail')),
      password: (val) => (val.length < 6 ? t('auth.passwordMinLength') : null),
    },
  });

  const handleLogin = async () => {
    if (!form.isValid()) {
      return;
    }
    if (type === 'log in') {
      await logIn(form.values.email, form.values.password, form.values.rememberMe);
    } else {
      await signUp(form.values.email, form.values.password, form.values.rememberMe);
    }
  };

  const handleGoogleSignIn = async () => {
    await logInWithGoogle();
  };

  const handleForgotPassword = (e: any) => {
    e.preventDefault();
    router.push('/forgot-password');
  };

  return (
    <div className={classes.wrapper}>
      <Container size={480} my={40}>
        <Title ta="center" className={classes.title}>
          {t('auth.welcomeTitle')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {type === 'log in'
            ? t('auth.noAccount') + ' '
            : t('auth.hasAccount') + ' '}
          <Anchor size="sm" component="button" onClick={() => type === 'log in' ? router.replace('/register') : router.replace('/login')}>
            {type === 'log in'
              ? t('common.signUp')
              : t('common.logIn')}
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(() => { })}>
            <Stack>
              {/* {type === 'sign up' && (
              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                radius="md"
              />
            )} */}

              <TextInput
                required
                label={t('common.email')}
                placeholder={t('auth.emailPlaceholder')}
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email && t('auth.invalidEmail')}
                radius="md"
              />

              <PasswordInput
                required
                label={t('common.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={form.values.password}
                onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                error={form.errors.password && t('auth.passwordMinLength')}
                radius="md"
              />

              {/* {type === 'sign up' && (
              <Checkbox
                mt="xs"
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              />
            )} */}
            </Stack>

            <Group justify="space-between" mt="lg">
              <Checkbox
                checked={form.values.rememberMe}
                onChange={(event) => form.setFieldValue('rememberMe', event.currentTarget.checked)}
                label={t('auth.rememberMe')} />
              {type === 'log in' && (
                <Anchor component="button" size="sm" onClick={(e: any) => handleForgotPassword(e)}>
                  {t('auth.forgotPassword')}
                </Anchor>
              )}
            </Group>

            <Group justify="space-between" mb="lg" mt="xl">
              <Button type="submit" radius="xl" fullWidth onClick={() => handleLogin()}>
                {type === 'log in' ? t('common.logIn') : t('common.signUp')}
              </Button>
            </Group>

            <Divider label={t('auth.orContinueWith')} labelPosition="center" my="lg" />

            <Group grow mb="sm" mt="lg">
              <a onClick={handleGoogleSignIn}>
                <GoogleButton radius="xl" style={{ width: '100%' }}>{t('auth.google')}</GoogleButton>
              </a>
            </Group>
          </form>
        </Paper>
      </Container>
    </div>
  );
}