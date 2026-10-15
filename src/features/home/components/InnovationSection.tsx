'use client';
import { InfoSection } from '@/features/home/components/InfoSection';
import { PaymentFlowVisual } from '@/features/home/components/HomeVisuals';

export function InnovationSection() {
    const items = [
        { 
            title: "Exclusive Fee Discounts", 
            desc: "Pay for business and personal administration services with direct benefits and reduced gateway fees." 
        },
        { 
            title: "Access to Advanced Tools", 
            desc: "Your $LXR balance unlocks priority liquidity, merchant POS tools, and premium ecosystem features." 
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
            subtitle="Sterling is the high-performance payment gateway powered natively by the $LXR utility asset on Solana. It's not a passive asset; it's an active tool designed for those who build, entrepreneur, and transact in the new digital economy."
            description="By using the Sterling gateway and holding $LXR, you don't just hold an asset on Solana; you gain superpowers within our network:"
            items={items}
            customMedia={<PaymentFlowVisual />}
            showButton={true}
            buttonText="Explore Ecosystem"
            imageRight={true}
            gradient="from-blue-600/30 via-purple-500/10 to-transparent"
        />
    );
}

