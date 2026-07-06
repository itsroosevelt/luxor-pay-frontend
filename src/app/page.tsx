'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeroBackground } from '@/components/HeroBackground';

const PRODUCTS = [
  { name: 'Web Gateway (eCommerce)', desc: 'Integrate API, Shopify or WooCommerce checkout.' },
  { name: 'Point of Sale (POS)', desc: 'Smart physical POS terminals & mobile apps.' },
  { name: 'Recurring Payments', desc: 'Automated subscription and billing engines.' },
  { name: 'Ecosystem & Tokenization', desc: 'Hybrid Web3 payments & asset support.' }
];

const SOLUTIONS = [
  {
    title: 'By Size',
    items: ['Startups', 'SMBs', 'Enterprises']
  },
  {
    title: 'By Industry',
    items: ['Retail & Physical Stores', 'eCommerce & Digital', 'Marketplaces', 'Local Businesses']
  }
];

const DEVELOPERS = [
  { name: 'Documentation', desc: 'Full API Reference and developer guides.' },
  { name: 'SDKs & Plugins', desc: 'Prebuilt code modules and plugins.' },
  { name: 'Sandbox / Testnet', desc: 'Risk-free environment for Solana integration.' }
];

const RESOURCES = [
  { name: 'Blog', desc: 'Insights on Web3 commerce and platform updates.' },
  { name: 'Help Center', desc: '24/7 customer support and docs.' },
  { name: 'Governance / DAO', desc: 'Active proposal voting and tokenomics.' }
];

export default function LandingPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full flex items-center justify-between px-8 py-3 z-50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-xl font-normal tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
            <span>Luxor <span className="text-primary">Pay</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 text-sm font-normal text-gray-400 items-center">
            {/* Products Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white py-2 transition-colors">
                Products <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4">
                    {PRODUCTS.map((p, idx) => (
                      <Link href="#features" key={idx} className="group block rounded-lg p-2 hover:bg-white/5 transition-colors">
                        <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{p.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white py-2 transition-colors">
                Solutions <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-0 mt-1 w-96 rounded-2xl border border-white/10 bg-black/95 p-5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    {SOLUTIONS.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-xs font-normal text-gray-500 uppercase tracking-wider">{section.title}</div>
                        <div className="grid gap-1">
                          {section.items.map((item, i) => (
                            <Link href="#features" key={i} className="text-sm text-gray-300 hover:text-white transition-colors block py-1">
                              {item}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Developers Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('developers')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white py-2 transition-colors">
                Developers <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'developers' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'developers' && (
                <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4">
                    {DEVELOPERS.map((d, idx) => (
                      <Link href="#developers" key={idx} className="group block rounded-lg p-2 hover:bg-white/5 transition-colors">
                        <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{d.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link href="#pricing" className="hover:text-white transition-colors py-2">
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-white py-2 transition-colors">
                Resources <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full right-0 mt-1 w-80 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4">
                    {RESOURCES.map((r, idx) => (
                      <Link href="#features" key={idx} className="group block rounded-lg p-2 hover:bg-white/5 transition-colors">
                        <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{r.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors p-2 flex items-center justify-center">
            <Globe size={18} />
          </button>
          
          <Link href="/login">
            <button className="px-9 py-1 text-sm font-normal text-white bg-transparent border border-white/20 rounded-full hover:bg-white/5 transition-colors">
              Sign In
            </button>
          </Link>
          
          <Link href="/login?register=true">
            <button className="px-9 py-1 text-sm font-normal bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full transition-colors shadow-lg shadow-blue-500/20">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative isolate pt-28 pb-8 px-6 md:pt-36 md:pb-16 md:px-12 lg:pt-40 lg:pb-[2cm] lg:px-[2cm] flex flex-col justify-end min-h-screen overflow-hidden bg-black text-left">
          <HeroBackground />

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-[min(800px,100vw)] w-[min(800px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] mix-blend-screen" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-8 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 block" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                Accept global payments in minutes, not days
              </span>
              <h1 className="text-3xl md:text-[48px] font-normal tracking-tight text-white leading-[1.2]">
                Welcome to the payment platform <br className="hidden md:inline" />
                connecting the real world <br className="hidden md:inline" />
                with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] font-medium">on-chain technology</span>
              </h1>
              <p className="text-base md:text-[16px] font-light text-white/80 leading-relaxed max-w-2xl">
                A unified global platform that allows you to receive payments anywhere in the world with advanced security, optimized conversion, and integration in minutes for any type of personal, business, web, or custom payment.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex lg:justify-end justify-start lg:mb-[1cm] mb-4">
              <Link href="/login?register=true">
                <button 
                  className="px-8 py-2.5 text-base font-normal bg-transparent text-white border border-white/30 rounded-full hover:scale-105 hover:bg-white/5 transition-all shadow-lg"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  Start Accepting Payments
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
