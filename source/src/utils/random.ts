export type RNG = () => number;

/** Deterministyczny generator (ten sam seed = te same zadania, np. w wyzwaniu klasowym). */
export function mulberry32(seed: number): RNG {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
export const randInt = (rng: RNG, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
export const pick = <T,>(rng: RNG, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
export function shuffle<T>(rng: RNG, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const sample = <T,>(rng: RNG, arr: readonly T[], n: number) => shuffle(rng, arr).slice(0, n);
/** Losowe, nienachodzące się pozycje (w %) na planszy. */
export function scatter(rng: RNG, n: number, minDist = 18, box = { x0: 10, x1: 90, y0: 12, y1: 88 }) {
  const pts: { x: number; y: number }[] = [];
  let tries = 0;
  while (pts.length < n && tries < 2000) {
    tries++;
    const p = { x: box.x0 + rng() * (box.x1 - box.x0), y: box.y0 + rng() * (box.y1 - box.y0) };
    const d = tries > 1500 ? minDist / 2 : minDist;
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= d)) pts.push(p);
  }
  while (pts.length < n) pts.push({ x: box.x0 + rng() * (box.x1 - box.x0), y: box.y0 + rng() * (box.y1 - box.y0) });
  return pts;
}
