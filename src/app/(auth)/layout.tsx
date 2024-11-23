import { Center } from '@mantine/core';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Center>
      {children}
    </Center>
  )
}