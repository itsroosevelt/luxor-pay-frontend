'use client';
import { useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
    { name: 'Sarah Jenkins', initial: 'S', color: 'bg-emerald-500', text: "An absolute game-changer. Luxor's infrastructure has seamlessly connected our operations across North and South America.", time: '2 days ago' },
    { name: 'David Chen', initial: 'D', color: 'bg-blue-600', text: "The transaction speed and the clarity of the platform are unmatched. It feels like the future of regional finance.", time: '4 days ago' },
    { name: 'Elena Morales', initial: 'E', color: 'bg-purple-600', text: "Finally, a unified block that prioritizes the American Hemisphere. The dashboard is intuitive and highly reliable.", time: '1 week ago' },
    { name: 'Michael O\'Connor', initial: 'M', color: 'bg-rose-600', text: "We've reduced our cross-border friction to almost zero. The underlying tech is solid, and the UX is perfectly polished.", time: '2 weeks ago' },
    { name: 'Ana Silva', initial: 'A', color: 'bg-amber-500', text: "Luxor provides exactly what it promises: radical transparency and efficiency. I'm recommending it to all my partners.", time: '3 weeks ago' },
    { name: 'James Wilson', initial: 'J', color: 'bg-indigo-500', text: "Brilliant concept executed flawlessly. The token utility actually makes sense for sustainable long-term economic growth.", time: '1 month ago' },
    { name: 'Carolina Ruiz', initial: 'C', color: 'bg-pink-600', text: "I was skeptical at first, but the network stability and the low latency of the services won me over completely.", time: '1 month ago' },
    { name: 'Thomas Wright', initial: 'T', color: 'bg-cyan-600', text: "State-of-the-art engineering combined with digital benefits. An essential tool for any modern internet company.", time: '2 months ago' },
    { name: 'Valeria Castro', initial: 'V', color: 'bg-teal-500', text: "The architectural foundations of Luxor give us immense confidence. Scaling our digital services internationally is now effortless.", time: '2 months ago' },
    { name: 'Robert King', initial: 'R', color: 'bg-orange-600', text: "A truly borderless experience. The ecosystem is growing fast and getting significantly better with every update.", time: '3 months ago' },
];

export function ReviewsSection() {
    return (
        <section className="py-32 md:py-48 bg-black border-t border-white/5 relative overflow-hidden">
            <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 md:mb-24 gap-6">
                    <div>
                        <h2 className="text-2xl lg:text-4xl font-medium font-sans text-white mb-3 tracking-tight">
                            Community Feedback
                        </h2>
                        <p className="text-zinc-400 text-base leading-relaxed">
                            See what the earliest adopters and partners are saying about the ecosystem.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full relative group">
                <style suppressHydrationWarning>{`
                    @keyframes marqueeSocial {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-33.33%); }
                    }
                    .animate-marquee-social {
                        display: flex;
                        width: max-content;
                        animation: marqueeSocial 80s linear infinite;
                    }
                    .group:hover .animate-marquee-social {
                        animation-play-state: paused;
                    }
                `}</style>

                <div className="animate-marquee-social flex gap-6 px-6 md:px-12">
                    {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, idx) => (
                        <div
                            key={idx}
                            className="w-[320px] sm:w-[400px] md:w-[460px] shrink-0 bg-white border border-black/5 hover:border-black/10 transition-colors rounded-[24px] p-6 flex flex-col shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1)] select-none"
                        >
                            {/* Header: Avatar + Meta */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-base ${review.color} shadow-inner`}>
                                    {review.initial}
                                </div>
                                <div>
                                    <h3 className="text-black font-semibold text-xs">{review.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className="fill-yellow-500 text-yellow-500" />
                                            ))}
                                        </div>
                                        <span className="text-zinc-500 text-[11px]">{review.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Body: Review Text */}
                            <p className="text-zinc-700 leading-relaxed text-[11px]">
                                "{review.text}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
