import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, randInt, sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { chains } from '../data/content';
import { useDragTap } from './common/useDragTap';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Połącz kości: wstaw brakujące ogniwa łańcucha kości. */
export default function ConnectChain(p: MiniGameProps) {
  const [task] = useState(() => {
    const ch = pick(p.rng, chains(p.level));
    const gaps = Math.min(ch.items.length - 2, lv(p.level, 2, 3, 4));
    const start = randInt(p.rng, 0, ch.items.length - gaps - 2);
    const chain = ch.items.slice(start, start + gaps + 2);
    const middle = chain.slice(1, -1);
    const levelItems = [...new Set(chains(p.level).flatMap((c) => c.items))];
    const distract = sample(p.rng, levelItems.filter((c) => !ch.items.includes(c)), lv(p.level, 1, 2, 2));
    return { name: ch.name, start: chain[0], end: chain[chain.length - 1], middle, pieces: shuffle(p.rng, [...middle, ...distract]) };
  });
  const [filled, setFilled] = useState<(string | null)[]>(() => task.middle.map(() => null));
  const [shake, setShake] = useState<number | null>(null);
  const mistake = useMistakes(p, 1);
  const { itemProps, targetProps, selected, ghost } = useDragTap((piece, slot) => {
    const i = Number(slot);
    if (filled[i]) return;
    if (task.middle[i] === piece) {
      sfx('pop');
      const next = filled.slice();
      next[i] = piece;
      setFilled(next);
      if (next.every(Boolean)) p.onDone({ success: true, info: `${L('Szkielet połączony', 'Skeleton connected')}: ${[task.start, ...task.middle, task.end].join(' → ')}.` });
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 400);
      mistake(`${L('W tym miejscu', 'This spot is')}: ${task.middle[i]}.`);
    }
  });
  const complete = filled.every(Boolean);
  return (
    <div className="mg">
      <p className="prompt">{L('Szkielet się rozsypał! Uzupełnij brakujące ogniwa', 'The skeleton fell apart! Fill in the missing links')} ({task.name}) {L('od', 'from')} <b>{task.start}</b> {L('do', 'to')} <b>{task.end}</b>.</p>
      <div className={`pipeline ${complete ? 'flowing' : ''}`}>
        <div className="pipe-node fixed">{task.start}</div>
        {task.middle.map((_, i) => (
          <div key={i} className="pipe-seg">
            <span className="pipe" aria-hidden />
            <button className={`pipe-node slot ${filled[i] ? 'filled' : ''} ${shake === i ? 'shake' : ''} ${selected ? 'armed' : ''}`} disabled={!!filled[i]} {...targetProps(String(i))} aria-label={filled[i] ?? `${L('Brakujące ogniwo', 'Missing link')} ${i + 1}`}>
              {filled[i] ?? '?'}
            </button>
          </div>
        ))}
        <div className="pipe-seg"><span className="pipe" aria-hidden /><div className="pipe-node fixed">{task.end}</div></div>
      </div>
      <div className="tray">
        {task.pieces.filter((x) => !filled.includes(x)).map((x) => (
          <button key={x} className={`chip pipe-chip ${selected === x ? 'selected' : ''}`} {...itemProps(x)}>{x}</button>
        ))}
      </div>
      {ghost((id) => <span className="chip pipe-chip">{id}</span>)}
    </div>
  );
}
