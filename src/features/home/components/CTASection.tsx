'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue, type Variants } from 'framer-motion';
import { BlueParticles } from '@/components/ui/BlueParticles';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;
const HEADLINE = 'Join the Sterling Movement'.split(' ');

const wordsContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const word: Variants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
};

const ORBITS = [
    { size: 'w-[120%]', dash: '3 9', dir: 1, turns: 0.6, opacity: 'opacity-40' },
    { size: 'w-[165%]', dash: '2 12', dir: -1, turns: 0.9, opacity: 'opacity-25' },
    { size: 'w-[215%]', dash: '1 16', dir: 1, turns: 1.2, opacity: 'opacity-15' },
];

function Orbit({ progress, orbit }: { progress: MotionValue<number>; orbit: (typeof ORBITS)[number] }) {
    const rotate = useTransform(progress, [0, 1], [0, 360 * orbit.turns * orbit.dir]);
    const scale = useTransform(progress, [0, 0.45, 1], [0.6, 1, 0.9]);
    return (
        <motion.svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            style={{ rotate, scale }}
            className={`absolute ${orbit.size} aspect-square ${orbit.opacity} pointer-events-none`}
        >
            <circle cx="50" cy="50" r="49" fill="none" stroke="#60A5FA" strokeWidth="0.25" strokeDasharray={orbit.dash} />
            <circle cx="50" cy="1" r="1.1" fill="#60A5FA" />
        </motion.svg>
    );
}

/** The Sterling mark, driven by scroll: it grows into place, spins, and its orbits and glow open up. */
function LogoStage() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

    const scale = useTransform(p, [0, 0.35, 0.55, 1], [0.55, 1.05, 1.05, 0.8]);
    const rotate = useTransform(p, [0, 1], [-70, 70]);
    const logoY = useTransform(p, [0, 1], [60, -60]);
    const glow = useTransform(p, [0.1, 0.45, 0.6, 0.95], [0, 1, 1, 0]);
    const glowScale = useTransform(p, [0, 0.5, 1], [0.6, 1.25, 0.7]);

    return (
        <div ref={ref} className="mt-28 md:mt-44 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <motion.div
                    aria-hidden="true"
                    style={{ opacity: glow, scale: glowScale }}
                    className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.45),rgba(37,99,235,0)_65%)] blur-2xl"
                />

                {ORBITS.map((o) => (
                    <Orbit key={o.size} progress={p} orbit={o} />
                ))}

                <motion.div
                    style={{ scale, rotate, y: logoY }}
                    className="relative w-full h-full"
                >
                    <img
                        src="/brand/sterling-logo.png"
                        alt="Sterling mark"
                        className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(37,99,235,0.35)]"
                    />
                </motion.div>
            </div>
        </div>
    );
}

export function CTASection() {
    return (
        <section className="py-20 md:py-32 lg:py-48 px-4 md:px-8 relative overflow-hidden bg-transparent border-t border-white/5">
            <BlueParticles variant="section" />
            <div className="w-full max-w-[1800px] mx-auto text-center relative z-10">
                <motion.h2
                    variants={wordsContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                    className="text-3xl lg:text-4xl font-medium font-sans text-white mb-8 md:mb-12 tracking-tight relative z-20 flex flex-wrap justify-center gap-x-[0.3em]"
                >
                    {HEADLINE.map((w) => (
                        <motion.span key={w} variants={word} className="inline-block">
                            {w}
                        </motion.span>
                    ))}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
                    className="text-zinc-300 text-base md:text-lg leading-relaxed mb-12 md:mb-16 max-w-2xl mx-auto relative z-20"
                >
                    Sterling Payment Gateway connects real-world commerce with Solana, powered natively by the $LXR utility asset. We invite you to join a frictionless financial infrastructure with zero borders.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        suppressHydrationWarning
                        onClick={() => window.open("https://phantom.app/tokens/solana/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth", "_blank")}
                        className="px-8 py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-zinc-200 transition-colors w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-white/10"
                    >
                        Get $LXR on Phantom
                    </button>
                    <a
                        href="https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-semibold text-sm rounded-full hover:bg-white/5 transition-colors w-full sm:w-auto inline-block text-center cursor-pointer"
                    >
                        View Contract on Solscan
                    </a>
                </motion.div>

                <LogoStage />
            </div>
        </section>
    );
}
