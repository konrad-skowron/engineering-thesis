'use client'

import Link from 'next/link'
import { Title, Text, Button, Container, Group, Center } from '@mantine/core';
import classes from './NotFound.module.css';
import { useTranslations } from 'next-intl';
 
export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <Center style={{ height: '100vh' }}>    
      <Container className={classes.root}>
        <div className={classes.label}>404</div>
        <Title className={classes.title}>{t('title')}</Title>
        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          {t('description')}
        </Text>
        <Group justify="center">
        <Link href="/">
          <Button variant="subtle" size="md">
            {t('backHome')}
          </Button>
        </Link>
        </Group>
      </Container>
    </Center>
  )
}