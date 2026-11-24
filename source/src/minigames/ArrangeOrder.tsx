import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, shuffle } from '../utils/random';
import { orderCriteria } from '../data/content';
import { Art } from './common/Art';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Ułóż elementy według kryterium: wypełnij półkę po kolei. */
export default function ArrangeOrder(p: MiniGameProps) {
  const [task] = useState(() => {
    const c = pick(p.rng, orderCriteria(p.level));
    let order = shuffle(p.rng, c.items.map((_, i) => i));
    if (order.every((v, i) => v === i)) order = order.reverse();
    return { c, order };
  });
  const [placed, setPlaced] = useState<number[]>([]);
  const [bad, setBad] = useState<number[]>([]);
  const mistake = useMistakes(p, 1);
  const n = task.c.items.length;
  const put = (i: number) => {
    if (placed.includes(i)) return;
    sfx('click');
    setBad([]);
    const next = [...placed, i];
    setPlaced(next);
    if (next.length === n) {
      if (next.every((v, k) => v === k)) {
        p.onDone({ success: true, info: task.c.fact });
      } else {
        const wrong = next.map((v, k) => (v === k ? -1 : k)).filter((k) => k >= 0);
        setBad(wrong);
        setTimeout(() => setPlaced(next.filter((v, k) => v === k && k < wrong[0])), 500);
        mistake(`${task.c.items.join(' → ')}. ${task.c.fact}`);
      }
    }
  };
  const unplace = (k: number) => setPlaced(placed.slice(0, k));
  return (
    <div className="mg">
      <p className="prompt">{L('Ułóż', 'Arrange')}: <b>{task.c.prompt}</b></p>
      <div className="shelf" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {Array.from({ length: n }, (_, k) => (
          <button key={k} className={`shelf-slot ${placed[k] !== undefined ? 'filled' : ''} ${bad.includes(k) ? 'shake bad-ring' : ''}`} onClick={() => unplace(k)} disabled={placed[k] === undefined} aria-label={placed[k] !== undefined ? `${k + 1}: ${task.c.items[placed[k]]} – ${L('kliknij, aby cofnąć', 'click to undo')}` : `${L('Miejsce', 'Place')} ${k + 1}`}>
            <span className="shelf-no">{k + 1}</span>
            {placed[k] !== undefined && <>{task.c.arts && <Art kind={task.c.arts[placed[k]]} size={40} />}<span>{task.c.items[placed[k]]}</span></>}
          </button>
        ))}
      </div>
      <div className="tray">
        {task.order.filter((i) => !placed.includes(i)).map((i) => (
          <button key={i} className="chip" onClick={() => put(i)}>
            {task.c.arts && <Art kind={task.c.arts[i]} size={34} />} {task.c.items[i]}
          </button>
        ))}
      </div>
    </div>
  );
}
