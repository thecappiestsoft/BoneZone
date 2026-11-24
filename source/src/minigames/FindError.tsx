import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, randInt, sample } from '../utils/random';
import { lv } from '../utils/level';
import { chains } from '../data/content';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Znajdź błąd w kolejności kości – do łańcucha wkradł się element z innego miejsca. */
export default function FindError(p: MiniGameProps) {
  const [task] = useState(() => {
    const ch = pick(p.rng, chains(p.level));
    const k = Math.min(ch.items.length, lv(p.level, 5, 5, 7));
    const start = randInt(p.rng, 0, ch.items.length - k);
    const correct = ch.items.slice(start, start + k);
    const nErr = p.level === 'technical' && k >= 6 ? 2 : 1;
    const levelItems = [...new Set(chains(p.level).flatMap((c) => c.items))];
    const outside = levelItems.filter((c) => !ch.items.includes(c));
    const errIdx = sample(p.rng, correct.map((_, i) => i).slice(1), nErr);
    const shown = correct.slice();
    const wrongs = sample(p.rng, outside, nErr);
    errIdx.forEach((i, j) => { shown[i] = wrongs[j]; });
    return { name: ch.name, correct, shown, errIdx };
  });
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const mistake = useMistakes(p, 1);
  const click = (i: number) => {
    if (found.includes(i)) return;
    if (task.errIdx.includes(i)) {
      sfx('pop');
      const next = [...found, i];
      setFound(next);
      if (next.length === task.errIdx.length) p.onDone({ success: true, info: `${L('Poprawnie', 'Correct')}: ${task.correct.join(' → ')}.` });
    } else {
      setWrong(i);
      setTimeout(() => setWrong(null), 400);
      mistake(`${L('Poprawnie', 'Correct')}: ${task.correct.join(' → ')}.`);
    }
  };
  return (
    <div className="mg">
      <p className="prompt">{L('Schemat', 'Diagram')}: <b>{task.name}</b>. {task.errIdx.length > 1 ? L(<>Są <b>2 błędy</b></>, <>There are <b>2 mistakes</b></>) : L(<>Jest <b>1 błąd</b></>, <>There is <b>1 mistake</b></>)} – {L('kliknij element, który tu nie pasuje!', 'click the item that doesn’t belong!')}</p>
      <div className="flow-chart">
        {task.shown.map((s, i) => (
          <div key={i} className="flow-node-wrap">
            {i > 0 && <span className="flow-arrow" aria-hidden>➜</span>}
            <button className={`flow-node ${found.includes(i) ? 'found' : ''} ${wrong === i ? 'shake bad-ring' : ''}`} onClick={() => click(i)}>
              {found.includes(i) ? <><s>{s}</s><br /><b>{task.correct[i]}</b></> : s}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
