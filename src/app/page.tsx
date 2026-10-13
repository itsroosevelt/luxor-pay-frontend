'use client';

import { ChevronDown, Globe, Menu, X, Users, Cpu, Compass, ExternalLink } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HeroBackground } from '@/features/home/components/HeroBackground';
import { InnovationSection } from '@/features/home/components/InnovationSection';
import { PhilosophySection } from '@/features/home/components/PhilosophySection';
import { ArchitectureSection } from '@/features/home/components/ArchitectureSection';
import BracketsSectionClient from '@/features/home/components/BracketsSectionClient';
import { JoinSection } from '@/features/home/components/JoinSection';
import { ShowcaseSection } from '@/features/home/components/ShowcaseSection';
import { PillarsSection } from '@/features/home/components/PillarsSection';
import { CTASection } from '@/features/home/components/CTASection';
import { ReviewsSection } from '@/features/home/components/ReviewsSection';
import Footer from '@/features/home/components/Footer';

interface EcosystemItem {
  title: string;
  desc?: string;
  image?: string;
  icon?: 'users' | 'cpu' | 'compass' | 'github';
  href: string;
  external?: boolean;
}

const ECOSYSTEM_ITEMS: EcosystemItem[] = [
  {
    title: 'LUXOR UTILITY ASSET | $LXR',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Flxr_logo.png?alt=media&token=6c98c336-e417-4b75-8d5c-729233c5097b',
    href: 'https://luxorstandard.com/',
    external: true,
  },
  {
    title: 'EXCELSIOR REAL WORLD ASSET | $XLS',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-27%20at%209.35.45%20AM.jpeg?alt=media&token=b09d84e7-061b-45e6-972b-f02d3cbb19dc',
    href: 'https://excelsiorstandard.com/',
    external: true,
  },
  {
    title: 'STABLECOIN | $USDX',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-09%20at%209.44.56%20AM.jpeg?alt=media&token=531b81b9-652c-4aa0-8652-c2de6c531e6e',
    href: 'https://occidentstandard.com/',
    external: true,
  },
  {
    title: 'ROOSEVELT SUPER INTELLIGENCE',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Frai-logo.jpg?alt=media&token=a091e66f-596e-451b-bd46-b3672d352d9e',
    href: 'https://itsroosevelt.com/',
    external: true,
  },
  {
    title: 'ROYALTY | DIGITAL FINANCIAL INSTITUTION',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-08-23%20at%207.04.34%20AM.jpeg?alt=media&token=e577ab9e-4bde-465f-9d0c-b3f7ae93961c',
    href: 'https://itsroyalty.us/',
    external: true,
  },
  {
    title: 'STERLING | MULTISIG - TOKEN LAUNCHER - PAYMENT GATEWAY',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-09%20at%209.44.55%20AM%20(1).jpeg?alt=media&token=88e66557-972f-4081-8583-fd1f772d83b9',
    href: 'https://itssterling.com/',
    external: true,
  },
  {
    title: 'THE NEW GRAN COLOMBIA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(2).png?alt=media&token=ca8a774d-be5d-4e3c-911a-7301f04a661d',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'POR MI | ECUADOR',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(5).png?alt=media&token=8552834b-7d13-4e8c-a2bc-74742055e2c1',
    href: 'https://chat.whatsapp.com/IlBVqL8K5XW76JXS23pGgt',
    external: true,
  },
  {
    title: 'POR MI | COLOMBIA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(6).png?alt=media&token=d045b215-0ab1-4772-8110-6ad5e697d769',
    href: 'https://chat.whatsapp.com/DBqxD9iAT0S2xPZAMixrmk',
    external: true,
  },
  {
    title: 'POR MI | VENEZUELA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(7).png?alt=media&token=792a5408-6a1c-44d9-8cab-1cd15646a299',
    href: 'https://chat.whatsapp.com/DBqxD9iAT0S2xPZAMixrmk',
    external: true,
  },
  {
    title: 'POR MI | PANAMA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(4).png?alt=media&token=1eb162ea-12e5-4e62-bc16-938a8f14738c',
    href: 'https://www.itspormi.com/',
    external: true,
  },
  {
    title: 'UDREAMMS | YOUR DREAM IN AMERICA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-13%20at%2010.02.08%20AM.jpeg?alt=media&token=4dc67b27-5ba1-4293-acd7-2d2895c4538f',
    href: 'https://udreamms.com/',
    external: true,
  },
  {
    title: 'POR MI | THE NEW TECHNOLOGICAL REPUBLIC',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fpor-mi-america.png?alt=media&token=9a28c490-8674-4434-8dc1-67c0a9ce60db',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'POR MI | UNITED STATES',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FGemini_Generated_Image_m0uwrzm0uwrzm0uw.jpg?alt=media&token=5174b9f6-335f-49dd-8995-d82e6169e599',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'Our Partners',
    desc: 'Companies backing Luxor',
    icon: 'users',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Real Use Cases',
    desc: 'Real-world utility',
    icon: 'cpu',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Adoption Map',
    desc: 'Global project presence',
    icon: 'compass',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Github',
    desc: 'Open source code.',
    icon: 'github',
    href: 'https://github.com/admluxorsys',
    external: true,
  },
];

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
  { name: 'Documentation & API', desc: 'Full API Reference and developer integration guides.', href: '/dashboard/developers/programs' },
  { name: 'Smart Programs & SDKs', desc: 'Prebuilt modules and Solana on-chain programs.', href: '/dashboard/developers/programs' },
  { name: 'Transaction Builder (Tx Builder)', desc: 'Sandbox environment for risk-free simulation.', href: '/dashboard/developers/tx-builder' },
  { name: 'Token Manager (SPL)', desc: 'Configure accepted payment assets and token mints.', href: '/dashboard/developers/token-manager' }
];

