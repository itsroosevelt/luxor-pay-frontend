'use client';

export const HERO_VIDEO_URL =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Fhero-video.mp4?alt=media&token=0d200de8-2247-43a0-a553-a6af3a3f70f4';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Edge gradient overlays for text readability and smooth background transition */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
    </div>
  );
}
