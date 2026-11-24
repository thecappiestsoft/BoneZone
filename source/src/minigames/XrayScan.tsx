import { useEffect, useRef, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, randInt } from '../utils/random';
import { lv } from '../utils/level';
import { useLoop } from './common/hooks';
import { L,  } from '../i18n';

const REGIONS = [
  { id: 'nasada-bliz', name: ['NASADZIE BLIŻSZEJ', 'PROXIMAL EPIPHYSIS'] as [string, string], lo: 4, hi: 20 },
  { id: 'trzon', name: ['TRZONIE', 'SHAFT'] as [string, string], lo: 30, hi: 70 },
  { id: 'nasada-dal', name: ['NASADZIE DALSZEJ', 'DISTAL EPIPHYSIS'] as [string, string], lo: 82, hi: 96 },
];

/** Skaner RTG: zatrzymaj linię skanera nad wskazanym miejscem kości udowej. */
export default function XrayScan(p: MiniGameProps) {
  const [task] = useState(() => {
    if (p.level === 'primary' || p.rng() < 0.3) {
      const c = randInt(p.rng, 36, 64);
      return { kind: 'crack' as const, crack: c, lo: c - 5, hi: c + 5, label: L('ZŁAMANIU', 'FRACTURE'), info: L('Na zdjęciu RTG złamanie widać jako ciemną szczelinę przerywającą ciągłość kości.', 'On an X-ray a fracture shows as a dark gap breaking the continuity of the bone.') };
    }
    const r = pick(p.rng, REGIONS);
    return { kind: 'region' as const, crack: null, lo: r.lo, hi: r.hi, label: L(...r.name), info: L('Kość udowa: nasada bliższa (z głową, przy stawie biodrowym), trzon i nasada dalsza (przy stawie kolanowym).', 'Femur: proximal epiphysis (with the head, at the hip), shaft and distal epiphysis (at the knee).') };
  });
  const period = lv(p.level, 3.6, 3, 2.5) / (1 + p.intensity * 0.15);
  const ph = useRef(randInt(p.rng, 0, 100) / 100);
  const [x, setX] = useState(0);
  const stopped = useRef(false);
  useLoop((dt) => {
    if (stopped.current) return;
    ph.current += dt / period;
    setX(50 - 48 * Math.cos(ph.current * Math.PI * 2));
  }, p.paused);
  const stop = () => {
    if (stopped.current) return;
    stopped.current = true;
    const ok = x >= task.lo && x <= task.hi;
    p.onDone({ success: ok, info: ok ? task.info : `${L('Skaner zatrzymał się poza celem.', 'The scanner stopped off target.')} ${task.info}` });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); stop(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const hints = p.level !== 'technical';
  return (
    <div className="mg">
      <p className="prompt">{L(<>Zatrzymaj skaner RTG na <b>{task.label}</b> kości udowej.</>, <>Stop the X-ray scanner on the <b>{task.label}</b> of the femur.</>)}</p>
      <div className="xray">
        <svg viewBox="0 0 500 160" preserveAspectRatio="none" aria-hidden>
          <rect width="500" height="160" fill="#0b1120" />
          <g fill="#cbd5e1" opacity=".92">
            <circle cx="40" cy="52" r="26" />
            <path d="M52 62 L98 86 L98 104 L46 74Z" />
            <ellipse cx="96" cy="96" rx="20" ry="26" />
            <rect x="96" y="80" width="330" height="34" rx="12" />
            <ellipse cx="452" cy="82" rx="30" ry="22" />
            <ellipse cx="452" cy="116" rx="30" ry="22" />
          </g>
          <rect x="110" y="88" width="300" height="18" rx="8" fill="#64748b" opacity=".55" />
          {task.crack !== null && <path d={`M${task.crack * 5} 74 l8 14 l-10 10 l8 18`} stroke="#0b1120" strokeWidth="5" fill="none" />}
          {hints && <text x="8" y="150" fontSize="13" fill="#94a3b8">{L('← staw biodrowy (bliżej tułowia)', '← hip joint (closer to the trunk)')}</text>}
          {hints && <text x="492" y="150" fontSize="13" fill="#94a3b8" textAnchor="end">{L('staw kolanowy →', 'knee joint →')}</text>}
        </svg>
        <div className="scan-line" style={{ left: `${x}%` }} aria-hidden />
      </div>
      <button className="btn big danger stop-btn" onClick={stop}>STOP <small>({L('spacja', 'space')})</small></button>
    </div>
  );
}
