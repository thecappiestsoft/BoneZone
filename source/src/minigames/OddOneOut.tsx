import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, sample, shuffle } from '../utils/random';
import { bankFor } from '../engine/bank';
import { cats } from './common/bankHelpers';
import { sfx } from '../engine/sound';
import { useNumberKeys } from './common/hooks';
import { L,  } from '../i18n';

/** Kto tu nie pasuje? Naklejki rozrzucone na stole w pracowni. */
export default function OddOneOut(p: MiniGameProps) {
  const [task] = useState(() => {
    const it = pick(p.rng, bankFor(p.bank, 'odd', p.level, cats(p)));
    const tiles = shuffle(p.rng, [it.odd, ...sample(p.rng, it.others, 3)]);
    return { it, tiles, rot: tiles.map(() => Math.round((p.rng() - 0.5) * 10)) };
  });
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (t: string) => {
    if (picked) return;
    setPicked(t);
    if (t === task.it.odd) sfx('pop');
    p.onDone({ success: t === task.it.odd, info: task.it.explanation });
  };
  return (
    <div className="mg">
      <p className="prompt">{L(<>Który element <b>nie pasuje</b> do pozostałych?</>, <>Which item <b>doesn’t fit</b> with the others?</>)}</p>
      <div className="stickers">
        {task.tiles.map((t, i) => (
          <button key={t} className={`sticker ${picked === t ? (t === task.it.odd ? 'ok' : 'bad') : ''}`} style={{ transform: `rotate(${task.rot[i]}deg)` }} onClick={() => choose(t)} disabled={!!picked}>
            <span className="kbd">{i + 1}</span>{t}
          </button>
        ))}
      </div>
      <NumberKeys n={task.tiles.length} onPick={(i) => choose(task.tiles[i])} />
    </div>
  );
}
function NumberKeys({ n, onPick }: { n: number; onPick: (i: number) => void }) {
  useNumberKeys(n, onPick);
  return null;
}
