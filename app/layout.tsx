import React from 'react';
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: 'LandVerify',
  description: 'LandVerify - Secure your property investment with confidence.',
  metadataBase: new URL('https://landverify.com'),
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}
      <SpeedInsights /> 
      <Analytics />
      </body>
    </html>
  );
}