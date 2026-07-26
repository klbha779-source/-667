import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface SupervisorCameraProps {
  onPause: () => void;
  onResume: () => void;
}

export default function SupervisorCamera({ onPause, onResume }: SupervisorCameraProps) {
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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

  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover opacity-30" // 30% opacity to act as a background
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
    </div>
  );
}
