'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Group, Button } from '@mantine/core';


export default function Home() {
  const router = useRouter()

  return (
    <>
      <h1>Survey App</h1>

      <Group>
        <Button type="button" onClick={() => router.push('/account')}>
          SKIP
        </Button>

        <Link href="/login">
          <Button>Login</Button>
        </Link>

        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </Group>

      <p>
        Conduct surveys using a continuous Likert scale
      </p>
    </>
  );
}
