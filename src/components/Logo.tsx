import Image from 'next/image';
import { Group, Title } from '@mantine/core';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Group>
        <Image src="/favicon.ico" alt="logo" width={36} height={36} />
        <Title order={4}>Survey Maker</Title>
      </Group>
    </Link>
  );
}
