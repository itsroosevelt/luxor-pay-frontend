'use client';

import { ChevronDown } from 'lucide-react';
import { motion, MotionConfig, useScroll, useSpring, useTransform, type Variants } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeroBackground } from '@/features/home/components/HeroBackground';
import { HomeNav } from '@/features/home/components/HomeNav';
import { InnovationSection } from '@/features/home/components/InnovationSection';
import { PhilosophySection } from '@/features/home/components/PhilosophySection';
import { ArchitectureSection } from '@/features/home/components/ArchitectureSection';
import BracketsSectionClient from '@/features/home/components/BracketsSectionClient';
import { JoinSection } from '@/features/home/components/JoinSection';
import { ShowcaseSection } from '@/features/home/components/ShowcaseSection';
import { PillarsSection } from '@/features/home/components/PillarsSection';
import { CTASection } from '@/features/home/components/CTASection';
import { ReviewsSection } from '@/features/home/components/ReviewsSection';
import Footer from '@/features/home/components/Footer';
import { SECTION_IDS } from '@/features/home/lib/nav-config';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const heroContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } },
};

/** Anchor target for the navigation menu; offsets the fixed navbar. */
function Anchor({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20">
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const glowY = useTransform(scrollY, [0, 800], [0, 160]);
  const glowOpacity = useTransform(scrollY, [0, 600], [1, 0.2]);
  const heroContentY = useTransform(scrollY, [0, 600], [0, -40]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-[#60A5FA] to-[#2563EB]"
        />

        <HomeNav />

        <main>
          {/* Hero Section */}
          <section className="relative isolate pt-28 pb-8 px-6 md:pt-36 md:pb-16 md:px-12 lg:pt-40 lg:pb-[2cm] lg:px-[2cm] flex flex-col justify-end min-h-screen overflow-hidden bg-black text-center lg:text-left">
            <HeroBackground />

            <motion.div
              aria-hidden="true"
              style={{ y: glowY, opacity: glowOpacity }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-[min(800px,100vw)] w-[min(800px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px] mix-blend-screen"
            />

            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="visible"
              style={{ y: heroContentY }}
              className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
            >
              <div className="lg:col-span-8 space-y-6">
                <motion.span
                  variants={heroItem}
                  className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400 block font-sans"
                >
                  Accept global payments in minutes, not days
                </motion.span>
                <motion.h1
                  variants={heroItem}
                  className="text-3xl md:text-[48px] font-normal tracking-tight text-white leading-[1.2] font-sans"
                >
                  Welcome to the payment platform <br className="hidden md:inline" />
                  connecting the real world <br className="hidden md:inline" />
                  with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#2563EB] font-medium">
                    on-chain technology
                  </span>
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="text-base md:text-[16px] font-light text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans"
                >
                  A unified global platform that allows you to receive payments anywhere in the world with advanced security, optimized conversion, and integration in minutes for any type of personal, business, web, or custom payment.
                </motion.p>
              </div>

              <motion.div variants={heroItem} className="lg:col-span-4 flex lg:justify-end justify-center lg:mb-[1cm] mb-4">
                <Link href="/login?register=true" className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]">
                  <motion.span
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="inline-block px-8 py-2.5 text-base font-normal bg-transparent text-white border border-white/30 rounded-full hover:bg-white/5 hover:border-white/50 transition-colors shadow-lg font-sans"
                  >
                    Start Accepting Payments
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.a
              href={`#${SECTION_IDS.innovation}`}
              aria-label="Scroll to content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8, ease: EASE }}
              className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/50 hover:text-white transition-colors rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="flex">
                <ChevronDown size={28} />
              </motion.span>
            </motion.a>
          </section>

          <Anchor id={SECTION_IDS.innovation}><InnovationSection /></Anchor>
          <Anchor id={SECTION_IDS.philosophy}><PhilosophySection /></Anchor>
          <div id="developers" className="scroll-mt-24" />
          <Anchor id={SECTION_IDS.architecture}><ArchitectureSection /></Anchor>
          <Anchor id={SECTION_IDS.solutions}><BracketsSectionClient /></Anchor>
          <Anchor id={SECTION_IDS.join}><JoinSection /></Anchor>
          <Anchor id={SECTION_IDS.showcase}><ShowcaseSection /></Anchor>
          <Anchor id={SECTION_IDS.pillars}><PillarsSection /></Anchor>
          <CTASection />
          <Anchor id={SECTION_IDS.reviews}><ReviewsSection /></Anchor>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
