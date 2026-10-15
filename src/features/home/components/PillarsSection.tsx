'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Globe, Cpu, Zap } from 'lucide-react';
import { BlueParticles } from '@/components/ui/BlueParticles';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const ITEMS = [
    {
        title: "A Strong and Unified North America",
        desc: "Strengthening Global Leadership. By fostering a strategic technological alliance across the hemisphere, we ensure the US remains the world's innovation engine, backed by an integrated and resilient supply chain of talent and digital assets.",
        Icon: Globe,
        color: 'text-blue-400',
    },
    {
        title: "The Great American Awakening",
        desc: "From Resources to Innovation. We are shifting the continent's focus from exporting raw materials to becoming the world's leading exporter of software, AI, and high-tech solutions. The entire hemisphere is the new frontier of the digital age.",
        Icon: Cpu,
        color: 'text-emerald-400',
    },
    {
        title: "Exponential Value Creation",
        desc: "Abundance as the New Standard. We empower a new generation of builders, entrepreneurs, and visionaries. In the Sterling economy, creating massive value is the rule, not the exception. We provide the tools for those who dare to build tomorrow's infrastructure.",
        Icon: Zap,
        color: 'text-yellow-400',
    },
];

/**
 * Scroll-driven showcase: the section pins to the viewport and, as the visitor scrolls, each pillar
 * takes the spotlight in turn — its icon grows and its text opens beneath the row of icons.
 */
export function PillarsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [active, setActive] = useState(0);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        const next = Math.min(ITEMS.length - 1, Math.max(0, Math.floor(v * ITEMS.length)));
        setActive((cur) => (cur === next ? cur : next));
    });

    const jumpTo = (index: number) => {
        const el = sectionRef.current;
        if (!el) return;
        const scrollable = el.offsetHeight - window.innerHeight;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (scrollable * (index + 0.5)) / ITEMS.length, behavior: 'smooth' });
    };

    const current = ITEMS[active];

    return (
        <section
            ref={sectionRef}
            className="relative border-t border-white/5 bg-transparent h-[260vh] md:h-[300vh]"
        >
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                <BlueParticles variant="section" />
                <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 md:px-8 flex flex-col items-center text-center">
                    <h2 className="text-3xl lg:text-5xl font-medium font-sans text-white mb-4 tracking-tight">
                        Our Vision for the Americas
                    </h2>
                    <p className="hidden md:block text-zinc-500 text-base leading-relaxed max-w-2xl mb-10 md:mb-14">
                        We are the digital bridge for a hemisphere that creates, innovates, and leads.
                    </p>

                    {/* Icon rail */}
                    <div className="relative flex items-center justify-center gap-8 md:gap-24 mb-10 md:mb-12 mt-6 md:mt-0">
                        <div className="absolute top-1/2 left-[12%] right-[12%] h-px -translate-y-1/2 bg-white/10" aria-hidden="true" />
                        <motion.div
                            aria-hidden="true"
                            style={{ scaleX: progress }}
                            className="absolute top-1/2 left-[12%] right-[12%] h-px -translate-y-1/2 origin-left bg-gradient-to-r from-white/60 to-white/20"
                        />
                        {ITEMS.map(({ Icon, color, title }, i) => {
                            const isActive = i === active;
                            return (
                                <button
                                    key={title}
                                    type="button"
                                    onClick={() => jumpTo(i)}
                                    aria-label={title}
                                    aria-current={isActive}
                                    className="relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60A5FA]"
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="pillar-halo"
                                            className="absolute -inset-3 rounded-full border border-white/20 bg-white/[0.04]"
                                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                                        />
                                    )}
                                    <motion.span
                                        animate={{ scale: isActive ? 1.45 : 0.9, opacity: isActive ? 1 : 0.4 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                                        className="relative flex w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0A0A0A] border border-white/10 items-center justify-center"
                                    >
                                        <Icon className={`${color} w-7 h-7 md:w-8 md:h-8`} />
                                    </motion.span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active pillar */}
                    <div className="min-h-[220px] md:min-h-[200px] max-w-2xl" aria-live="polite">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                                transition={{ duration: 0.45, ease: EASE }}
                            >
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500 block mb-4">
                                    {String(active + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}
                                </span>
                                <h3 className="text-2xl md:text-4xl font-medium font-sans text-white mb-5 tracking-tight">
                                    {current.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-sans">
                                    {current.desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll</p>
                </div>
            </div>
        </section>
    );
}
