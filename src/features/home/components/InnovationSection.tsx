'use client';
import { InfoSection } from '@/features/home/components/InfoSection';

export function InnovationSection() {
    const items = [
        { 
            title: "Exclusive Fee Discounts", 
            desc: "Pay for business and personal administration services with direct benefits and reduced gateway fees." 
        },
        { 
            title: "Access to Advanced Tools", 
            desc: "Your Luxor ($LXR) balance unlocks priority liquidity, merchant POS tools, and premium ecosystem features." 
        },
        { 
            title: "Savings on Consumption", 
            desc: "Get perks at partner merchants, from physical commerce to digital services, through the Sterling gateway." 
        },
        { 
            title: "Active Governance", 
            desc: "Participate in the development of new features and protocol updates. Your voice helps decide where the engine grows." 
        },
    ];

    return (
        <InfoSection 
            title="What is Sterling Payment Gateway?"
            subtitle="Sterling is the high-performance payment gateway powered natively by the Luxor utility asset ($LXR) on Solana. It's not a passive asset; it's an active tool designed for those who build, entrepreneur, and transact in the new digital economy."
            description="By using the Sterling gateway and holding Luxor ($LXR), you don't just hold an asset on Solana; you gain superpowers within our network:"
            items={items}
            imageSrc="https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fwithout-lxr-pay-logo.png?alt=media&token=3591236e-a31e-4e94-b9dd-42394b415a1b"
            imageClassName="object-contain p-12"
            showButton={true}
            buttonText="Explore Ecosystem"
            imageRight={true}
            gradient="from-blue-600/30 via-purple-500/10 to-transparent"
        />
    );
}

