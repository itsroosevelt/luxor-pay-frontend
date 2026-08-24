'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Heart, ChevronDown } from 'lucide-react';
import { getSocialLinks } from '@/lib/social-links';
import { BlueParticles } from '@/components/shared/BlueParticles';

export default function Footer() {
    const socialLinks = getSocialLinks('Docs');

    // Track expanded state for columns with more than 10 links
    const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
        "Products": false,
        "Solutions": false,
        "Developers": false,
        "Resources": false
    });

    const toggleColumnExpand = (title: string) => {
        setExpandedColumns(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    type FooterLink = { name: string; href: string; target?: string; isHighlight?: boolean };

    interface FooterSection {
        title: string;
        links: FooterLink[];
        hasExpandLimit?: boolean;
    }

    const footerSections: FooterSection[] = [
        {
            title: "Products",
            hasExpandLimit: true,
            links: [
                { name: "Pricing", href: "#pricing" },
                { name: "Atlas", href: "#" },
                { name: "Authorization Boost", href: "#" },
                { name: "Billing", href: "#" },
                { name: "Capital", href: "#" },
                { name: "Capital for Platforms", href: "#" },
                { name: "Checkout", href: "#" },
                { name: "Climate", href: "#" },
                { name: "Connect", href: "#" },
                { name: "Crypto", href: "#" },
                { name: "Crypto Onramp", href: "#" },
                { name: "Data Pipeline", href: "#" },
                { name: "Elements", href: "#" },
                { name: "Financial Connections", href: "#" },
                { name: "Global Payouts", href: "#" },
                { name: "Identity", href: "#" },
                { name: "Invoicing", href: "#" },
                { name: "Issuing", href: "#" },
                { name: "Link", href: "#" },
                { name: "Managed Payments", href: "#" },
                { name: "Payment Links", href: "#" },
                { name: "Payment Methods", href: "#" },
                { name: "Payments Engine", href: "#" },
                { name: "Radar (Fraud protection)", href: "#" },
                { name: "Revenue Recognition", href: "#" },
                { name: "Luxor Pay Sigma Analytics", href: "#" },
                { name: "Subscriptions", href: "#" },
                { name: "Tax Automation", href: "#" },
                { name: "POS Terminal", href: "#" },
                { name: "Treasury", href: "#" },
                { name: "Treasury for Platforms", href: "#" },
                { name: "Usage-based Billing", href: "#" }
            ]
        },
        {
            title: "Solutions",
            hasExpandLimit: true,
            links: [
                { name: "Enterprises", href: "#" },
                { name: "Startups", href: "#" },
                { name: "Agentic Commerce (AI)", href: "#" },
                { name: "Crypto Platforms", href: "#" },
                { name: "Ecommerce", href: "#" },
                { name: "Embedded Finance", href: "#" },
                { name: "Finance Automation", href: "#" },
                { name: "Global Businesses", href: "#" },
                { name: "In-app Payments", href: "#" },
                { name: "Marketplaces", href: "#" },
                { name: "Platforms", href: "#" },
                { name: "SaaS", href: "#" },
                { name: "AI Companies", href: "#" },
                { name: "Creator Economy", href: "#" },
                { name: "Gaming", href: "#" },
                { name: "Hospitality, Travel & Leisure", href: "#" },
                { name: "Insurance", href: "#" },
                { name: "Media & Entertainment", href: "#" },
                { name: "Nonprofits", href: "#" },
                { name: "Public Sector", href: "#" },
                { name: "Retail", href: "#" }
            ]
        },
        {
            title: "Developers",
            hasExpandLimit: true,
            links: [
                { name: "Documentation", href: "#" },
                { name: "API Reference", href: "#" },
                { name: "API Status", href: "#" },
                { name: "API Changelog", href: "#" },
                { name: "Libraries & SDKs", href: "#" },
                { name: "Developer Blog", href: "#" },
                { name: "App Marketplace", href: "#" },
                { name: "Partner Ecosystem", href: "#" },
                { name: "Professional Services", href: "#" }
            ]
        },
        {
            title: "Resources",
            hasExpandLimit: true,
            links: [
                { name: "Product Roadmap", href: "#" },
                { name: "Guides", href: "#" },
                { name: "Customer Stories", href: "#" },
                { name: "Blog", href: "#" },
                { name: "Community Forum", href: "#" },
                { name: "Sessions Conference", href: "#" },
                { name: "Prohibited Businesses", href: "#" },
                { name: "Licenses", href: "#" },
                { name: "Sitemap", href: "#" },
                { name: "Cookie Settings", href: "#" },
                { name: "Your Privacy Choices", href: "#" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "Jobs / Careers", href: "#" },
                { name: "Newsroom", href: "#" },
                { name: "Luxor Pay Press Publications", href: "#" },
                { name: "Contact Sales", href: "mailto:services@byluxor.com" }
            ]
        },
        {
            title: "Support",
            links: [
                { name: "Get Support", href: "#" },
                { name: "Managed Support Plans", href: "#" },
                { name: "CA Support: +1 888 926 2289", href: "tel:+18889262289" },
                { name: "Sign In", href: "/login" }
            ]
        },
        {
            title: "Ecosystem",
            links: [
                { name: "POS", href: "#" },
                { name: "Luxor Pay", href: "/" },
                { name: "Royalty Wallet", href: "#" },
                { name: "Intelligent Glasses", href: "#" },
                { name: "LUXOR UTILITY ASSET | $LXR", href: "#" },
                { name: "USDX STABLECOIN ASSET | $USDX", href: "#" },
                { name: "ROOSEVELT | ARTIFICIAL INTELLIGENCE", href: "https://www.byroosevelt.com/", target: "_blank" },
                { name: "EXCELSIOR REAL WORLD ASSET | $XLS", href: "#" }
            ]
        },
        {
            title: "On-Chain",
            links: [
                { name: "Solscan Explorer", href: "https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
                { name: "DexScreener Chart", href: "https://dexscreener.com/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
                { name: "Raydium Pool", href: "https://raydium.io/swap/?inputMint=sol&outputMint=7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
                { name: "Squads Multisig (3/6)", href: "#" },
                { name: "Whitepaper", href: "https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md", target: "_blank" },
                { name: "Security Audit", href: "#" }
            ]
        }
    ];

    return (
        <footer className="bg-transparent text-white pt-24 pb-12 overflow-hidden border-t border-white/5 font-sans w-full relative">
            <BlueParticles variant="section" />
            <div className="w-full px-6 md:px-12 lg:px-20">

                {/* 1. Header Row - Follow Us & Newsletter */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 pb-16 border-b border-white/5">
                    {/* Left side: Socials */}
                    <div className="flex items-center gap-8 mb-2 lg:mb-0">
                        <span className="text-white/30 font-sans text-[10px] tracking-[0.2em] uppercase font-bold">FOLLOW US</span>
                        <div className="flex items-center gap-6">
                            {socialLinks.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/40 hover:text-white transition-all transform hover:scale-110"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right side: Newsletter Section */}
                    <div className="flex flex-col gap-5 w-full max-w-[440px]">
                        <div className="space-y-1">
                            <h3 className="text-white text-lg font-sans font-medium tracking-tight">Newsletter</h3>
                            <p className="text-white/40 text-xs leading-relaxed">Subscribe to receive the latest Luxor Pay ecosystem updates.</p>
                        </div>
                        <div className="flex gap-2 w-full">
                            <input
                                suppressHydrationWarning
                                type="email"
                                placeholder="Your email address"
                                className="bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-xs focus:outline-none focus:border-white/20 flex-grow transition-colors placeholder:text-white/20 text-white"
                            />
                            <button
                                suppressHydrationWarning
                                className="bg-white text-black rounded-full px-7 py-2.5 text-xs font-bold hover:bg-white/90 active:scale-95 transition-all shrink-0">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Main content area: Slogan (Left) + Grid (Right) */}
                <div className="flex flex-col lg:flex-row gap-x-12 gap-y-20 mb-32">
                    {/* Left Side: Slogan */}
                    <div className="lg:w-1/4">
                        <h2 className="text-2xl md:text-3xl font-sans font-medium tracking-tight leading-tight sticky top-24 text-white">
                            Making <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Luxor Pay</span> <br />
                            helpful for <br />
                            everyone
                        </h2>
                    </div>

                    {/* Right Side: Columns in a Grid */}
                    <div className="lg:w-3/4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-12">
                            {footerSections.map((section, idx) => {
                                const isExpanded = expandedColumns[section.title];
                                const maxVisibleLinks = section.hasExpandLimit && !isExpanded ? 10 : section.links.length;
                                const visibleLinks = section.links.slice(0, maxVisibleLinks);
                                const hasMore = section.hasExpandLimit && section.links.length > 10;

                                return (
                                    <div key={idx} className="flex flex-col gap-4 pb-6 lg:pb-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white text-base font-sans font-medium">{section.title}</h3>
                                            {hasMore && (
                                                <button
                                                    onClick={() => toggleColumnExpand(section.title)}
                                                    className="p-1 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
                                                    aria-label={isExpanded ? "Collapse section" : "Expand section"}
                                                >
                                                    <ChevronDown
                                                        size={14}
                                                        className={`text-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        <ul className="flex flex-col gap-3">
                                            {visibleLinks.map((link, lIdx) => (
                                                <li key={lIdx}>
                                                    <Link
                                                        href={link.href}
                                                        target={link.target}
                                                        className={`${link.isHighlight
                                                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-bold'
                                                            : 'text-white/60 hover:text-white'
                                                            } text-sm font-sans transition-colors flex items-center gap-2 group decoration-transparent`}
                                                    >
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Accepted In Ecosystem Section */}
                        <div className="mt-28 pt-16 border-t border-white/5">
                            <h4 className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-bold mb-10">
                                Accepted in Ecosystem
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
                                {[
                                    {
                                        name: "Phantom",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2FPhantom.jpg?alt=media&token=c126c3e9-7c24-4a4b-94c6-ed29d1288c48",
                                        url: "https://phantom.app/"
                                    },
                                    {
                                        name: "Jupiter",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fjupiter.jpeg?alt=media&token=d3bb6544-fb8a-41d9-b7eb-969916256244",
                                        url: "https://jup.ag/"
                                    },
                                    {
                                        name: "Squads",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fsquads.jpeg?alt=media&token=64a25adc-881e-44b8-a3ad-b5f59f6f1621",
                                        url: "https://squads.so/"
                                    },
                                    {
                                        name: "Meteora",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fmeteora.jpg?alt=media&token=e4ea3ce6-5932-4b79-9dd2-5ff6fc8f2954",
                                        url: "https://meteora.ag/"
                                    },
                                    {
                                        name: "Helius",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fhelius.jpg?alt=media&token=c946976b-3546-4a0a-9927-2cf1f6bf14d3",
                                        url: "https://helius.dev/"
                                    },
                                    {
                                        name: "Raydium",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2FReydium.png?alt=media&token=14be6174-3a8c-415a-9302-e4168ba189ab",
                                        url: "https://raydium.io/"
                                    },
                                    {
                                        name: "Pump.fun",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fpump.fun.jpg?alt=media&token=ac5b22b7-5913-4179-8c00-54e52f0e4cfd",
                                        url: "https://pump.fun/"
                                    },
                                    {
                                        name: "Streamflow",
                                        img: "https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fstreamflow.jpg?alt=media&token=81117612-77e8-42ae-b3b8-b6757bd4fe20",
                                        url: "https://streamflow.finance/"
                                    }
                                ].map((brand) => (
                                    <a
                                        key={brand.name}
                                        href={brand.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group block w-24 h-16 transition-all duration-300 hover:scale-110"
                                        title={brand.name}
                                    >
                                        <img
                                            src={brand.img}
                                            alt={brand.name}
                                            className="w-full h-full object-contain transition-all duration-300 opacity-60 group-hover:opacity-100"
                                            style={{
                                                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))',
                                                maskImage: brand.name === "Meteora" 
                                                    ? 'linear-gradient(to top, white 10%, transparent 100%)' 
                                                    : brand.name === "Streamflow"
                                                    ? 'linear-gradient(to bottom, white 10%, transparent 100%)'
                                                    : undefined,
                                                WebkitMaskImage: brand.name === "Meteora" 
                                                    ? 'linear-gradient(to top, white 10%, transparent 100%)' 
                                                    : brand.name === "Streamflow"
                                                    ? 'linear-gradient(to bottom, white 10%, transparent 100%)'
                                                    : undefined



                                            }}
                                        />
                                    </a>
                                ))}



                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. Bottom Row */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 group cursor-default">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
                            alt="Luxor Logo"
                            className="w-8 h-8 object-contain brightness-125 filter group-hover:rotate-12 transition-transform duration-500"
                        />
                        <span className="text-lg font-sans font-medium tracking-tighter">Luxor Economy</span>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-sans text-white/40">
                        <Link href="/" className="hover:text-white transition-colors">About</Link>
                        <Link href="/" className="hover:text-white transition-colors">Ecosystem</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <span className="md:ml-4 flex items-center gap-1">
                            © 2026 Luxor Pay made with love <Heart className="w-3 h-3 text-red-500 fill-current" />
                        </span>
                    </div>

                    {/* Language/Location Hint */}
                    <div className="flex items-center gap-2 text-xs font-sans text-white/40">
                        <Globe size={14} />
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
