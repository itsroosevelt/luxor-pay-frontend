'use client';
import { InfoSection } from '@/features/home/components/InfoSection';

export function InnovationSection() {
    const items = [
        { 
            title: "Exclusive Discounts", 
            desc: "Pay for business and personal administration services with direct benefits." 
        },
        { 
            title: "Access to Experiences", 
            desc: "Your STR balance is your ticket to events, advanced tools, and premium ecosystem features." 
        },
        { 
            title: "Savings on Consumption", 
            desc: "Get perks at partner merchants, from coffee shops to technology, through our payment gateway." 
        },
        { 
            title: "Active Governance", 
            desc: "Participate in the development of new features. Your voice helps decide where the engine grows." 
        },
    ];

    return (
        <InfoSection 
            title="What exactly is Sterling?"
            subtitle="Sterling (STR) is the native utility token of the Sterling ecosystem. It's not a passive asset; it's an active tool designed for those who build, entrepreneur, and consume in the new digital economy."
            description="By using STR, you don't just hold an asset on Solana; you gain superpowers within our network:"
            items={items}
            imageSrc="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
            imageClassName="object-contain p-12"
            showButton={true}
            buttonText="Watch the movie"
            imageRight={true}
            gradient="from-blue-600/30 via-purple-500/10 to-transparent"
        />
    );
}

