'use client'
import Link from "next/link";
import { Group, Button, Container, Title, Text } from '@mantine/core';

export default function Home() {
  return (
    <Container>
      <Title order={1}>Survey App</Title>

      <Group mt="md">
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Button>Sign in</Button>
        </Link>
      </Group>

      <p>
        Conduct surveys using a continuous Likert scale
      </p>
    </Container>
  );
}