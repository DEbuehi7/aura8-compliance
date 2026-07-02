import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aura8 Compliance',
  description: 'CCBill compliance review dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

