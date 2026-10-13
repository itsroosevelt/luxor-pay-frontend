'use client';
import { motion } from 'framer-motion';
import { BlueParticles } from '@/components/ui/BlueParticles';

export function CTASection() {
    return (
        <section className="py-20 md:py-32 lg:py-48 px-4 md:px-8 relative overflow-hidden bg-transparent border-t border-white/5">
            <BlueParticles variant="section" />
            <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="w-full max-w-[1800px] mx-auto text-center relative z-10"
            >

                <h2 className="text-3xl lg:text-4xl font-medium font-sans text-white mb-8 md:mb-12 tracking-tight relative z-20">
                    Join the Sterling & Luxor Movement
                </h2>
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-12 md:mb-16 max-w-2xl mx-auto relative z-20">
                    Sterling Payment Gateway connects real-world commerce with Solana, powered natively by the Luxor ($LXR) utility asset. We invite you to join a frictionless financial infrastructure with zero borders.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        suppressHydrationWarning
                        onClick={() => window.open("https://phantom.app/tokens/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", "_blank")}
                        className="px-8 py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-zinc-200 transition-colors w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-white/10"
                    >
                        Get Luxor ($LXR) on Phantom
                    </button>
                    <a 
                        href="https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-semibold text-sm rounded-full hover:bg-white/5 transition-colors w-full sm:w-auto inline-block text-center cursor-pointer"
                    >
                        View Contract on Solscan
                    </a>
                </div>

                <div className="mt-32 md:mt-48 flex justify-center">
                    <div className="w-64 h-64 md:w-80 md:h-80 relative rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)] group bg-black">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
                            alt="Sterling Token"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 bg-black"
                        />
                    </div>

                </div>
            </motion.div>
        </section>
    );
}

