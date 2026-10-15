'use client';

import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';

/**
 * PageTransition
 * Envuelve {children} del dashboard para producir una transición suave entre
 * rutas sin trabar el scroll.
 *
 * Estrategia de rendimiento:
 *  • `will-change: opacity, transform` → el navegador promueve el layer al compositor GPU.
 *  • `transform: translateZ(0)` → fuerza compositing layer en Safari/iOS.
 *  • Animamos solo `opacity` + traslación mínima en Y (8px).
 *  • `mode="wait"` → la página saliente termina antes de que entre la nueva.
 *  • Reseteamos el scroll del contenedor al cambiar de ruta.
 */

const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

const transition = {
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sube el scroll del contenedor <main> al top en cada cambio de ruta.
  useEffect(() => {
    const scrollable = wrapperRef.current?.closest('[data-scroll-container]') as HTMLElement | null;
    if (scrollable) {
      scrollable.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={wrapperRef} style={{ display: 'contents' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            style={{
              willChange: 'opacity, transform',
              transform: 'translateZ(0)',
              flex: 1,
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
