import { useMemo, useState } from 'react';
import type { MiniGameProps } from '../../types';
import { shuffle } from '../../utils/random';
import { useDragTap } from './useDragTap';
import { useMistakes } from './hooks';
import { sfx } from '../../engine/sound';

const PAIR_COLORS = ['#e23b4a', '#3b6fd8', '#7d3fc8', '#14a37f', '#e08a00', '#d6336c'];

/** Łączenie par: kliknij element z lewej, potem z prawej (albo przeciągnij). */
export function Matcher({ p, pairs, allowed, variant, successInfo }: {
  p: MiniGameProps;
  pairs: { left: string; right: string; explanation?: string }[];
  allowed: number;
  variant?: 'lab' | 'default';
  successInfo: string;
}) {
  const rightOrder = useMemo(() => shuffle(p.rng, pairs.map((_, i) => i)), [pairs, p.rng]);
  const leftOrder = useMemo(() => shuffle(p.rng, pairs.map((_, i) => i)), [pairs, p.rng]);
  const [matched, setMatched] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const mistake = useMistakes(p, allowed);
  const { itemProps, targetProps, selected, ghost } = useDragTap((l, r) => {
    const li = Number(l);
    const ri = Number(r);
    if (matched.includes(li) || matched.includes(ri)) return;
    if (li === ri) {
      sfx('pop');
      const next = [...matched, li];
      setMatched(next);
      if (next.length === pairs.length) p.onDone({ success: true, info: successInfo });
    } else {
      setShake(ri);
      setTimeout(() => setShake(null), 400);
      mistake(`${pairs[li].left} → ${pairs[li].right}. ${pairs[li].explanation ?? ''}`.trim());
    }
  });
  const badge = (i: number) => {
    const k = matched.indexOf(i);
    return k >= 0 ? <span className="pair-badge" style={{ background: PAIR_COLORS[k % PAIR_COLORS.length] }}>{k + 1}</span> : null;
  };
  return (
    <div className={`matcher ${variant === 'lab' ? 'lab' : ''}`}>
      <div className="match-col">
        {leftOrder.map((i) => (
          <button key={i} className={`match-item left ${selected === String(i) ? 'selected' : ''} ${matched.includes(i) ? 'done' : ''}`} disabled={matched.includes(i)} {...itemProps(String(i))}>
            {badge(i)}
            <span>{pairs[i].left}</span>
          </button>
        ))}
      </div>
      <div className="match-col">
        {rightOrder.map((i) => (
          <button key={i} className={`match-item right ${matched.includes(i) ? 'done' : ''} ${shake === i ? 'shake' : ''} ${selected ? 'armed' : ''}`} disabled={matched.includes(i)} {...targetProps(String(i))}>
            {badge(i)}
            <span>{pairs[i].right}</span>
          </button>
        ))}
      </div>
      {ghost((id) => <span className="chip">{pairs[Number(id)].left}</span>)}
    </div>
  );
}
