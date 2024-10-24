'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter()

  return (
    <>
      <h1>Survey App</h1>

      <button type="button" onClick={() => router.push('/account')}>
        skip
      </button>

      <Link href="/login">
        <button>Login</button>
      </Link>
      <Link href="/signup">
        <button>Sign up</button>
      </Link>

      <p>
        Conduct surveys using a continuous Likert scale
      </p>
    </>
  );
}
