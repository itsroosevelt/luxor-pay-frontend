import type { Metadata, Viewport } from "next";
import { Montserrat, Outfit } from "next/font/google";
import dynamic from "next/dynamic";
import { Fragment } from "react";
import "./globals.css";
import StyledComponentsRegistry from '@/lib/registry';
import { AppProviders } from '@/components/AppProviders';
import { IS_MOCK_MODE } from '@/lib/mock/mock-config';

/**
 * Mock Mode wrapper — only pulled into the bundle when
 * `NEXT_PUBLIC_USE_MOCK_DATA=true`. In a normal build this is a no-op Fragment
 * and none of `src/mocks` / `src/lib/mock` is imported.
 */
const MockModeProvider = IS_MOCK_MODE
  ? dynamic(() => import('@/context/MockModeProvider').then((m) => m.MockModeProvider))
  : Fragment;

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sterling | Solana Network",
  description: "Sterling: Payment Gateway on Solana Network",
  icons: {
    icon: "/brand/sterling-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Sterling",
              "url": "https://sterlingpay.app/",
              "description": "Sterling: Payment Gateway on Solana Network",
              "publisher": {
                "@type": "Organization",
                "name": "Sterling",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
                }
              },
              "hasPart": [
                {
                  "@type": "WebPage",
                  "name": "Sign In & Sign Up",
                  "url": "https://sterlingpay.app/login",
                  "description": "Access your Sterling dashboard, connect your Solana wallet, and manage transactions."
                },
                {
                  "@type": "WebPage",
                  "name": "Tecnologías sociales",
                  "url": "https://sterlingpay.app/#features",
                  "description": "Explora todos nuestros productos · Anuncios y monetización"
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${montserrat.variable} ${outfit.variable} ${outfit.className} font-sans antialiased`}
      >
        <StyledComponentsRegistry>
          <MockModeProvider>
            <AppProviders>
              {children}
            </AppProviders>
          </MockModeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
