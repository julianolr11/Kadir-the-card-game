import { useEffect } from 'react';

let audioUnlocked = false;

const emitUnlocked = () => {
  window.__kadirAudioUnlocked = true;
  window.dispatchEvent(new Event('kadir-audio-unlocked'));
};

const unlockAudio = async () => {
  if (audioUnlocked || typeof window === 'undefined') return;
  audioUnlocked = true;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const context = window.__kadirAudioContext || new AudioContextClass();
      window.__kadirAudioContext = context;

      if (context.state === 'suspended') {
        await context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.01);
    }

    document.querySelectorAll('audio').forEach((audio) => {
      audio.muted = false;
      audio.load();
    });
  } catch (error) {
    console.warn('[audio] Nao foi possivel destravar o audio automaticamente.', error);
  } finally {
    emitUnlocked();
  }
};

export default function AudioUnlock() {
  useEffect(() => {
    const events = ['pointerdown', 'click', 'keydown', 'touchstart'];

    const handleFirstInteraction = () => {
      unlockAudio();
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleFirstInteraction, true);
      });
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleFirstInteraction, {
        capture: true,
        passive: true,
      });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleFirstInteraction, true);
      });
    };
  }, []);

  return null;
}
