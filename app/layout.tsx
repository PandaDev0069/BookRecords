import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book Records - Track Your Reading Journey',
  description:
    'A personal book tracking app for college students to manage their reading, library deadlines, and daily page goals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
