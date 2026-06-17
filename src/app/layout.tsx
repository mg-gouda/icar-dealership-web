import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iCar Dealership — Find Your Next Car',
  description: 'Browse our wide selection of new and used vehicles.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="ltr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
