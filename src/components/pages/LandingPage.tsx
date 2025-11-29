'use client';

import { Container, Text, Button, Group, ThemeIcon, SimpleGrid, rem } from '@mantine/core';
import { IconBrandOpenSource, IconShieldCheck, IconAdCircleOff } from '@tabler/icons-react';
import classes from './LandingPage.module.css';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function LandingPage() {
  const t = useTranslations('landing');

  const features = [
    {
      icon: IconBrandOpenSource,
      title: t('features.openSource.title'),
      description: t('features.openSource.description'),
    },
    {
      icon: IconShieldCheck,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
    },
    {
      icon: IconAdCircleOff,
      title: t('features.noAds.title'),
      description: t('features.noAds.description'),
    }
  ];

  const items = features.map((feature) => (
    <div key={feature.title} className={classes.icon}>
      <ThemeIcon
        size={50}
        radius="md"
        variant="gradient"
        gradient={{ deg: 133, from: 'blue', to: 'cyan' }}
        mr="md"
        mb="sm"
      >
        <feature.icon style={{ width: rem(26), height: rem(26) }} stroke={1.5} />
      </ThemeIcon>
      <div>
        <Text fz="md" fw={500} className={classes.smallTitle}>
          {feature.title}
        </Text>
        <Text c="dimmed" fz="sm">
          {feature.description}
        </Text>
      </div>
    </div>
  ));

  return (
    <div className={classes.wrapper}>
      <Container className={classes.inner} id='about'>
        <h1 className={classes.title}>
          {t('title')}{' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            {t('titleHighlight')}
          </Text>
          {' '}{t('titleEnd')}
        </h1>

        <Text className={classes.description} c="placeholder">
          {t('description')}
        </Text>

        <SimpleGrid cols={3} spacing="xl" mt="xl" visibleFrom='sm'>
          {items}
        </SimpleGrid>
        <SimpleGrid cols={1} spacing="xl" mt="xl" hiddenFrom='sm'>
          {items}
        </SimpleGrid>

        <Group className={classes.controls} mt="xl">
          <Link href="/account" style={{ textDecoration: 'none' }}>      
            <Button
              size="xl"
              className={classes.control}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              radius='md'
            >
              {t('getStarted')}
            </Button>
          </Link>
        </Group>
      </Container>
    </div>
  );
}