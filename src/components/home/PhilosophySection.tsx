'use client';
import { motion } from 'framer-motion';
import { InfoSection } from './InfoSection';

export function PhilosophySection() {
    const items = [
        { 
            title: "Borderless", 
            desc: "A tool for the entrepreneur in the US, the professional in Latin America, and anyone in the Americas seeking to thrive." 
        },
        { 
            title: "Backing and Stability", 
            desc: "Built on Solana's ultra-fast infrastructure, Luxor integrates digital dollar efficiency so the global economy reaches every corner." 
        },
        { 
            title: "For All Generations", 
            desc: "From digital natives to those looking to modernize centuries-old businesses. Luxor is easy, accessible, and universal." 
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        >
            <InfoSection 
                title="Our Philosophy: The Hemisphere of Abundance"
                subtitle="Born in Salt Lake City, Luxor aligns with the innovation values of the western tech corridor. We believe abundance is not awaited, it is created."
                items={items}
                imageSrc="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
                imageClassName="object-contain p-12"
                imageRight={false}
                gradient="from-orange-500/20 via-red-500/10 to-transparent"
            />
        </motion.div>
    );
}

