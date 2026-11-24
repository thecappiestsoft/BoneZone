import { useEffect, useRef } from 'react';
import type { MiniGameProps } from '../../types';
import { sfx } from '../../engine/sound';

/**
 * Licznik pomyłek: każda pomyłka jest zgłaszana do silnika (kara punktowa),
 * a przekroczenie limitu kończy zadanie niepowodzeniem.
 */
export function useMistakes(p: MiniGameProps, allowed: number) {
  const count = useRef(0);
  return (failInfo?: string) => {
    count.current++;
    p.onMistake();
    sfx('wrong');
    if (count.current > allowed) p.onDone({ success: false, info: failInfo });
    return count.current;
  };
}

/** Pętla animacji z obsługą pauzy. dt w sekundach. */
export function useLoop(cb: (dt: number) => void, paused: boolean) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      cbRef.current(dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
}

/** setTimeout respektujący pauzę (odlicza tylko czas gry). */
export function usePausableTimeout(paused: boolean, ms: number | null, cb: () => void) {
  const left = useRef(ms);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    left.current = ms;
  }, [ms]);
  useEffect(() => {
    if (paused || left.current == null) return;
    const started = performance.now();
    const t = setTimeout(() => {
      left.current = null;
      cbRef.current();
    }, left.current);
    return () => {
      clearTimeout(t);
      if (left.current != null) left.current = Math.max(0, left.current - (performance.now() - started));
    };
  }, [paused, ms]);
}

/** Skróty klawiszowe 1–9 dla przycisków wyboru. */
export function useNumberKeys(count: number, onPick: (i: number) => void, enabled = true) {
  const ref = useRef(onPick);
  ref.current = onPick;
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= count) ref.current(n - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [count, enabled]);
}
