import { Container, Text, Button, Group } from '@mantine/core';
import classes from './LandingPage.module.css';
import Link from 'next/link';

export function LandingPage() {
  return (
    <div className={classes.wrapper}>
      <Container className={classes.inner}>
        <h1 className={classes.title}>
          Conduct surveys using <br/>a{' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            continuous
          </Text>
          {' '}Likert scale
        </h1>

        <Text className={classes.description} c="dimmed">
          Build fully functional accessible web applications with ease – Mantine includes more than
          100 customizable components and hooks to cover you in any situation
        </Text>

        <Group className={classes.controls}>
          <Link href="/account" style={{ textDecoration: 'none' }}>      
            <Button
              size="xl"
              className={classes.control}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Get started
            </Button>
          </Link>
        </Group>
      </Container>
    </div>
  );
}