import { Center } from '@mantine/core';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Center style={{ height: '100vh' }}>
      {children}
    </Center>
  )
}