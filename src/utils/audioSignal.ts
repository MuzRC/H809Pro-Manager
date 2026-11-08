// Web Audio API tone generator for antenna pointing / signal aiming
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isAudioRunning = false;

export function initAudioTone(): boolean {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    return true;
  } catch (err) {
    console.error('Failed to init audio context', err);
    return false;
  }
}

export function startSignalBeeper(rsrp: number): boolean {
  if (isAudioRunning) {
    updateSignalTone(rsrp);
    return true;
  }

  const initialized = initAudioTone();
  if (!initialized || !audioCtx) return false;

  try {
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    // Map RSRP (-120 dBm to -60 dBm) to frequency (300Hz to 1200Hz)
    const freq = calculateFrequencyFromRsrp(rsrp);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Subtle gain volume so it is comfortable
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    isAudioRunning = true;
    return true;
  } catch (err) {
    console.error('Error starting signal tone', err);
    return false;
  }
}

export function updateSignalTone(rsrp: number) {
  if (!isAudioRunning || !oscillator || !audioCtx) return;
  const targetFreq = calculateFrequencyFromRsrp(rsrp);
  oscillator.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
}

export function stopSignalBeeper() {
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch {
      // ignore
    }
    oscillator = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch {
      // ignore
    }
    gainNode = null;
  }
  isAudioRunning = false;
}

function calculateFrequencyFromRsrp(rsrp: number): number {
  // Clamped between -120 (very weak, 280Hz) to -60 (strongest, 1200Hz)
  const clamped = Math.max(-120, Math.min(-60, rsrp));
  const normalized = (clamped - (-120)) / (-60 - (-120)); // 0.0 to 1.0
  return Math.round(280 + normalized * 920);
}
