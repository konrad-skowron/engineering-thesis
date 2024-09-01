import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Survey App</h1>

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
