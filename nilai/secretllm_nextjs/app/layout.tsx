import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecretLLM Chat',
  description: 'Private LLM inference chat UI for the Blind Computer demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
