'use client';

import { useEffect, useRef } from 'react';

export const HERO_VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/luxor-pay-gateway.firebasestorage.app/o/circle%20moving.mp4?alt=media&token=eec834d9-349a-4df8-b3b6-4bb268054c83';

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const play = () => {
      video.play().catch(() => {
        /* autoplay blocked until interaction */
      });
    };

    if (video.readyState >= 2) play();
    else video.addEventListener('loadeddata', play, { once: true });

    return () => video.removeEventListener('loadeddata', play);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center scale-105"
      />

      {/* Soft overlay so text stays readable — video stays visible */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-y-0 left-0 w-[28%] max-w-md bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />
    </div>
  );
}
