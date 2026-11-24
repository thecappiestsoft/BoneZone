import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { jointParts, longboneParts, skeletonParts } from '../data/content';
import { DIAGRAMS, DiagramBox, pct, type DiagramKind } from './common/Diagrams';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Popraw opis: podpisy są pomieszane – zamieniaj je miejscami, aż wszystkie będą poprawne. */
export default function FixLabels(p: MiniGameProps) {
  const [task] = useState(() => {
    const kind = pick(p.rng, ['skeleton', 'longbone', 'joint'] as DiagramKind[]);
    const pool = kind === 'skeleton' ? skeletonParts(p.level) : kind === 'longbone' ? longboneParts(p.level) : jointParts();
    const parts = sample(p.rng, pool, Math.min(pool.length, lv(p.level, 4, 5, 6)));
    let labels = shuffle(p.rng, parts.map((x) => x.id));
    for (let k = 0; k < 50 && labels.some((l, i) => l === parts[i].id); k++) labels = shuffle(p.rng, labels);
    return { kind, parts, labels };
  });
  const [labels, setLabels] = useState(task.labels);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const click = (i: number) => {
    if (done) return;
    if (sel === null) { setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    const next = labels.slice();
    [next[sel], next[i]] = [next[i], next[sel]];
    setLabels(next);
    setSel(null);
    sfx('click');
    if (next.every((l, k) => l === task.parts[k].id)) {
      setDone(true);
      p.onDone({ success: true, info: L('Opis poprawiony! Nazwy anatomiczne zawsze odnoszą się do konkretnego miejsca na schemacie.', 'Labels fixed! Anatomical names always refer to a specific place on the diagram.') });
    }
  };
  const name = (id: string) => task.parts.find((x) => x.id === id)!.name;
  const d = DIAGRAMS[task.kind];
  return (
    <div className="mg">
      <p className="prompt">{L(<>Opis jest <b>pomieszany</b>! Kliknij dwa podpisy, aby zamienić je miejscami. Popraw wszystkie.</>, <>The labels are <b>mixed up</b>! Click two labels to swap them. Fix them all.</>)}</p>
      <DiagramBox view={d.view} svg={d.render(task.parts)} className={d.className}>
        {task.parts.map((x, i) => (
          <button key={x.id} className={`slot swap ${sel === i ? 'selected' : ''} ${labels[i] === x.id ? 'correct-place' : ''}`}
            style={{ left: pct(x.anchor.x, d.view.w), top: pct(x.anchor.y, d.view.h) }} onClick={() => click(i)}>
            {name(labels[i])}
          </button>
        ))}
      </DiagramBox>
    </div>
  );
}
