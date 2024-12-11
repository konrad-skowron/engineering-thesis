import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { AuthProvider } from '@/components/AuthProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Survey Maker",
    template: "%s - Survey Maker"
  },
  description: "Conduct surveys using a continuous Likert scale",
  verification: {
    google: 'Kq-ysbVqYzZ1cvvNVCfZVOs_3Fx1MJqgaN1_djAAXdg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <AuthProvider>
            {children}
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
