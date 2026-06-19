import type { Metadata } from 'next';
import { Geist_Mono, Montserrat, Outfit } from 'next/font/google';
import './globals.css';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import { GlobalStyle } from '@/styles/GlobalStyle';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Luxor Pay | Solana Payment Gateway',
  description: 'Next-gen payment gateway for the Solana ecosystem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry>
          <GlobalStyle />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
