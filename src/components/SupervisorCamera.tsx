import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface SupervisorCameraProps {
  onPause: () => void;
  onResume: () => void;
  isLandscape?: boolean;
  cameraRotation?: number;
  fitMode?: 'contain' | 'cover';
}

export default function SupervisorCamera({ 
  onPause, 
  onResume, 
  isLandscape = false,
  cameraRotation = 0,
  fitMode = 'contain'
}: SupervisorCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const isPresentRef = useRef<boolean>(true);
  const absentFramesRef = useRef<number>(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!isModelLoaded) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Apply hardware wide-angle / minimum zoom if camera hardware supports it
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
          if (capabilities && capabilities.zoom) {
            try {
              await track.applyConstraints({
                advanced: [{ zoom: capabilities.zoom.min }] as any
              });
            } catch (e) {
              console.log('Zoom constraint error:', e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to start camera", err);
      }
    };

    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded]);

  useEffect(() => {
    if (!isModelLoaded) return;
    let interval: NodeJS.Timeout;

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions());
        
        if (detections.length > 0) {
          // Face found
          absentFramesRef.current = 0;
          if (!isPresentRef.current) {
            isPresentRef.current = true;
            onResume();
          }
        } else {
          // No face found
          absentFramesRef.current += 1;
          // Wait for ~3 continuous empty frames to avoid false positives (blinks/fast movements)
          if (absentFramesRef.current > 3 && isPresentRef.current) {
            isPresentRef.current = false;
            onPause();
          }
        }
      }
    };

    interval = setInterval(detect, 500); // 2 fps

    return () => clearInterval(interval);
  }, [isModelLoaded, onPause, onResume]);

  const isRotated90 = cameraRotation % 180 !== 0;

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          transform: `translate(-50%, -50%) rotate(${cameraRotation}deg) scaleX(-1)`,
        }}
        className={`absolute top-1/2 left-1/2 ${
          fitMode === 'contain' 
            ? (isRotated90 ? 'w-[100vh] h-[100vw] max-w-[100vh] max-h-[100vw]' : 'w-full h-full max-w-full max-h-full')
            : (isRotated90 ? 'w-[100vh] h-[100vw] min-w-[100vh] min-h-[100vw]' : 'w-full h-full min-w-full min-h-full')
        } ${fitMode === 'contain' ? 'object-contain' : 'object-cover'} opacity-55 transition-all duration-300 pointer-events-none`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />
    </div>
  );
}
