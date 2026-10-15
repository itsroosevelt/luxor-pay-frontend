'use client';
import { motion } from 'framer-motion';
import { InfoSection } from '@/features/home/components/InfoSection';
import { LogoParticleVisual } from '@/features/home/components/HomeVisuals';

export function PhilosophySection() {
    const items = [
        { 
            title: "Borderless", 
            desc: "A tool for the entrepreneur in the US, the professional in Latin America, and anyone in the Americas seeking to thrive." 
        },
        { 
            title: "Backing and Stability", 
            desc: "Built on Solana's ultra-fast infrastructure, Sterling integrates digital dollar efficiency so the global economy reaches every corner." 
        },
        { 
            title: "For All Generations", 
            desc: "From digital natives to those looking to modernize centuries-old businesses. Sterling is easy, accessible, and universal." 
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            <InfoSection 
                title="Our Philosophy: The Hemisphere of Abundance"
                subtitle="Born in Salt Lake City, Sterling aligns with the innovation values of the western tech corridor. We believe abundance is not awaited, it is created."
                items={items}
                customMedia={<LogoParticleVisual />}
                imageRight={false}
                gradient="from-orange-500/20 via-red-500/10 to-transparent"
            />
        </motion.div>
    );
}

