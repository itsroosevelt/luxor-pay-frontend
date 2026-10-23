'use client';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users, 
  Coins, 
  Target, 
  Sparkles, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface FeatureItem {
    title: string;
    desc: string;
}

interface CommonSectionProps {
    title: string;
    subtitle: string;
    description?: string;
    items: FeatureItem[];
    imageSrc?: string;
    imageClassName?: string;
    customMedia?: React.ReactNode;
    imageRight?: boolean;
    showButton?: boolean;
    buttonText?: string;
    gradient?: string;
    aspectClassName?: string;
    bareMedia?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Innovation items
    "Descuentos Exclusivos": Zap,
    "Acceso a Experiencias": Sparkles,
    "Ahorro en Consumo": Coins,
    "Gobernanza Activa": Users,
    "Exclusive Fee Discounts": Zap,
    "Access to Advanced Tools": Sparkles,
    "Savings on Consumption": Coins,
    "Active Governance": Users,
    // Philosophy items
    "Sin Fronteras": Globe,
    "Respaldo y Estabilidad": ShieldCheck,
    "Para Todas las Generaciones": Activity,
    "Borderless": Globe,
    "Backing and Stability": ShieldCheck,
    "For All Generations": Activity,
    // Architecture items
    "Capacidad de Red Definida": Activity,
    "Autonomía Programada": ShieldCheck,
    "Economía Circular": RefreshCw,
    "Defined Network Capacity": Activity,
    "Programmed Autonomy": ShieldCheck,
    "Circular Economy": RefreshCw,
};

import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { BlueParticles } from '@/components/ui/BlueParticles';

export function InfoSection({ 
    title, 
    subtitle, 
    description, 
    items, 
    imageSrc, 
    imageClassName = "",
    customMedia,
    imageRight = true, 
    showButton = false,
    buttonText,
    gradient = "from-blue-500/20 via-purple-500/10 to-transparent",
    aspectClassName,
    bareMedia = false
}: CommonSectionProps) {
    
    return (
        <section className="py-20 md:py-32 lg:py-48 px-6 md:px-12 bg-transparent relative overflow-hidden">
            <BlueParticles variant="section" />
            {/* Background Glow */}
            <div className={`absolute top-1/2 ${imageRight ? 'right-0' : 'left-0'} -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${gradient} blur-[120px] opacity-30 pointer-events-none`} />

            <div className={`max-w-[1600px] mx-auto flex flex-col ${imageRight ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}>
                {/* Text Content */}
                <div className="flex-1 space-y-6 z-10">
                    <div className="space-y-6">
                        <motion.h2 
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="text-2xl md:text-4xl lg:text-4xl font-normal text-white tracking-tight leading-tight"
                        >
                            {title}
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.6, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="text-base md:text-lg text-zinc-400 font-light leading-relaxed max-w-lg"
                        >
                            {subtitle}
                        </motion.p>
                        {description && (
                             <motion.p 
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                                className="text-sm text-zinc-500 leading-relaxed max-w-lg"
                            >
                                {description}
                            </motion.p>
                        )}
                    </div>

                    <div className="flex flex-col gap-5 pt-1">
                        {items.map((item, idx) => {
                            const Icon = iconMap[item.title] || Target;
                            return (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -15 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, amount: 0.2 }}
                                    transition={{ duration: 0.5, delay: 0.1 + (idx * 0.08), ease: [0.21, 0.47, 0.32, 0.98] }}
                                    className="group space-y-1.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <Icon className="w-2.5 h-2.5 text-zinc-300" />
                                        </div>
                                        <h3 className="text-[13px] font-medium text-white tracking-wide">{item.title}</h3>
                                    </div>
                                    <p className="text-zinc-500 leading-relaxed text-[10px] md:text-[11px] pr-2 max-w-md">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Media Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="flex-1 w-full"
                >
                    {bareMedia ? (
                        <div className="relative flex items-center justify-center w-full">
                            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-br from-blue-600/20 via-cyan-500/15 to-transparent blur-[120px] opacity-50" />
                            {customMedia}
                        </div>
                    ) : (
                        <div className="relative group w-full">
                            {/* Dynamic colorful glow background - matches the provided mockup */}
                            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-orange-500/20 rounded-[60px] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                            
                            {/* The Glass Container */}
                            <div className={`relative ${aspectClassName || 'aspect-[16/10] lg:aspect-[4/3]'} w-full rounded-[40px] overflow-hidden border border-white/20 bg-black backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]`}>
                                {customMedia ? customMedia : (
                                    imageSrc && (
                                        <Image 
                                            src={imageSrc} 
                                            alt={title} 
                                            fill
                                            className={`object-contain p-6 bg-black transition-transform duration-[2000ms] ease-out ${imageClassName}`}
                                        />
                                    )
                                )}
                                {/* Inner border highlight */}
                                <div className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none" />
                                {/* Glass shine overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
                            </div>

                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
