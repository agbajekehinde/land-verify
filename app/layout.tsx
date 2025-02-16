import '@/app/ui/global.css';
import { inter, lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandVerify',
  description: 'LandVerify - Secure your property investment with confidence.',
  metadataBase: new URL('https://landverify.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}