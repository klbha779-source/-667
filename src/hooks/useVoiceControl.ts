import { useEffect, useRef, useState } from 'react';

interface VoiceControlOptions {
  onPause: () => void;
  onResume: () => void;
  enabled?: boolean;
}

export function useVoiceControl({ onPause, onResume, enabled = true }: VoiceControlOptions) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Arabic

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      // Auto restart if still enabled
      if (enabled && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        
        // Check for pause keywords
        // "وقف", "توقف", "اوقت", "أوقف", "وقف العداد", "إيقاف", "ايقاف", "قف"
        if (
          transcript.includes('وقف') ||
          transcript.includes('توقف') ||
          transcript.includes('اوقف') ||
          transcript.includes('أوقف') ||
          transcript.includes('إيقاف') ||
          transcript.includes('ايقاف') ||
          transcript.includes('استراحة') ||
          transcript.includes('قف')
        ) {
          setLastCommand('إيقاف مؤقت ⏸️');
          onPause();
          setTimeout(() => setLastCommand(null), 3000);
        }
        // Check for resume keywords
        // "استمر", "شغل", "واصل", "متابعة", "كمل", "ابدأ", "ابدا"
        else if (
          transcript.includes('استمر') ||
          transcript.includes('شغل') ||
          transcript.includes('واصل') ||
          transcript.includes('متابعة') ||
          transcript.includes('كمل') ||
          transcript.includes('ابدأ') ||
          transcript.includes('ابدا') ||
          transcript.includes('انطلق')
        ) {
          setLastCommand('استمرار التشغيل ▶️');
          onResume();
          setTimeout(() => setLastCommand(null), 3000);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    };
  }, [enabled, onPause, onResume]);

  return { isListening, lastCommand };
}
