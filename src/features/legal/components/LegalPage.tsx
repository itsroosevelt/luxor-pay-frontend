import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlueParticles } from '@/components/ui/BlueParticles';

export type LegalSection = { heading: string; body: (string | string[])[] };

const backLinkClass =
    'inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60A5FA] rounded';

/** Plain, server-rendered page for legal documents (indexable, no client JS). */
export default function LegalPage({
    title,
    updated,
    intro,
    sections,
}: {
    title: string;
    updated: string;
    intro: string;
    sections: LegalSection[];
}) {
    return (
        <main className="relative min-h-screen bg-black text-white/80 px-6 pt-32 pb-24">
            <BlueParticles />
            <article className="relative z-10 max-w-3xl mx-auto">
                <Link href="/" className={`${backLinkClass} mb-10`}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <h1 className="text-white text-4xl md:text-5xl font-[var(--font-outfit)] font-medium tracking-tight">{title}</h1>
                <p className="mt-3 text-sm text-white/40">Last updated: {updated}</p>
                <p className="mt-8 leading-relaxed">{intro}</p>

                {sections.map((s, i) => (
                    <section key={s.heading} className="mt-10">
                        <h2 className="text-white text-xl font-medium mb-3">
                            {i + 1}. {s.heading}
                        </h2>
                        <div className="space-y-3 leading-relaxed">
                            {s.body.map((block, j) =>
                                Array.isArray(block) ? (
                                    <ul key={j} className="list-disc pl-6 space-y-1.5">
                                        {block.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p key={j}>{block}</p>
                                )
                            )}
                        </div>
                    </section>
                ))}

                <div className="mt-16 pt-8 border-t border-white/10">
                    <Link href="/" className={backLinkClass}>
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </article>
        </main>
    );
}
