import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SolanaProvider } from '@/web3/providers/SolanaProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luxor Pay",
  description: "Luxor Pay: Payment Gateway on Solana Network",
  icons: {
    icon: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b",
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Luxor Pay",
              "url": "https://luxorpay.app/",
              "description": "Luxor Pay: Payment Gateway on Solana Network",
              "publisher": {
                "@type": "Organization",
                "name": "Luxor Pay",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
                }
              },
              "hasPart": [
                {
                  "@type": "WebPage",
                  "name": "Sign In & Sign Up",
                  "url": "https://luxorpay.app/login",
                  "description": "Access your Luxor Pay dashboard, connect your Solana wallet, and manage transactions."
                },
                {
                  "@type": "WebPage",
                  "name": "Tecnologías sociales",
                  "url": "https://luxorpay.app/#features",
                  "description": "Explora todos nuestros productos · Anuncios y monetización"
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
