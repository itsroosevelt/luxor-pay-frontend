'use client';

import styled from 'styled-components';
import { useQrScanner } from '@/hooks/useQrScanner';

const CameraContainer = styled.div<{ $borderRadius?: number; $margin?: string }>`
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  background: #000;
  border-radius: ${({ $borderRadius = 24 }) => $borderRadius}px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: ${({ $margin = '0 0 24px 0' }) => $margin};
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScanOverlay = styled.div`
  position: absolute;
  top: 15%;
  left: 15%;
  right: 15%;
  bottom: 15%;
  border: 2px dashed #60a5fa;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #60a5fa;
    box-shadow: 0 0 10px #2563eb;
    animation: qrScanAnimation 2.5s linear infinite;
  }

  @keyframes qrScanAnimation {
    0% {
      top: 0%;
    }
    50% {
      top: 100%;
    }
    100% {
      top: 0%;
    }
  }
`;

export interface QrCameraScannerProps {
  enabled: boolean;
  onDetect: (data: string) => void;
  cameraErrorMessage?: string;
  borderRadius?: number;
  margin?: string;
}

export function QrCameraScanner({
  enabled,
  onDetect,
  cameraErrorMessage,
  borderRadius,
  margin,
}: QrCameraScannerProps) {
  const { videoRef, canvasRef, error } = useQrScanner({
    enabled,
    onDetect,
    cameraErrorMessage,
  });

  if (error) {
    return (
      <div style={{ color: '#F87171', marginBottom: '24px', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <CameraContainer $borderRadius={borderRadius} $margin={margin}>
        <VideoElement ref={videoRef} />
        <ScanOverlay />
      </CameraContainer>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
