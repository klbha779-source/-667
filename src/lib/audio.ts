// Audio cues with loud ring alarms for match finish and session transitions
export function playLoudRingAlarm(message?: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Create a dual-tone stadium bell / alarm sequence lasting 5 seconds
    const duration = 5.0; // 5 seconds
    const now = ctx.currentTime;

    // Master volume gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.8, now);
    masterGain.connect(ctx.destination);

    // High frequency bell oscillator
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const ringGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5 note

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1760, now); // A6 note

    osc1.connect(ringGain);
    osc2.connect(ringGain);
    ringGain.connect(masterGain);

    // Pulse gain 10 times in 5 seconds (0.25s ON, 0.25s OFF)
    const pulses = 10;
    const pulseLen = duration / pulses;

    for (let i = 0; i < pulses; i++) {
      const pStart = now + i * pulseLen;
      const pOn = pStart + 0.05;
      const pOff = pStart + pulseLen - 0.05;

      ringGain.gain.setValueAtTime(0.01, pStart);
      ringGain.gain.linearRampToValueAtTime(0.7, pOn);
      ringGain.gain.setValueAtTime(0.7, pOff - 0.05);
      ringGain.gain.linearRampToValueAtTime(0.01, pOff);

      // Trigger phone vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        setTimeout(() => {
          try { navigator.vibrate(350); } catch { /* ignore */ }
        }, i * pulseLen * 1000);
      }
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    // Optional voice announcement after the 5-second ring
    if (message) {
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'ar-SA';
          const voices = window.speechSynthesis.getVoices();
          const arVoice = voices.find((v) => v.lang.startsWith('ar'));
          if (arVoice) {
            utterance.voice = arVoice;
          }
          window.speechSynthesis.speak(utterance);
        }
      }, 5200);
    }
  } catch (e) {
    console.error('Loud audio ring failed:', e);
  }
}

export function playAudioCue(type: 'focus' | 'break' | 'alarm', message?: string) {
  if (type === 'alarm' || type === 'break') {
    playLoudRingAlarm(message);
  } else {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);

      if (message && 'speechSynthesis' in window) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'ar-SA';
          window.speechSynthesis.speak(utterance);
        }, 1300);
      }
    } catch {
      // Audio fallback
    }
  }
}
