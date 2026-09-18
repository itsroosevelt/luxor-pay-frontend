'use client';
import { motion } from 'framer-motion';
import { BlueParticles } from '@/components/shared/BlueParticles';

export function JoinSection() {
    return (
        <section className="py-32 md:py-48 px-6 bg-transparent relative overflow-hidden">
            <BlueParticles variant="section" />
            {/* Subtle glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="space-y-6"
                >
                    <h2 className="text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight">
                        The future isn't watched, it's built. <br />
                        <span className="text-zinc-500">Join Sterling, because Sterling is you.</span>
                    </h2>
                    
                    <div className="pt-10">
                        <motion.button
                            suppressHydrationWarning
                            onClick={() => window.open("https://phantom.app/tokens/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", "_blank")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-black px-12 py-4 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors tracking-wide cursor-pointer"
                        >
                            Join today
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

