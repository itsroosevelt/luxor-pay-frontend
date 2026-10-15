'use client';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Sparkles, Building2, Store } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
    const comparisons = [
        {
            feature: "Transaction Processing Fee",
            traditional: "2.9% – 3.5% + $0.30 USD",
            sterling: "0.5% flat fee",
            highlight: true
        },
        {
            feature: "Settlement Time",
            traditional: "2 to 7 business days (T+2 to T+7)",
            sterling: "Instant (~400ms in USDC)",
            highlight: true
        },
        {
            feature: "Chargeback & Fraud Risk",
            traditional: "High (fraud disputes & $15+ penalty fees)",
            sterling: "0% (Irreversible cryptographic finality)",
            highlight: false
        },
        {
            feature: "Custody of Funds",
            traditional: "Held by banks and processing intermediaries",
            sterling: "Direct to your business vault or wallet",
            highlight: false
        },
        {
            feature: "Global Geographic Reach",
            traditional: "Restricted by borders and local banking rails",
            sterling: "Global & borderless on Solana",
            highlight: false
        },
    ];

    return (
        <section id="pricing" className="scroll-mt-20 py-24 md:py-36 px-6 md:px-12 bg-transparent border-t border-white/5 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />

            <div className="w-full max-w-[1500px] mx-auto relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 font-sans block mb-3">
                            Transparent & Frictionless Rates
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.15] font-sans mb-6">
                            0.5% per transaction. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                                Zero hidden fees.
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-light">
                            Save up to 80% on payment gateway costs compared to traditional processors like Stripe, PayPal, or conventional POS merchant services.
                        </p>
                    </motion.div>
                </div>

                {/* Direct Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-16 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg md:text-xl font-medium text-white font-sans">
                                Comparison: Sterling Gateway vs Traditional Processors
                            </h3>
                            <p className="text-xs md:text-sm text-zinc-400 font-light mt-1">
                                Benchmark data based on average eCommerce and retail POS transactions.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium self-start sm:self-auto">
                            <Sparkles className="w-3.5 h-3.5" />
                            Direct savings on every sale
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm font-sans">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="py-4 px-6 font-medium text-zinc-400 text-xs uppercase tracking-wider">Feature</th>
                                    <th className="py-4 px-6 font-medium text-zinc-400 text-xs uppercase tracking-wider">Stripe / Credit Cards</th>
                                    <th className="py-4 px-6 font-medium text-blue-400 text-xs uppercase tracking-wider bg-blue-500/[0.04]">Sterling Gateway (Solana)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {comparisons.map((c, i) => (
                                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="py-4 px-6 font-medium text-white">{c.feature}</td>
                                        <td className="py-4 px-6 text-zinc-400 flex items-center gap-2">
                                            <X className="w-4 h-4 text-red-400 shrink-0" />
                                            <span>{c.traditional}</span>
                                        </td>
                                        <td className="py-4 px-6 text-white font-medium bg-blue-500/[0.04]">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className={c.highlight ? "text-emerald-300 font-semibold" : "text-white"}>{c.sterling}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Plan Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Standard Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10 backdrop-blur-xl flex flex-col justify-between hover:border-white/20 transition-all"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-400">
                                    <Store className="w-6 h-6" />
                                </div>
                                <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                    Merchants & Startups
                                </span>
                            </div>

                            <h4 className="text-2xl font-medium text-white font-sans mb-2">Standard Merchant</h4>
                            <p className="text-zinc-400 text-sm font-light mb-6">
                                Everything needed to accept payments in physical stores and online without banking cuts.
                            </p>

                            <div className="mb-8 pb-8 border-b border-white/5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-light text-white font-sans">0.5%</span>
                                    <span className="text-zinc-400 text-sm">per transaction</span>
                                </div>
                                <p className="text-zinc-500 text-xs mt-2">$0 monthly platform maintenance fee</p>
                            </div>

                            <ul className="space-y-3.5 mb-8 text-sm text-zinc-300 font-sans">
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Solana Pay QR & Payment Links checkout</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Instant USDC and SPL token settlement</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Web merchant portal and POS terminal access</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Reduced gateway fees when holding Luxor ($LXR)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Zero fraudulent chargebacks guaranteed</span>
                                </li>
                            </ul>
                        </div>

                        <Link href="/login?register=true" className="w-full">
                            <button className="w-full py-3.5 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                <span>Get Started Free</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Enterprise Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.05] to-transparent p-8 md:p-10 backdrop-blur-xl flex flex-col justify-between hover:border-blue-400/50 transition-all shadow-xl shadow-blue-500/5"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sky-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                    High Volume & API
                                </span>
                            </div>

                            <h4 className="text-2xl font-medium text-white font-sans mb-2">Enterprise & Developers</h4>
                            <p className="text-zinc-400 text-sm font-light mb-6">
                                For platforms, marketplaces, and high-volume merchants needing dedicated smart contracts and APIs.
                            </p>

                            <div className="mb-8 pb-8 border-b border-white/5">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-light text-white font-sans">&lt; 0.25%</span>
                                    <span className="text-zinc-400 text-sm">tiered volume rate</span>
                                </div>
                                <p className="text-zinc-500 text-xs mt-2">Guaranteed uptime SLA and 24/7 dedicated engineering support</p>
                            </div>

                            <ul className="space-y-3.5 mb-8 text-sm text-zinc-300 font-sans">
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Everything in Standard Merchant</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Production API keys & high-throughput webhooks</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Multi-sig treasury settlement and cold storage routing</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Custom transaction builder and sandbox testing</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Priority direct channel with core protocol architects</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/dashboard/developers/programs" className="flex-1">
                                <button className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer">
                                    <span>View Developer Docs</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=business@luxorintelligence.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sm:w-auto px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium text-sm transition-colors text-center cursor-pointer"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
