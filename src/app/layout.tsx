import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import ByteWelcome from '@/components/ByteWelcome'
import { PanelCreateListener } from '@/components/PanelCreateListener'
import { Toaster } from '@/components/ui/sonner'
import NoCopy from './NoCopy'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Darkbyte - App',
    template: '%s | Darkbyte - App',
  },
  description: 'Darkbyte - App',
  applicationName: 'Darkbyte - App',
  generator: 'Darkbyte - App',
  openGraph: {
    siteName: 'Darkbyte - App',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NoCopy />
          {children}
          <ByteWelcome />
          <PanelCreateListener />
        </Providers>
        <Toaster richColors closeButton duration={1200} position="top-right" />
      </body>
    </html>
  );
}
