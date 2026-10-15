'use client';
import { useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

/** Seconds of overlap at the very end of the clip (kept short so the whole clip is still shown). */
const CROSSFADE_S = 0.7;
/** The incoming copy starts playing (invisible) this long before the fade, so it is never a frozen frame. */
const WARMUP_S = 0.5;

/**
 * Seamless looping video. A native `loop` visibly jumps back to frame 0, so two stacked copies
 * of the clip alternate: the incoming copy fades in while the outgoing one fades out right
 * before it ends, hiding the restart.
 */
export function PingPongVideo({
    src,
    className = "w-full max-w-5xl mx-auto aspect-video md:aspect-[21/9] relative mb-40 md:mb-64 group",
    videoClassName = "w-full h-full object-cover opacity-80 transition-opacity duration-1000 group-hover:opacity-100 mix-blend-screen"
}: {
    src: string;
    className?: string;
    videoClassName?: string;
}) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([null, null]);
    const activeIdx = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { amount: 0.3 });
    const armed = useInView(containerRef, { amount: 0.3, once: true });

    useEffect(() => {
        const [a, b] = videoRefs.current;
        if (!a || !b || !armed) return;

        if (!isInView) {
            a.pause();
            b.pause();
            return;
        }

        const pair = [a, b];
        let stage: 'idle' | 'warming' | 'fading' = 'idle';
        let raf = 0;
        let timer = 0;

        const show = (el: HTMLVideoElement, visible: boolean) => {
            el.style.transition = `opacity ${CROSSFADE_S}s linear`;
            el.style.opacity = visible ? '1' : '0';
        };

        pair[activeIdx.current].play().catch(() => {});

        const tick = () => {
            const outgoing = pair[activeIdx.current];
            const incoming = pair[1 - activeIdx.current];
            const { duration, currentTime } = outgoing;
            const remaining = duration ? duration - currentTime : Infinity;

            if (stage === 'idle' && remaining <= CROSSFADE_S + WARMUP_S) {
                stage = 'warming';
                incoming.currentTime = 0;
                incoming.play().catch(() => {});
            } else if (stage === 'warming' && remaining <= CROSSFADE_S) {
                stage = 'fading';
                show(incoming, true);
                show(outgoing, false);
                timer = window.setTimeout(() => {
                    outgoing.pause();
                    activeIdx.current = 1 - activeIdx.current;
                    stage = 'idle';
                }, CROSSFADE_S * 1000);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(timer);
        };
    }, [isInView, armed]);

    return (
        <div ref={containerRef} className={`${className} relative`}>
            {[0, 1].map((i) => (
                <video
                    key={i}
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={armed ? src : undefined}
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                    className={`${videoClassName} ${i === 1 ? 'absolute inset-0' : ''}`}
                />
            ))}
        </div>
    );
}
