import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export const metadata = {
  title: "Survey App",
  description: "Conduct surveys using a continuous Likert scale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
      </body>
    </html>
  );
}