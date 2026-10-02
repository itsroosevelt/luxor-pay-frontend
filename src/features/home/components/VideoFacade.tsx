'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';

export function VideoFacade({ videoId, title, autoPlay = false }: { videoId: string, title: string, autoPlay?: boolean }) {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoPlaying, setVideoPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const durationRef = useRef(100); 
    const isInView = useInView(containerRef, { amount: 0.3 }); // Activa al ver el 30% del video
    const wasPlayingRef = useRef(autoPlay);

    // Custom Cursor State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    useEffect(() => {
        setIsPlaying(autoPlay);
        setVideoPlaying(autoPlay);
    }, [videoId, autoPlay]);

    // Handle visibility changes to pause/resume
    useEffect(() => {
        if (!iframeRef.current) return;
        
        if (isInView) {
            if (wasPlayingRef.current) {
                iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
                setVideoPlaying(true);
            }
        } else {
            // Guardar el estado actual antes de pausar
            wasPlayingRef.current = videoPlaying;
            if (videoPlaying) {
                iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
                setVideoPlaying(false);
            }
        }
    }, [isInView]);

    // Read time updates directly from iframe
    useEffect(() => {
        if (!isPlaying) return;

        const handleMessage = (e: MessageEvent) => {
            if (e.origin !== "https://www.youtube.com") return;
            try {
                const data = JSON.parse(e.data);
                if (data.event === 'infoDelivery' && data.info) {
                    if (data.info.duration) durationRef.current = data.info.duration;
                    if (data.info.currentTime && durationRef.current) {
                        setProgress((data.info.currentTime / durationRef.current) * 100);
                    }
                }
            } catch (err) { }
        };

        window.addEventListener('message', handleMessage);

        // Poll the iframe config to ensure it starts sending messages
        const ping = setInterval(() => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
            }
        }, 1000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearInterval(ping);
        };
    }, [isPlaying]);

    const togglePlay = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!iframeRef.current) return;
        const func = videoPlaying ? 'pauseVideo' : 'playVideo';
        iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func }), '*');
        setVideoPlaying(!videoPlaying);
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!iframeRef.current) return;
        const func = isMuted ? 'unMute' : 'mute';
        iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func }), '*');
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!iframeRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const targetPercent = Math.max(0, Math.min(1, clickX / rect.width));
        const targetTime = targetPercent * durationRef.current;

        iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [targetTime, true] }), '*');
        setProgress(targetPercent * 100);
    };

    if (isPlaying) {
        return (
            <div ref={containerRef} className="absolute inset-0 w-full h-full group bg-black">
                <iframe
                    ref={iframeRef}
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    return (
        <div
            className="absolute inset-0 w-full h-full cursor-none group bg-black overflow-hidden"
            onClick={() => setIsPlaying(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                alt={title}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
            />
            
            {/* Oscurecimiento leve en hover para que resalte más el botón */}
            <div className={`absolute inset-0 bg-black/30 transition-opacity duration-500 pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`} />

            {/* Custom Mouse Cursor Button */}
            <AnimatePresence>
                {isHovering && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            x: mousePos.x - 78, // Desplazamiento aproximado a la mitad del ancho del botón
                            y: mousePos.y - 24  // Desplazamiento a la mitad del alto
                        }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 450, 
                            damping: 28,
                            mass: 0.5
                        }}
                        className="absolute top-0 left-0 pointer-events-none z-50 flex items-center justify-center gap-2 bg-white text-black pl-4 pr-5 py-2.5 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.5)] font-semibold tracking-tight text-[15px] whitespace-nowrap"
                    >
                        <Play size={15} fill="currentColor" />
                        <span>Watch video</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
