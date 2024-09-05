"use client";
import Link from "next/link";
import { useState } from "react";

export default function Account() {
  const [user, setUser] = useState("Anonymous");

  return (
    <>
      <p>Hello {user}</p>
      <Link href="/create">
        <button>+ Create survey</button>
      </Link>
    </>
  );
}
