'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, Heart, ChevronDown } from 'lucide-react';
import { getSocialLinks } from '@/features/home/lib/social-links';
import { BlueParticles } from '@/components/ui/BlueParticles';

type FooterLink = { name: string; href: string; target?: string; isHighlight?: boolean; isBlue?: boolean };

interface RegularSection {
    title: string;
    type?: 'regular';
    links: FooterLink[];
    hasExpandLimit?: boolean;
}

interface AssetsSection {
    title: string;
    type: 'assets';
    assets: FooterLink[];
    ecosystemSubtitle: string;
    ecosystemLinks: FooterLink[];
}

type FooterSectionItem = RegularSection | AssetsSection;

const LUXOR_FOOTER_SECTIONS: FooterSectionItem[] = [
    {
        title: "Project",
        links: [
            { name: "Team", href: "https://luxorintelligence.com/team", target: "_blank" },
            { name: "Roadmap", href: "https://luxorintelligence.com/roadmap", target: "_blank" },
            { name: "Whitepaper (Docs)", href: "https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md", target: "_blank" },
            { name: "Press & Media", href: "#" },
            { name: "Education", href: "https://luxorintelligence.com/education", target: "_blank" },
            { name: "Our Partners", href: "#" },
        ]
    },
    {
        title: "Assets",
        type: "assets",
        assets: [
            { name: "$LXR | Utility Asset", href: "https://luxorstandard.com/", target: "_blank" },
            { name: "$XLS | Real world Asset", href: "https://excelsiorstandard.com/", target: "_blank" },
            { name: "$USDX | Stable Asset", href: "https://occidentstandard.com/", target: "_blank" },
        ],
        ecosystemSubtitle: "ECOSYSTEM",
        ecosystemLinks: [
            { name: "Roosevelt", href: "https://itsroosevelt.com/", target: "_blank" },
            { name: "Royalty", href: "https://itsroyalty.us/", target: "_blank" },
            { name: "Sterling", href: "https://itssterling.com/", target: "_blank" },
        ],
    },
    {
        title: "Tokenomics",
        links: [
            { name: "Total Supply", href: "#" },
            { name: "Circulating Supply", href: "#" },
            { name: "Network Contract Address", href: "https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "Public Sale / IDO", href: "#" },
            { name: "Liquidity Pool", href: "#" },
            { name: "TGE (Token Generation Event)", href: "#" },
            { name: "Transaction Fees", href: "#" },
            { name: "Buy-back & Burn", href: "#" },
        ]
    },
    {
        title: "Utility",
        links: [
            { name: "Staking & Rewards", href: "https://luxorintelligence.com/coming-soon", target: "_blank" },
            { name: "SI Premium Access", href: "https://luxorintelligence.com/coming-soon", target: "_blank" },
            { name: "Hardware Discounts", href: "https://luxorintelligence.com/coming-soon", target: "_blank" },
            { name: "Governance (DAO)", href: "https://luxorintelligence.com/coming-soon", target: "_blank" },
            { name: "Cashback for Usage", href: "https://luxorintelligence.com/coming-soon", target: "_blank" },
            { name: "Suggestions", href: "mailto:support@luxorintelligence.com" },
        ]
    },
    {
        title: "Security & Legal",
        links: [
            { name: "Technical Audit", href: "#" },
            { name: "Security Certificates", href: "#" },
            { name: "Verified Contract", href: "https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "Bug Bounty Program", href: "#" },
            { name: "Transparency of Funds", href: "#" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Use", href: "/terms" },
            { name: "Data Deletion", href: "/data-deletion" },
            { name: "Disclaimer", href: "#" },
            { name: "AML / KYC Policy", href: "#" },
        ]
    },
    {
        title: "On-Chain Links",
        links: [
            { name: "Solscan (Explorer)", href: "https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "DexScreener", href: "https://dexscreener.com/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "Raydium (Swap)", href: "https://raydium.io/swap/?inputMint=sol&outputMint=7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "Phantom Wallet", href: "https://phantom.app/", target: "_blank" },
            { name: "Dial.to (Blinks)", href: "https://dial.to/?action=solana-action:https://jup.ag/swap/SOL-7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", target: "_blank" },
            { name: "Jupiter", href: "https://jup.ag/", target: "_blank" },
            { name: "Meteora", href: "https://www.meteora.ag/", target: "_blank" },
            { name: "Events", href: "#" },
            { name: "Blog", href: "#" },
        ]
    },
    {
        title: "Documentation",
        links: [
            { name: "Whitepaper", href: "https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md", target: "_blank" },
            { name: "API & SDK", href: "#" },
            { name: "Integration Guides", href: "#" },
            { name: "Legal Files", href: "#" },
            { name: "Github Repository", href: "https://github.com/admluxorsys/luxor", target: "_blank" },
        ]
    },
    {
        title: "Company",
        links: [
            { name: "Technical Support", href: "https://mail.google.com/mail/?view=cm&fs=1&to=support@luxorintelligence.com", target: "_blank" },
            { name: "Help Center (FAQ)", href: "#" },
            { name: "Careers", href: "https://luxorintelligence.com/careers", target: "_blank" },
            { name: "Business Contact", href: "https://mail.google.com/mail/?view=cm&fs=1&to=business@luxorintelligence.com", target: "_blank" },
            { name: "Report an Error", href: "https://mail.google.com/mail/?view=cm&fs=1&to=support@luxorintelligence.com", target: "_blank" },
            { name: "support@luxorintelligence.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=support@luxorintelligence.com", target: "_blank", isBlue: true },
            { name: "legal@luxorintelligence.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=legal@luxorintelligence.com", target: "_blank", isBlue: true },
            { name: "careers@luxorintelligence.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=careers@luxorintelligence.com", target: "_blank", isBlue: true },
            { name: "+1 (385) 865-3535", href: "https://wa.me/13858653535", target: "_blank", isBlue: true },
            { name: "470 W 200 N, Salt Lake City, UT 84103", href: "https://maps.google.com/?q=470+W+200+N,+Salt+Lake+City,+UT+84103", target: "_blank" },
        ]
    }
];

const STERLING_SECTIONS: RegularSection[] = [
    {
        title: "Products",
        hasExpandLimit: true,
        links: [
            { name: "Web Gateway (eCommerce)", href: "/#innovation" },
            { name: "Point of Sale (POS)", href: "/#architecture" },
            { name: "Recurring Payments", href: "/#innovation" },
            { name: "Ecosystem & Tokenization", href: "/#philosophy" },
            { name: "Payments Engine", href: "/#architecture" },
            { name: "Checkout", href: "/#innovation" },
            { name: "Invoicing", href: "/login?redirect=%2Fdashboard%2Frequests" },
            { name: "Crypto Onramp", href: "/login?redirect=%2Fdashboard" }
        ]
    },
    {
        title: "Solutions",
        hasExpandLimit: true,
        links: [
            { name: "Enterprises", href: "/#solutions" },
            { name: "Startups", href: "/#solutions" },
            { name: "SMBs", href: "/#solutions" },
            { name: "Retail & Physical Stores", href: "/#showcase" },
            { name: "eCommerce & Digital", href: "/#showcase" },
            { name: "Marketplaces", href: "/#showcase" },
            { name: "Local Businesses", href: "/#showcase" },
            { name: "Platforms", href: "/#solutions" }
        ]
    },
    {
        title: "Developers",
        hasExpandLimit: true,
        links: [
            { name: "Documentation", href: "https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md", target: "_blank" },
            { name: "API Reference", href: "https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md", target: "_blank" },
            { name: "Libraries & SDKs", href: "https://github.com/admluxorsys/luxor", target: "_blank" },
            { name: "Sandbox / Testnet", href: "/login?redirect=%2Fdashboard%2Fdevelopers%2Ftx-builder" },
            { name: "Token Manager", href: "/login?redirect=%2Fdashboard%2Fdevelopers%2Ftoken-manager" }
        ]
    },
    {
        title: "Resources",
        hasExpandLimit: true,
        links: [
            { name: "Blog", href: "https://luxorintelligence.com", target: "_blank" },
            { name: "Help Center", href: "https://mail.google.com/mail/?view=cm&fs=1&to=support@luxorintelligence.com", target: "_blank" },
            { name: "Governance / DAO", href: "/#pillars" }
        ]
    }
];

export default function Footer() {
    const socialLinks = getSocialLinks('Docs');
    const [activeTab, setActiveTab] = useState<'ecosystem' | 'platform'>('ecosystem');

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

    const currentSections = activeTab === 'ecosystem' ? LUXOR_FOOTER_SECTIONS : STERLING_SECTIONS;

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
                            <p className="text-white/40 text-xs leading-relaxed">Subscribe to receive the latest ecosystem and platform updates.</p>
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
                            Making <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Sterling</span> <br />
                            helpful for <br />
                            everyone
                        </h2>

                        {/* Optional View Switcher */}
                        <div className="flex items-center gap-2 mt-8">
                            <button
                                onClick={() => setActiveTab('ecosystem')}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                                    activeTab === 'ecosystem'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                Sterling Ecosystem
                            </button>
                            <button
                                onClick={() => setActiveTab('platform')}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                                    activeTab === 'platform'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                Sterling Platform
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Columns in a Grid */}
                    <div className="lg:w-3/4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                            {currentSections.map((section, idx) => {
                                const isAssets = section.type === 'assets';
                                const regularSec = !isAssets ? (section as RegularSection) : null;
                                const isExpanded = regularSec ? expandedColumns[regularSec.title] : true;
                                const maxVisibleLinks = regularSec?.hasExpandLimit && !isExpanded ? 10 : (regularSec?.links.length || 0);
                                const visibleLinks = regularSec ? regularSec.links.slice(0, maxVisibleLinks) : [];
                                const hasMore = (regularSec?.hasExpandLimit && regularSec.links.length > 10) || false;

                                return (
                                    <div key={idx} className="flex flex-col gap-4 pb-6 lg:pb-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white text-base font-sans font-medium">{section.title}</h3>
                                            {hasMore && regularSec && (
                                                <button
                                                    onClick={() => toggleColumnExpand(regularSec.title)}
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

                                        {isAssets ? (
                                            <div className="flex flex-col gap-2">
                                                <ul className="flex flex-col gap-2.5">
                                                    {(section as AssetsSection).assets.map((link, lIdx) => (
                                                        <li key={`asset-${lIdx}`}>
                                                            <a
                                                                href={link.href}
                                                                target={link.target}
                                                                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                                                                className="text-sky-400 hover:text-sky-300 text-sm font-sans transition-colors block"
                                                            >
                                                                {link.name}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="pt-3">
                                                    <h4 className="text-white/40 text-xs font-sans font-medium uppercase tracking-wider mb-2.5">
                                                        {(section as AssetsSection).ecosystemSubtitle}
                                                    </h4>
                                                    <ul className="flex flex-col gap-2.5">
                                                        {(section as AssetsSection).ecosystemLinks.map((link, lIdx) => (
                                                            <li key={`eco-${lIdx}`}>
                                                                <a
                                                                    href={link.href}
                                                                    target={link.target}
                                                                    rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                                                                    className="text-sky-400 hover:text-sky-300 text-sm font-sans transition-colors block"
                                                                >
                                                                    {link.name}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <ul className="flex flex-col gap-2.5">
                                                {visibleLinks.map((link, lIdx) => {
                                                    const isBlueLink = link.isBlue || link.name === '+1 (385) 865-3535' || /^(support|legal|careers)@luxorintelligence\.com$/.test(link.name);
                                                    return (
                                                        <li key={lIdx}>
                                                            <a
                                                                href={link.href}
                                                                target={link.target}
                                                                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                                                                className={`${
                                                                    isBlueLink
                                                                        ? 'text-sky-400 hover:text-sky-300'
                                                                        : 'text-white/60 hover:text-white'
                                                                } text-sm font-sans transition-colors block decoration-transparent`}
                                                            >
                                                                {link.name}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
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
                            src="/brand/sterling-logo.png"
                            alt="Logo"
                            className="w-8 h-8 object-contain brightness-125 filter group-hover:rotate-12 transition-transform duration-500"
                        />
                        <span className="text-lg font-sans font-medium tracking-tighter">Sterling</span>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-sans text-white/40">
                        <Link href="/" className="hover:text-white transition-colors">About</Link>
                        <Link href="/" className="hover:text-white transition-colors">Ecosystem</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <span className="md:ml-4 flex items-center gap-1">
                            © 2026 Sterling <Heart className="w-3 h-3 text-red-500 fill-current inline" />
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
