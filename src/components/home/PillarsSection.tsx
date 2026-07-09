'use client';
import { motion } from 'framer-motion';
import { Globe, Cpu, Zap } from 'lucide-react';

export function PillarsSection() {
    const items = [
        {
            title: "A Strong and Unified North America",
            desc: "Strengthening Global Leadership. By fostering a strategic technological alliance across the hemisphere, we ensure the US remains the world's innovation engine, backed by an integrated and resilient supply chain of talent and digital assets."
        },
        {
            title: "The Great American Awakening",
            desc: "From Resources to Innovation. We are shifting the continent's focus from exporting raw materials to becoming the world's leading exporter of software, AI, and high-tech solutions. The entire hemisphere is the new frontier of the digital age."
        },
        {
            title: "Exponential Value Creation",
            desc: "Abundance as the New Standard. We empower a new generation of builders, entrepreneurs, and visionaries. In the Luxor economy, creating massive value is the rule, not the exception. We provide the tools for those who dare to build tomorrow's infrastructure."
        }
    ];

    return (
        <section className="py-32 md:py-48 px-4 md:px-8 bg-black border-t border-white/5">
            <motion.div 
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-full max-w-[1800px] mx-auto"
            >
                <div className="text-center mb-24 md:mb-32 max-w-3xl mx-auto">
                    <h2 className="text-3xl lg:text-5xl font-medium font-sans text-white mb-6 tracking-tight">
                        Our Vision for the Americas
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        We are building a future defined by AI, advanced robotics, and decentralized utility. Our mission is to dismantle the barriers that have kept economies fragmented for decades. We are the digital bridge for a hemisphere that creates, innovates, and leads.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/5 py-12">
                    {items.map((col, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                {i === 0 ? <Globe className="text-blue-400" /> : i === 1 ? <Cpu className="text-emerald-400" /> : <Zap className="text-yellow-400" />}
                            </div>
                            <h3 className="text-2xl font-medium font-sans text-white mb-4">{col.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-sm max-w-xs mx-auto font-sans">
                                {col.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

