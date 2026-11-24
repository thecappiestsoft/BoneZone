import { useEffect, useRef, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, randInt } from '../utils/random';
import { lv } from '../utils/level';
import { useLoop } from './common/hooks';
import { L,  } from '../i18n';

/** Goniometr: zatrzymaj ramię goniometru na właściwym kącie zgięcia w stawie. */
export default function Goniometer(p: MiniGameProps) {
  const [task] = useState(() => {
    if (p.level === 'primary')
      return { prompt: L(<>Zegnij łokieć do <b>kąta prostego</b> – zatrzymaj wskazówkę w <b>zielonej strefie</b>.</>, <>Bend the elbow to a <b>right angle</b> – stop the pointer in the <b>green zone</b>.</>), lo: 82, hi: 98, showZone: true, info: L('Kąt prosty to 90°. Staw łokciowy pozwala zginać i prostować przedramię.', 'A right angle is 90°. The elbow joint lets the forearm bend and straighten.') };
    if (p.level === 'highschool' || p.rng() < 0.4) {
      const t = pick(p.rng, [30, 45, 60, 90, 120, 135]);
      return { prompt: L(<>Pomiar goniometrem: ustaw zgięcie w stawie łokciowym na <b>{t}°</b>.</>, <>Goniometer: set elbow flexion to <b>{t}°</b>.</>), lo: t - 6, hi: t + 6, showZone: false, info: L('Goniometr mierzy kąt (w stopniach) między osiami kości tworzących staw – tak ocenia się zakres ruchu.', 'A goniometer measures the angle (in degrees) between the bones forming a joint – this is how range of motion is assessed.') };
    }
    const flex = pick(p.rng, [120, 130, 140]);
    const def = pick(p.rng, [10, 15, 20, 25]);
    const rom = flex - def;
    return { prompt: L(<>Pacjent (dane szkoleniowe): zgięcie do <b>{flex}°</b>, wyprost tylko do <b>{def}°</b>. Oblicz <b>zakres ruchu = zgięcie − wyprost</b> i zatrzymaj na nim wskazówkę.</>, <>Patient (training data): flexion to <b>{flex}°</b>, extension only to <b>{def}°</b>. Calculate <b>range of motion = flexion − extension</b> and stop the pointer on it.</>), lo: rom - 5, hi: rom + 5, showZone: false, info: L(`Zakres ruchu = ${flex}° − ${def}° = ${rom}°. Pomiary zakresu ruchu wykorzystuje się m.in. w rehabilitacji.`, `Range of motion = ${flex}° − ${def}° = ${rom}°. Range-of-motion measurements are used e.g. in rehabilitation.`) };
  });
  const period = lv(p.level, 3.4, 2.8, 2.4) / (1 + p.intensity * 0.15);
  const phase = useRef(randInt(p.rng, 0, 100) / 100);
  const [val, setVal] = useState(0);
  const stopped = useRef(false);
  useLoop((dt) => {
    if (stopped.current) return;
    phase.current += dt / period;
    setVal(90 - 90 * Math.cos(phase.current * Math.PI * 2) * 0.98);
  }, p.paused);
  const stop = () => {
    if (stopped.current) return;
    stopped.current = true;
    const v = Math.round(val);
    const ok = v >= task.lo && v <= task.hi;
    p.onDone({ success: ok, info: ok ? task.info : L(`Zatrzymano na ${v}° (cel: ${task.lo}–${task.hi}°). ${task.info}`, `Stopped at ${v}° (target: ${task.lo}–${task.hi}°). ${task.info}`) });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); stop(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  // 0° = przedramię w przedłużeniu ramienia (w prawo), 180° = całkowicie zgięte (w lewo)
  const pt = (deg: number, r: number) => { const a = (-deg * Math.PI) / 180; return [180 + Math.cos(a) * r, 170 + Math.sin(a) * r]; };
  const arc = (a: number, b: number, r: number) => { const [x1, y1] = pt(a, r); const [x2, y2] = pt(b, r); return `M${x1} ${y1} A${r} ${r} 0 0 0 ${x2} ${y2}`; };
  const [fx, fy] = pt(val, 130);
  return (
    <div className="mg">
      <p className="prompt">{task.prompt}</p>
      <div className="gauge">
        <svg viewBox="0 -18 360 218" aria-hidden>
          <path d={arc(0, 180, 145)} stroke="#e2e8f0" strokeWidth="22" fill="none" />
          {task.showZone && <path d={arc(task.lo, task.hi, 145)} stroke="#22c55e" strokeWidth="22" fill="none" />}
          {Array.from({ length: 13 }, (_, i) => i * 15).map((v) => {
            const [x1, y1] = pt(v, 134); const [x2, y2] = pt(v, 156); const [tx, ty] = pt(v, 170);
            return <g key={v}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={v % 45 ? 1.5 : 3} /><text x={tx} y={ty + 4} fontSize="11" textAnchor="middle" fill="#334155">{v}°</text></g>;
          })}
          {/* ramię (nieruchome) i przedramię (ruchome) */}
          <line x1="180" y1="170" x2="40" y2="190" stroke="#7c5a2a" strokeWidth="16" strokeLinecap="round" />
          <line x1="180" y1="170" x2="40" y2="190" stroke="#f5ecd7" strokeWidth="10" strokeLinecap="round" />
          <line x1="180" y1="170" x2={fx} y2={fy} stroke="#7c5a2a" strokeWidth="14" strokeLinecap="round" />
          <line x1="180" y1="170" x2={fx} y2={fy} stroke="#f5ecd7" strokeWidth="8" strokeLinecap="round" />
          <circle cx="180" cy="170" r="12" fill="#c2410c" stroke="#1e293b" strokeWidth="3" />
        </svg>
        <div className="gauge-readout">{Math.round(val)}°</div>
      </div>
      <button className="btn big danger stop-btn" onClick={stop}>STOP <small>({L('spacja', 'space')})</small></button>
    </div>
  );
}
