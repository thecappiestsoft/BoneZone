import { useEffect, useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick, randInt } from '../utils/random';
import { lv } from '../utils/level';
import { Art, artName } from './common/Art';
import { L,  } from '../i18n';

/** Co się zmieniło? Zapamiętaj gablotę z kośćmi (lub preparat tkanki) – jeden element zostanie podmieniony. */
export default function SpotChange(p: MiniGameProps) {
  const [task] = useState(() => {
    const n = lv(p.level, 6, 9, 12);
    const pool: ArtKind[] = lv(p.level, ['long', 'short', 'flat', 'irregular'], ['long', 'short', 'flat', 'irregular', 'sesamoid', 'osteocyte'], ['long', 'short', 'flat', 'irregular', 'osteoblast', 'osteocyte', 'osteoclast', 'chondrocyte']);
    const grid = Array.from({ length: n }, () => pick(p.rng, pool));
    const idx = randInt(p.rng, 0, n - 1);
    const replacement = pick(p.rng, pool.filter((k) => k !== grid[idx]));
    return { grid, idx, replacement, cols: lv(p.level, 3, 3, 4) };
  });
  const [phase, setPhase] = useState<'show' | 'blank' | 'find'>('show');
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => {
    if (p.paused || phase === 'find') return;
    const t = setTimeout(() => {
      if (phase === 'show') setPhase('blank');
      else { setPhase('find'); p.startTimer(); }
    }, phase === 'show' ? (p.learn ? 5000 : lv(p.level, 2800, 3200, 3600)) : 450);
    return () => clearTimeout(t);
  }, [phase, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const cells = phase === 'find' ? task.grid.map((k, i) => (i === task.idx ? task.replacement : k)) : task.grid;
  const click = (i: number) => {
    if (phase !== 'find' || picked !== null) return;
    setPicked(i);
    p.onDone({ success: i === task.idx, info: `${L('Zmiana', 'Change')}: ${artName(task.grid[task.idx])} → ${artName(task.replacement)}.` });
  };
  return (
    <div className="mg center">
      <p className="prompt">{phase === 'find' ? L(<>Który element się <b>zmienił</b>?</>, <>Which item has <b>changed</b>?</>) : L(<><b>ZAPAMIĘTAJ</b> zawartość gabloty!</>, <><b>REMEMBER</b> the display case!</>)}</p>
      <div className={`slide-grid ${phase === 'blank' ? 'blank' : ''}`} style={{ gridTemplateColumns: `repeat(${task.cols}, 1fr)` }}>
        {cells.map((k, i) => (
          <button key={i} className={`slide-cell ${picked === i ? (i === task.idx ? 'ok' : 'bad') : ''} ${picked !== null && i === task.idx ? 'reveal' : ''}`} onClick={() => click(i)} disabled={phase !== 'find'} aria-label={`${L('Pole', 'Field')} ${i + 1}`}>
            {phase !== 'blank' && <Art kind={k} size={52} />}
          </button>
        ))}
      </div>
    </div>
  );
}
