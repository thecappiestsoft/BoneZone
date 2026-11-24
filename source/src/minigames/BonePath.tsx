import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, randInt, scatter } from '../utils/random';
import { lv } from '../utils/level';
import { chains } from '../data/content';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Ułóż kości po kolei: klikaj „bąbelki” w kolejności położenia w ciele. */
export default function BonePath(p: MiniGameProps) {
  const [task] = useState(() => {
    const ch = pick(p.rng, chains(p.level));
    const k = Math.min(ch.items.length, lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0));
    const start = randInt(p.rng, 0, ch.items.length - k);
    const seq = ch.items.slice(start, start + k);
    const pos = scatter(p.rng, k, 24, { x0: 14, x1: 86, y0: 16, y1: 84 });
    return { name: ch.name, seq, pos };
  });
  const [done, setDone] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const mistake = useMistakes(p, 1);
  const click = (i: number) => {
    if (i < done) return;
    if (i === done) {
      sfx('pop');
      if (done + 1 === task.seq.length) p.onDone({ success: true, info: `${task.seq.join(' → ')}.` });
      setDone(done + 1);
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 400);
      mistake(`${L('Prawidłowo', 'Correct order')}: ${task.seq.join(' → ')}.`);
    }
  };
  return (
    <div className="mg">
      <p className="prompt">{L('Klikaj po kolei', 'Click in order')}: <b>{task.name}</b>.</p>
      <div className="path-track" aria-live="polite">
        {task.seq.slice(0, done).map((s, i) => <span key={i} className="path-step">{i > 0 && <span className="arrow">→</span>}{s}</span>)}
        {done === 0 && <span className="muted">{L('Zacznij od pierwszego elementu…', 'Start with the first item…')}</span>}
      </div>
      <div className="field bubbles">
        {task.seq.map((s, i) => (
          <button key={s} className={`bubble ${i < done ? 'used' : ''} ${shake === i ? 'shake' : ''}`} style={{ left: `${task.pos[i].x}%`, top: `${task.pos[i].y}%` }} onClick={() => click(i)} disabled={i < done}>
            {i < done && <b>{i + 1}.</b>} {s}
          </button>
        ))}
      </div>
    </div>
  );
}
