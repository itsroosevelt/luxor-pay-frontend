'use client';
import { useState, useRef, useEffect } from 'react';
import { useInView, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { BlueParticles } from '@/components/ui/BlueParticles';

function ShowcaseVideo({ src, poster, className }: { src: string, poster?: string, className: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3 });
    // The file is only requested the first time the clip scrolls into view (they weigh up to ~25 MB each).
    const armed = useInView(containerRef, { amount: 0.3, once: true });

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !armed) return;
        if (isInView) video.play().catch(() => {});
        else video.pause();
    }, [isInView, armed]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <video
                ref={videoRef}
                src={armed ? src : undefined}
                loop
                muted
                playsInline
                preload="none"
                poster={poster}
                className={className}
            />
        </div>
    );
}

export function ShowcaseSection() {
    const [activeIdx, setActiveIdx] = useState(0);
    const [perView, setPerView] = useState(1);

    // Large screens show two videos at a time (bigger), small screens one.
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const update = () => setPerView(mq.matches ? 2 : 1);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const items = [
        {
            title: "Accept payments in any token",
            desc: "Share a payment link or QR code and let customers pay in USDC, SOL or $LXR. Sterling settles on Solana in seconds and the merchant receives USDC, tracked in one dashboard.",
            videoSrc: "/videos/sterling-payments.mp4",
            poster: "/videos/sterling-payments-poster.jpg"
        },
        {
            title: "Shared treasury, shared control",
            desc: "Create multisig vaults with member roles and approval thresholds. Every outgoing transfer needs the signers you choose, so no single person controls the funds.",
            videoSrc: "/videos/sterling-multisig.mp4",
            poster: "/videos/sterling-multisig-poster.jpg"
        },
        {
            title: "Launch your token",
            desc: "Create and launch a token with a guided flow: name, supply, distribution and liquidity, managed from the same place as your treasury and payments.",
            videoSrc: "/videos/sterling-launcher.mp4",
            poster: "/videos/sterling-launcher-poster.jpg"
        }
    ];

    const pages = Math.max(1, items.length - perView + 1);
    const current = Math.min(activeIdx, pages - 1);
    const nextSlide = () => setActiveIdx((prev) => (Math.min(prev, pages - 1) + 1) % pages);
    const prevSlide = () => setActiveIdx((prev) => (Math.min(prev, pages - 1) - 1 + pages) % pages);

    return (
        <section className="py-20 md:py-32 lg:py-48 px-6 md:px-8 bg-transparent overflow-hidden border-t border-white/5 relative">
            <BlueParticles variant="section" />
            <div className="max-w-[1840px] mx-auto">
                {/* Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 md:mb-32 items-start">
                    <motion.h2 
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.05] max-w-xl"
                    >
                        Everything you need to move money on-chain
                    </motion.h2>
                    <div className="flex justify-start lg:justify-end">
                        <motion.p 
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="text-zinc-500 text-base md:text-base leading-relaxed max-w-md lg:text-right font-light"
                        >
                            Sterling brings payments, treasuries and token launches into one platform on Solana. Accept money from customers, hold it with the people you trust, and grow with your own token, with fast settlement and a clear record of every movement.
                        </motion.p>
                    </div>
                </div>

                {/* Showcase Cards / Carousel */}
                <motion.div 
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="relative overflow-hidden"
                >
                    <div 
                        className="flex gap-6 transition-transform duration-700 ease-out [transform:translateX(calc(var(--i)*-100%_-_var(--i)*1.5rem))] lg:[transform:translateX(calc(var(--i)*-50%_-_var(--i)*0.75rem))]" 
                        style={{ '--i': current } as React.CSSProperties}
                    >
                        {items.map((item, idx) => (
                            <div 
                                key={idx} 
                                className="w-full lg:w-[calc(50%-0.75rem)] shrink-0 space-y-6 lg:space-y-8 group cursor-pointer"
                                onClick={() => setActiveIdx(Math.min(idx, pages - 1))}
                            >
                                <div className={`aspect-video w-full rounded-[40px] bg-black border overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ${
                                    idx >= current && idx < current + perView ? 'border-white/25 shadow-blue-500/10' : 'border-white/10 group-hover:border-white/20'
                                }`}>
                                    <ShowcaseVideo 
                                        src={item.videoSrc}
                                        poster={item.poster}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/40 pointer-events-none" />
                                </div>
                                <div className={`space-y-3 px-2 transition-opacity duration-500 ${
                                    idx >= current && idx < current + perView ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                                }`}>
                                    <h3 className="text-base font-medium text-white tracking-wide font-sans">{item.title}</h3>
                                    <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-light font-sans">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Controls - Pill style */}
                    <div className="flex justify-end mt-8 lg:mt-12 pr-4 md:pr-12">
                         <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 gap-2">
                            <button 
                                suppressHydrationWarning
                                onClick={prevSlide}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white cursor-pointer"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-xs text-zinc-400 font-mono px-2 select-none">
                                {current + 1} / {pages}
                            </span>
                            <div className="w-px h-4 bg-white/10" />
                            <button 
                                suppressHydrationWarning
                                onClick={nextSlide}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white cursor-pointer"
                                aria-label="Next slide"
                            >
                                <ChevronRight size={18} />
                            </button>
                         </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

