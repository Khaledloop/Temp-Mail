/**
 * Lightweight audio notification helper for new messages.
 */

let audioContext: AudioContext | null = null;
let lastPlayAt = 0;

export async function playNewEmailSound(): Promise<void> {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  if (now - lastPlayAt < 1500) return; // throttle
  lastPlayAt = now;

  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch {
      return;
    }
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 880;

  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  const start = audioContext.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

  oscillator.start();
  oscillator.stop(start + 0.25);
}
