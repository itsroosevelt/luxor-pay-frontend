'use client';
import { InfoSection } from './InfoSection';
import { PingPongVideo } from './PingPongVideo';

export function ArchitectureSection() {
    const items = [
        { 
            title: "Defined Network Capacity", 
            desc: "We have a fixed volume of units to ensure the ecosystem always has the necessary fuel to operate without unexpected inflation." 
        },
        { 
            title: "Programmed Autonomy", 
            desc: "LXR operates under open-source rules on Solana. No central entity can change the rules of use, giving you complete security." 
        },
        { 
            title: "Circular Economy", 
            desc: "100% of revenues are used to strengthen the technical infrastructure and ensure tools remain fast and affordable." 
        },
    ];

    return (
        <InfoSection 
            title="Functional Architecture"
            subtitle="Instead of highlighting scarcity, we highlight predictability for users and merchants."
            items={items}
            customMedia={
                <PingPongVideo 
                    src="https://firebasestorage.googleapis.com/v0/b/udreamms-platform-1.firebasestorage.app/o/Untitled.mp4?alt=media&token=15be5543-6d82-416f-9337-c64985e77632"
                    className="w-full h-full"
                    videoClassName="w-full h-full object-cover transition-transform duration-[2000ms] ease-out"
                />
            }
            imageRight={true}
            gradient="from-cyan-500/20 via-blue-500/10 to-transparent"
        />
    );
}

