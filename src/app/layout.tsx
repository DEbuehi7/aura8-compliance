import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aura8',
  description: 'Aura8 Compliance System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}