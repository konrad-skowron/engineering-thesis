'use client';
import { Container, Paper, Title, Text } from '@mantine/core';

export default function ErrorPage() {
  return (
    <Container pt="xl" pb="xl">
      <Paper shadow="xs" p="md" withBorder>
        <Title order={2} c="red">An error occurred</Title>
        <Text mt='xs'>
          Please check your browser console for more details.<br />
          If the problem persists, report the error to <a href="mailto:dev.skowron@gmail.com">dev.skowron@gmail.com</a>.
        </Text>
      </Paper>
    </Container>
  );
}
