'use client'
import Link from "next/link";
import { Group, Button, Container, Title, Text } from '@mantine/core';

export default function Home() {
  return (
    <Container>
      <Title order={1}>Survey App</Title>

      <Group mt="md">
        <Link href="/account" style={{ textDecoration: 'none' }}>
          <Button>SKIP</Button>
        </Link>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Button>Log in</Button>
        </Link>

        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <Button>Sign up</Button>
        </Link>
      </Group>

      <p>
        Conduct surveys using a continuous Likert scale
      </p>
    </Container>
  );
}