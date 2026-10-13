'use client';
import { motion } from 'framer-motion';
import { QrCode, Zap, CheckCircle2 } from 'lucide-react';

export function GiantsSection() {
    const steps = [
        {
            step: "01",
            title: "Customer Scans QR",
            desc: "Shoppers scan the dynamic QR code with Phantom, Solflare, or any Solana wallet. Also supports one-click payment links and physical POS terminals.",
            icon: QrCode,
            color: "text-blue-400"
        },
        {
            step: "02",
            title: "Solana Confirms in ~400ms",
            desc: "The transaction is cryptographically verified and finalized on the Solana blockchain in under half a second, with network fees below $0.001.",
            icon: Zap,
            color: "text-amber-400"
        },
        {
            step: "03",
            title: "Merchant Receives USDC Instantly",
            desc: "Payments settle in digital dollars (USDC) directly into your business vault. 100% liquid funds with zero 48-hour holds and zero chargebacks.",
            icon: CheckCircle2,
            color: "text-emerald-400"
        }
    ];

    return (
        <section id="how-it-works" className="py-20 md:py-32 lg:py-40 px-6 md:px-12 bg-transparent border-t border-white/5 relative overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 md:mb-24">
                    <div className="max-w-2xl">
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 font-sans block mb-3">
                            Real-Time Payment Flow
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1] font-sans">
                            How Sterling Pay <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                                Works on Solana
                            </span>
                        </h2>
                    </div>
                    <div className="max-w-md">
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-light">
                            Engineered to eliminate banking intermediaries. Accept instant point-of-sale (POS) and eCommerce payments with sub-second finality.
                        </p>
                    </div>
                </div>

                {/* Clean, open 3-column steps (No heavy boxed containers) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 border-t border-white/10 pt-12 md:pt-16">
                    {steps.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className="group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-4xl md:text-5xl font-light text-white/30 group-hover:text-blue-400 transition-colors font-sans">
                                            {item.step}
                                        </span>
                                        <Icon className={`w-6 h-6 ${item.color}`} strokeWidth={1.75} />
                                    </div>

                                    <h3 className="text-xl md:text-2xl font-medium text-white mb-3 tracking-tight font-sans">
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-zinc-400 text-sm md:text-[15px] leading-relaxed font-sans font-light">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// Named alias for backwards compatibility
export const PaymentFlowSection = GiantsSection;
