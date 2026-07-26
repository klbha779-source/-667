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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState<'PRESENT' | 'CHECKING' | 'ABSENT'>('PRESENT');
  const [countdown, setCountdown] = useState<number>(3);

  const isPresentRef = useRef<boolean>(true);
  const absentCounterRef = useRef<number>(0);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const lastPresenceTimeRef = useRef<number>(Date.now());

  // Load Face-API models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        // Fallback to motion-only detection if models fail to load from CDN
        setIsModelLoaded(true);
      }
    };
    loadModels();
  }, []);

  // Initialize offscreen canvas for motion/presence analysis
  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    canvasRef.current.width = 64;
    canvasRef.current.height = 64;
  }, []);

  // Start Camera Stream
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

  // Motion & Presence detection algorithm
  const detectMotionOrPresence = (): boolean => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
      return true; // Assume present if video not ready yet
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;

    ctx.drawImage(videoRef.current, 0, 0, 64, 64);
    const frame = ctx.getImageData(0, 0, 64, 64);
    const data = frame.data;

    if (!prevFrameDataRef.current) {
      prevFrameDataRef.current = data;
      return true;
    }

    const prevData = prevFrameDataRef.current;
    let totalDiff = 0;

    // Calculate pixel difference between consecutive frames
    for (let i = 0; i < data.length; i += 8) { // sample every 2nd pixel
      const diffR = Math.abs(data[i] - prevData[i]);
      const diffG = Math.abs(data[i + 1] - prevData[i + 1]);
      const diffB = Math.abs(data[i + 2] - prevData[i + 2]);
      totalDiff += (diffR + diffG + diffB) / 3;
    }

    prevFrameDataRef.current = data;
    const avgDiffPerPixel = totalDiff / (data.length / 8);

    // If there is active movement/change in the room (writing, breathing, moving hand)
    return avgDiffPerPixel > 1.2;
  };

  // Main Detection Loop (Face + Motion Dual Verification)
  useEffect(() => {
    if (!isModelLoaded) return;
    let interval: NodeJS.Timeout;

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        let personDetected = false;

        // 1. Try Face Detection
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2 })
          );
          if (detections.length > 0) {
            personDetected = true;
          }
        } catch (e) {
          // If face detector throws error, fall back gracefully
        }

        // 2. Try Motion / Visual activity detection as secondary verification
        const hasMotion = detectMotionOrPresence();
        if (hasMotion) {
          personDetected = true;
        }

        const now = Date.now();

        if (personDetected) {
          // Reset absent counter & update last seen timestamp
          absentCounterRef.current = 0;
          lastPresenceTimeRef.current = now;
          
          if (!isPresentRef.current) {
            isPresentRef.current = true;
            setPresenceStatus('PRESENT');
            onResume();
          } else {
            setPresenceStatus('PRESENT');
          }
        } else {
          // No face & no motion detected
          const timeSinceLastPresenceSec = (now - lastPresenceTimeRef.current) / 1000;
          absentCounterRef.current += 1;

          if (timeSinceLastPresenceSec < 4) {
            // Buffer time (user might be sitting still reading)
            setPresenceStatus('CHECKING');
            setCountdown(Math.max(1, Math.ceil(4 - timeSinceLastPresenceSec)));
          } else {
            // Person has truly left the room for > 4 continuous seconds
            if (isPresentRef.current) {
              isPresentRef.current = false;
              setPresenceStatus('ABSENT');
              onPause();
            }
          }
        }
      }
    };

    interval = setInterval(detect, 500); // Check every 500ms

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
      
      {/* Presence Status Toast Overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        {presenceStatus === 'PRESENT' && (
          <div className="bg-emerald-950/80 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>متواجد أمام الكاميرا 🟢 (العداد يعمل)</span>
          </div>
        )}
        {presenceStatus === 'CHECKING' && (
          <div className="bg-amber-950/90 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-amber-500/40 backdrop-blur-md flex items-center gap-2 shadow-lg animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>جاري التحقق من مغادرة الكرسي... ({countdown}ث) 🟡</span>
          </div>
        )}
        {presenceStatus === 'ABSENT' && (
          <div className="bg-rose-950/90 text-rose-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-500/40 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>تم التوقف لتغيب الشخص عن الكاميرا 🔴</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none" />
    </div>
  );
}

