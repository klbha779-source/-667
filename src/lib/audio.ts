// Simple oscillator-based audio cues
export function playAudioCue(type: 'focus' | 'recall' | 'break' | 'review', message?: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Play a 5-second intermittent alert (beeping)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    
    // Create 5 beeps over 5 seconds (each beep is 0.5s on, 0.5s off)
    for (let i = 0; i < 5; i++) {
      const startTime = ctx.currentTime + i;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.1);
      gainNode.gain.setValueAtTime(0.5, startTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.5);
      
      if (navigator.vibrate) {
        setTimeout(() => navigator.vibrate(400), i * 1000);
      }
    }

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 5);

    // After the 5-second alarm, speak the interactive message
    if (message) {
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'ar-SA';
          // Try to find an Arabic voice if available
          const voices = window.speechSynthesis.getVoices();
          const arVoice = voices.find(v => v.lang.startsWith('ar'));
          if (arVoice) {
            utterance.voice = arVoice;
          }
          window.speechSynthesis.speak(utterance);
        }
      }, 5500); // Wait 5.5 seconds before speaking
    }
    
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}
