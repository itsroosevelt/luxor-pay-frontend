'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeroBackground } from '@/components/HeroBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full flex items-center justify-between px-8 py-6 z-50 backdrop-blur-md border-b border-white/5">
        <div className="text-xl font-bold tracking-tight">
          Luxor <span className="text-primary">Pay</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#developers" className="hover:text-white transition-colors">Developers</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-5 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
              Login
            </button>
          </Link>
          <Link href="/login?register=true">
            <button className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative isolate pt-40 pb-32 flex flex-col items-center justify-center text-center px-4 min-h-screen overflow-hidden bg-black">
          <HeroBackground />

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-[min(800px,100vw)] w-[min(800px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] mix-blend-screen" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
              The Next-Generation <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Solana Payment Gateway
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Accept Solana payments instantly. Create customizable payment links, manage transactions, and integrate hardware POS terminals from a single unified dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?register=true">
                <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-white text-black rounded-full hover:scale-105 transition-transform">
                  Start Accepting Payments
                </button>
              </Link>
              <Link href="#features">
                <button className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                  Explore Features
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Highlights */}
        <section className="relative py-24 bg-black px-4" id="features">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full text-left"
          >
            {[
              { title: "Instant Settlements", desc: "No more waiting for days. Receive funds instantly in your wallet with Solana's blazing speed." },
              { title: "Hardware Ready", desc: "Connect our POS terminals out-of-the-box. Support for QR displays and NFC crypto cards." },
              { title: "Zero Setup Fees", desc: "Start generating links instantly. Only pay network fees and minimal processing fees." }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors border border-white/5">
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
