import { Container, Text, Button, Group, ThemeIcon, SimpleGrid, rem } from '@mantine/core';
import { IconBrandOpenSource, IconShieldCheck, IconAdCircleOff } from '@tabler/icons-react';
import classes from './LandingPage.module.css';
import Link from 'next/link';

const features = [
  {
    icon: IconBrandOpenSource,
    title: 'Free and open source',
    description: 'No hidden costs or subscription fees. The source code is available on GitHub',
  },
  {
    icon: IconShieldCheck,
    title: 'Privacy-focused',
    description: 'No intrusive tracking or analytics-prioritizing user privacy and providing fluent survey experience',
  },
  {
    icon: IconAdCircleOff,
    title: 'No annoying ads',
    description:
      'Enjoy a clean, distraction-free experience with absolutely no advertisements',
  }
];

export function LandingPage() {

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
          Conduct surveys using a{' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            continuous
          </Text>
          {' '}Likert scale
        </h1>

        <Text className={classes.description} c="placeholder">
          Build fully functional and accessible web surveys with ease. 
          The service includes all of the needed tools for conducting surveys 
          using a continuous as well as a discrete Likert scale.
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
              Get started
            </Button>
          </Link>
        </Group>
      </Container>
    </div>
  );
}