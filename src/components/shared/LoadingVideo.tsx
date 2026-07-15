const LOADING_VIDEO_SRC =
  'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Luxor%20Pay%2Floading.mp4?alt=media&token=b786c876-fc50-4d96-9da3-5914f964a61d';

interface LoadingVideoProps {
  className?: string;
}

// Inline loading indicator (no wrapper container) reused across the dashboard.
// Defaults to the same size used in the geolocation permission button.
export function LoadingVideo({ className = 'w-auto h-5' }: LoadingVideoProps) {
  return (
    <video
      src={LOADING_VIDEO_SRC}
      autoPlay
      loop
      muted
      playsInline
      className={className}
    />
  );
}
