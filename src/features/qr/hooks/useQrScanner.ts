'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const JSQR_SCRIPT = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';

type JsQrFn = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: string }
) => { data: string } | null;

declare global {
  interface Window {
    jsQR?: JsQrFn;
  }
}

function loadJsQr(): Promise<void> {
  if (window.jsQR) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${JSQR_SCRIPT}"]`);
    if (existing) {
      if (window.jsQR) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load jsQR')));
      return;
    }

    const script = document.createElement('script');
    script.src = JSQR_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsQR'));
    document.head.appendChild(script);
  });
}

export interface UseQrScannerOptions {
  enabled: boolean;
  onDetect: (data: string) => void;
  cameraErrorMessage?: string;
}

export function useQrScanner({
  enabled,
  onDetect,
  cameraErrorMessage = 'No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.',
}: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      setError(null);
      return;
    }

    let cancelled = false;
    let rafId = 0;

    async function start() {
      try {
        await loadJsQr();
        if (cancelled) return;

        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();

        function tick() {
          if (cancelled || !streamRef.current) return;

          const canvas = canvasRef.current;
          const vid = videoRef.current;
          if (!canvas || !vid || vid.readyState !== vid.HAVE_ENOUGH_DATA) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            rafId = requestAnimationFrame(tick);
            return;
          }

          canvas.height = vid.videoHeight;
          canvas.width = vid.videoWidth;
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR?.(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code?.data) {
            stopCamera();
            onDetectRef.current(code.data.trim());
            return;
          }

          rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(cameraErrorMessage);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stopCamera();
    };
  }, [enabled, stopCamera, cameraErrorMessage]);

  return { videoRef, canvasRef, error, stopCamera };
}
