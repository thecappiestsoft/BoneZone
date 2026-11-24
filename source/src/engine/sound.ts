/** Efekty dźwiękowe syntezowane w Web Audio API – bez plików, działa offline. */
let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.6;

export function configureSound(on: boolean, vol: number) {
  enabled = on;
  volume = vol;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', delay = 0, gain = 0.25, slideTo?: number) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * volume), t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export type Sfx = 'click' | 'pop' | 'wrong' | 'good' | 'super' | 'fail' | 'timeout' | 'combo' | 'start' | 'beat' | 'tick' | 'end';

export function sfx(name: Sfx) {
  if (!enabled || volume <= 0) return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    switch (name) {
      case 'click': tone(660, 0.06, 'square', 0, 0.08); break;
      case 'pop': tone(520, 0.09, 'triangle', 0, 0.25, 900); break;
      case 'wrong': tone(180, 0.18, 'sawtooth', 0, 0.15, 120); break;
      case 'good': tone(660, 0.1, 'triangle'); tone(880, 0.14, 'triangle', 0.09); break;
      case 'super': tone(660, 0.08, 'triangle'); tone(880, 0.08, 'triangle', 0.07); tone(1175, 0.18, 'triangle', 0.14); break;
      case 'fail': tone(330, 0.14, 'square', 0, 0.12); tone(247, 0.24, 'square', 0.12, 0.12); break;
      case 'timeout': tone(440, 0.12, 'sawtooth', 0, 0.12); tone(330, 0.12, 'sawtooth', 0.12, 0.12); tone(220, 0.25, 'sawtooth', 0.24, 0.12); break;
      case 'combo': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, 'square', i * 0.06, 0.1)); break;
      case 'start': tone(392, 0.08, 'square', 0, 0.1); tone(784, 0.16, 'square', 0.08, 0.1); break;
      case 'beat': tone(70, 0.12, 'sine', 0, 0.6, 50); tone(60, 0.1, 'sine', 0.16, 0.45, 45); break;
      case 'tick': tone(1200, 0.03, 'square', 0, 0.05); break;
      case 'end': [784, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', i * 0.12, 0.2)); break;
    }
  } catch {
    /* brak audio – gra działa dalej */
  }
}
