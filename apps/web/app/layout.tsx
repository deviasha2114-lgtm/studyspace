import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudySpace',
  description: 'Notes sharing + Study community platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
