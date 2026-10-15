'use client';
import { useEffect, useState } from 'react';

export const HERO_VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fhero-video.mp4?alt=media&token=0d200de8-2247-43a0-a553-a6af3a3f70f4';

type SlowConnection = { connection?: { saveData?: boolean; effectiveType?: string } };

/** True when the visitor asked to save data, prefers reduced motion, or is on a very slow link. */
function shouldSkipVideo(): boolean {
  const conn = (navigator as Navigator & SlowConnection).connection;
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    Boolean(conn?.saveData) ||
    conn?.effectiveType === 'slow-2g' ||
    conn?.effectiveType === '2g'
  );
}

export function HeroBackground() {
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  // The hero clip is large: let the page (HTML, JS, fonts) finish first, then start streaming it.
  useEffect(() => {
    if (shouldSkipVideo()) return;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => setLoad(true), 300);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {load && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${playing ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}

      {/* Edge gradient overlays for text readability and smooth background transition */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
    </div>
  );
}