const RESOURCES = [
  { name: 'Blog', desc: 'Insights on Web3 commerce and platform updates.' },
  { name: 'Help Center', desc: '24/7 customer support and docs.' },
  { name: 'Governance / DAO', desc: 'Active proposal voting and tokenomics.' }
];

export default function LandingPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileEcosystemOpen, setMobileEcosystemOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 transition-colors duration-200 ${
          activeDropdown || mobileMenuOpen ? 'bg-black/95' : 'bg-transparent'
        }`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-between px-8 py-3">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-normal tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b" alt="Logo" className="h-10 w-10 object-contain" />
              <span>Sterling</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 text-sm font-normal text-gray-400 items-center">
              {/* Products Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('products')}
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

              {/* Ecosystem Dropdown Trigger */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('ecosystem')}
              >
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'ecosystem' ? null : 'ecosystem')}
                  className={`flex items-center gap-1 py-2 transition-colors ${activeDropdown === 'ecosystem' ? 'text-white' : 'hover:text-white'}`}
                >
                  Ecosystem <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'ecosystem' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('solutions')}
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
                onMouseEnter={() => handleMouseEnter('developers')}
              >
                <button className="flex items-center gap-1 hover:text-white py-2 transition-colors">
                  Developers <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'developers' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'developers' && (
                  <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid gap-4">
                      {DEVELOPERS.map((d, idx) => (
                        <Link href={d.href} key={idx} className="group block rounded-lg p-2 hover:bg-white/5 transition-colors">
                          <div className="text-sm font-medium text-white group-hover:text-primary transition-colors">{d.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <Link href="/dashboard/developers/programs" className="hover:text-white transition-colors py-2">
                Pricing
              </Link>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('resources')}
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
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors p-2 flex items-center justify-center">
                <Globe size={18} />
              </button>
              
              <Link href="/login">
                <button className="px-9 py-1 text-sm font-normal text-white bg-transparent border border-white/20 rounded-full hover:bg-white/5 transition-colors font-sans">
                  Sign In
                </button>
              </Link>
              
              <Link href="/login?register=true">
                <button className="px-9 py-1 text-sm font-normal bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full transition-colors shadow-lg shadow-blue-500/20 font-sans">
                  Sign Up
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden text-gray-400 hover:text-white transition-colors p-2 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Ecosystem Mega Menu Dropdown */}
        <AnimatePresence>
          {activeDropdown === 'ecosystem' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="hidden md:block absolute top-full left-0 w-full bg-black/95 border-b border-white/10 shadow-2xl backdrop-blur-2xl max-h-[calc(100vh-64px)] overflow-y-auto"
              onMouseEnter={() => handleMouseEnter('ecosystem')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8">
                {/* Left Column: Info & CTA */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0 pr-0 lg:pr-8 lg:border-r border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-white tracking-tight mb-2 font-sans">
                      Luxor Ecosystem
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-body">
                      Explore how Luxor is transforming real-world liquidity through advanced blockchain technology.
                    </p>
                  </div>
                  <div className="mt-8 pt-2">
                    <a
                      href="https://luxorstandard.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors group"
                    >
                      <span>VIEW MORE DETAILS</span>
                      <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>

                {/* Right Column: 3 Columns Grid (18 Items) */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5">
                  {ECOSYSTEM_ITEMS.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/10 group"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-11 h-11 rounded-xl object-contain shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 flex items-center justify-center shrink-0 text-sky-400 group-hover:text-sky-300 transition-colors">
                          {item.icon === 'users' && <Users size={26} strokeWidth={1.8} />}
                          {item.icon === 'cpu' && <Cpu size={26} strokeWidth={1.8} />}
                          {item.icon === 'compass' && <Compass size={26} strokeWidth={1.8} />}
                          {item.icon === 'github' && (
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-white/90 leading-tight uppercase tracking-wider group-hover:text-white transition-colors">
                          {item.title}
                        </div>
                        {item.desc && (
                          <div className="text-[11px] text-gray-400 mt-0.5 leading-tight font-body">
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] bg-black/95 border-b border-white/10 backdrop-blur-xl z-40 md:hidden p-6 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 text-base font-normal text-gray-300">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Products</Link>
              
              {/* Ecosystem Mobile Accordion */}
              <div className="border-b border-white/5">
                <button 
                  onClick={() => setMobileEcosystemOpen(!mobileEcosystemOpen)}
                  className="flex items-center justify-between w-full hover:text-white transition-colors py-2"
                >
                  <span>Ecosystem</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${mobileEcosystemOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileEcosystemOpen && (
                  <div className="grid grid-cols-1 gap-2 pt-2 pb-3 pl-2 max-h-72 overflow-y-auto">
                    {ECOSYSTEM_ITEMS.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 text-xs text-gray-300 hover:text-white"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-6 h-6 rounded-md object-contain shrink-0" />
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center text-sky-400 shrink-0">
                            {item.icon === 'users' && <Users size={16} />}
                            {item.icon === 'cpu' && <Cpu size={16} />}
                            {item.icon === 'compass' && <Compass size={16} />}
                            {item.icon === 'github' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                              </svg>
                            )}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Solutions</Link>
              <Link href="/dashboard/developers/programs" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Developers</Link>
              <Link href="/dashboard/developers/programs" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5">Pricing</Link>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <button className="w-full py-2.5 text-sm font-normal text-white bg-transparent border border-white/20 rounded-full hover:bg-white/5 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/login?register=true" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <button className="w-full py-2.5 text-sm font-normal bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full transition-colors shadow-lg shadow-blue-500/20">
                  Sign Up
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative isolate pt-28 pb-8 px-6 md:pt-36 md:pb-16 md:px-12 lg:pt-40 lg:pb-[2cm] lg:px-[2cm] flex flex-col justify-end min-h-screen overflow-hidden bg-black text-center lg:text-left">
          <HeroBackground />

          <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-[min(800px,100vw)] w-[min(800px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] mix-blend-screen" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-8 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400 block font-sans">
                Accept global payments in minutes, not days
              </span>
              <h1 className="text-3xl md:text-[48px] font-normal tracking-tight text-white leading-[1.2] font-sans">
                Welcome to the payment platform <br className="hidden md:inline" />
                connecting the real world <br className="hidden md:inline" />
                with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] font-medium">on-chain technology</span>
              </h1>
              <p className="text-base md:text-[16px] font-light text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
                A unified global platform that allows you to receive payments anywhere in the world with advanced security, optimized conversion, and integration in minutes for any type of personal, business, web, or custom payment.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex lg:justify-end justify-center lg:mb-[1cm] mb-4">
              <Link href="/login?register=true">
                <button 
                  className="px-8 py-2.5 text-base font-normal bg-transparent text-white border border-white/30 rounded-full hover:scale-105 hover:bg-white/5 transition-all shadow-lg font-sans"
                >
                  Start Accepting Payments
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
        {/* Basic highlights removed, replaced with new dynamic sections */}
        <InnovationSection />
        <PhilosophySection />
        <div id="developers" className="scroll-mt-24" />
        <ArchitectureSection />
        <BracketsSectionClient />
        <JoinSection />
        <ShowcaseSection />
        <PillarsSection />
        <CTASection />
        <ReviewsSection />
      </main>
      
      <Footer />
    </div>
  );
}

