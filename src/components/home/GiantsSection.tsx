'use client';
import { motion } from 'framer-motion';
import { PlaylistSection } from './PlaylistSection';

export function GiantsSection() {
    const items = [
        {
            name: "Markets and Strategy",
            desc: "Future vision on the movements of smart capital.",
            videoId: "_L_OOxgXCTk"
        },
        {
            name: "Elon Musk",
            desc: "His quest for an interplanetary humanity teaches us that we shouldn't limit ourselves to earthly borders.",
            videoId: "IgifEgm1-e0"
        },
        {
            name: "Economic Perspective",
            desc: "Deep analysis of macroeconomic variables and global technological impact.",
            videoId: "jJBvQdfz1Z0"
        },
        {
            name: "Mark Zuckerberg",
            desc: "His focus on global connectivity shows us that the world is a single network.",
            videoId: "gF12Xn3C-0c"
        },
        {
            name: "Jensen Huang",
            desc: "His goal is to democratize AI so that any human can be as productive as an entire company.",
            videoId: "hoDYYCyxMuE"
        },
        {
            name: "Alejandro Salomón",
            desc: "Visionary entrepreneur discussing the future of digital assets and technological innovation.",
            videoId: "ZWII5oAOt1Y"
        }
    ];

    return (
        <section className="py-32 md:py-48 px-6 md:px-12 bg-black border-t border-white/5 relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="w-full max-w-[1600px] mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-start">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.05] max-w-xl">
                        Aligned with the Giants of Tomorrow
                    </h2>
                    <div className="flex justify-start lg:justify-end">
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md lg:text-right font-light">
                            We walk toward the frontier of the possible, inspired by the vision of leaders who are redesigning our species today:
                        </p>
                    </div>
                </div>

                <PlaylistSection items={items} />
            </motion.div>
        </section>
    );
}

