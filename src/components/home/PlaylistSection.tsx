'use client';
import { useState } from 'react';
import { VideoFacade } from './VideoFacade';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PlaylistSection({ items }: { items: any[] }) {
    const [activeIdx, setActiveIdx] = useState(0);

    if (!items || items.length === 0) return null;

    const mainItem = items[activeIdx];

    const nextVideo = () => {
        setActiveIdx((prev) => (prev + 1) % items.length);
    };

    const prevVideo = () => {
        setActiveIdx((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="flex flex-col items-center w-full gap-8">
            {/* Large main card */}
            <div className="w-full max-w-[1200px] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[650px] relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] cursor-none">
                <VideoFacade key={mainItem.videoId} videoId={mainItem.videoId} title={mainItem.name} autoPlay={true} />
            </div>

            {/* Navigation Pill */}
            {items.length > 1 && (
                <div className="flex items-center gap-6 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <button
                        suppressHydrationWarning
                        onClick={prevVideo}
                        className="text-white/60 hover:text-white transition-colors p-2"
                        aria-label="Previous video"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>
                    <button
                        suppressHydrationWarning
                        onClick={nextVideo}
                        className="text-white/60 hover:text-white transition-colors p-2"
                        aria-label="Next video"
                    >
                        <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
}
