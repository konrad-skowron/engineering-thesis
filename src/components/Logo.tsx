import Image from 'next/image';
import { Group } from '@mantine/core';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Group>
        <Image src="/favicon.ico" alt="logo" width={36} height={36} />
        <b>Survey Maker</b>
      </Group>
    </Link>
  );
}
