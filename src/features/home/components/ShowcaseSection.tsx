'use client';
import { useState, useRef, useEffect } from 'react';
import { useInView, motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { BlueParticles } from '@/components/ui/BlueParticles';

function ShowcaseVideo({ src, className }: { src: string, className: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3 });

    useEffect(() => {
        if (videoRef.current) {
            if (isInView) videoRef.current.play().catch(() => {});
            else videoRef.current.pause();
        }
    }, [isInView]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <video 
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className={className}
            />
        </div>
    );
}

export function ShowcaseSection() {
    const [activeIdx, setActiveIdx] = useState(0);

    const items = [
        {
            title: "A Unified Economic Block",
            desc: "Demographics is destiny. While other global powers face aging populations and stagnation, the Americas pulse with young, digital-native energy. By aligning the US innovation model with talent across the hemisphere, we're not just building a network; we're building the most resilient and dynamic economic block on the planet.",
            videoSrc: "https://firebasestorage.googleapis.com/v0/b/udreamms-platform-1.firebasestorage.app/o/anto.mp4?alt=media&token=c3f44782-2f93-4006-bf0d-25c86a6b32ec"
        },
        {
            title: "Hemispheric Stability",
            desc: "Security through prosperity. A prosperous hemisphere is a secure hemisphere. Sterling facilitates the flow of digital utility and tools across borders, eradicating the lack of opportunity that breeds instability. We are replacing borders with bridges, ensuring the 'American Dream' of technological progress is a shared reality for everyone in our hemisphere.",
            videoSrc: "https://firebasestorage.googleapis.com/v0/b/udreamms-platform-1.firebasestorage.app/o/ente.mp4?alt=media&token=9e649051-bf4e-44e4-af61-c0b6bac55c2c"
        },
        {
            title: "Exponential Value Creation",
            desc: "Leveraging AI and Robotics. We are transitioning from an economy of scarcity to one of abundance. Sterling ensures the Americas won't just witness the AI revolution, but lead it. From Silicon Slopes to every city on the continent, we provide the liquidity engine for the skilled workforce and creative minds behind tomorrow's algorithms.",
            videoSrc: "https://firebasestorage.googleapis.com/v0/b/udreamms-platform-1.firebasestorage.app/o/into.mp4?alt=media&token=b7b792eb-2f97-47d9-8e0e-6b9ed36232ad"
        }
    ];

    const nextSlide = () => setActiveIdx((prev) => (prev + 1) % items.length);
    const prevSlide = () => setActiveIdx((prev) => (prev - 1 + items.length) % items.length);

    return (
        <section className="py-20 md:py-32 lg:py-48 px-6 md:px-12 bg-transparent overflow-hidden border-t border-white/5 relative">
            <BlueParticles variant="section" />
            <div className="max-w-[1600px] mx-auto">
                {/* Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 md:mb-32 items-start">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.05] max-w-xl"
                    >
                        Why is it vital to do this now?
                    </motion.h2>
                    <div className="flex justify-start lg:justify-end">
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-500 text-base md:text-base leading-relaxed max-w-md lg:text-right font-light"
                        >
                            The world is at an inflection point. Technology is no longer an option; it's the language of survival. While other regions fragment, the American Hemisphere rises as a beacon of unexplored synergy. For years, the gap between capital and talent has limited our collective potential. Sterling is here to bridge that gap, creating a unified digital infrastructure from Salt Lake City to the farthest corners of the Americas.
                        </motion.p>
                    </div>
                </div>

                {/* Carousel Logic */}
                <div className="relative">
                    <div className="flex gap-8 transition-transform duration-700 ease-out" style={{ transform: `translateX(calc(-${activeIdx * (typeof window !== 'undefined' && window.innerWidth < 768 ? 85 : 50)}% - ${activeIdx * 16}px))` }}>
                        {items.map((item, idx) => (
                            <div key={idx} className="min-w-[85%] md:min-w-[48%] space-y-8 group">
                                <div className="aspect-video w-full rounded-[40px] bg-black border border-white/10 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                    <ShowcaseVideo 
                                        src={item.videoSrc}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/40 pointer-events-none" />
                                </div>
                                <div className={`space-y-4 px-2 transition-opacity duration-500 ${idx === activeIdx ? 'opacity-100' : 'opacity-40'}`}>
                                    <h3 className="text-sm font-medium text-white tracking-wide">{item.title}</h3>
                                    <p className="text-[10px] md:text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Controls - Pill style */}
                    <div className="flex justify-end mt-12 pr-4 md:pr-12">
                         <div className="flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1.5 gap-2">
                            <button 
                                suppressHydrationWarning
                                onClick={prevSlide}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            <button 
                                suppressHydrationWarning
                                onClick={nextSlide}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                                aria-label="Next slide"
                            >
                                <ChevronRight size={18} />
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

