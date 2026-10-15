'use client';
import { motion } from 'framer-motion';
import { BlueParticles } from '@/components/ui/BlueParticles';

export function JoinSection() {
    return (
        <section className="py-20 md:py-32 lg:py-48 px-6 bg-transparent relative overflow-hidden">
            <BlueParticles variant="section" />
            {/* Subtle glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight">
                        The future isn't watched, it's built. <br />
                        <span className="text-zinc-500">Join Sterling, because Sterling is you.</span>
                    </h2>
                    
                    <div className="pt-10 flex flex-col items-center">
                        <motion.button
                            suppressHydrationWarning
                            onClick={() => window.open("https://phantom.app/tokens/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", "_blank")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-black px-10 py-4 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors tracking-wide cursor-pointer shadow-lg shadow-white/10"
                        >
                            Get $LXR on Phantom
                        </motion.button>
                        <span className="text-[11px] text-zinc-500 font-mono mt-3">
                            Solana Contract: 7Qm6...Wdth ($LXR)
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

