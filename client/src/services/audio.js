/**
 * Simple notification beep synthesized with the Web Audio API.
 * No external audio files required.
 */
let ctx = null;

function getCtx() {
  if (!ctx && typeof AudioContext !== 'undefined') {
    ctx = new AudioContext();
  }
  return ctx;
}

export const playNotificationSound = () => {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime;
    const osc1 = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const gain = ac.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc2.frequency.setValueAtTime(1046, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ac.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  } catch (e) {
    // Silently fail if audio is not available
  }
};
