import { useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick, sample, shuffle } from '../utils/random';
import { artDescriptions } from '../data/content';
import { Art, ART_SCALE, artName } from './common/Art';
import { ChoiceGrid } from './common/ChoiceGrid';
import { L,  } from '../i18n';

const SHAPES: ArtKind[] = ['long', 'short', 'flat', 'irregular', 'sesamoid'];
const CELLS: ArtKind[] = ['osteoblast', 'osteocyte', 'osteoclast', 'chondrocyte'];

/** Znajdź właściwy element na podstawie opisu budowy (kształt kości lub komórka). */
export default function FindBone(p: MiniGameProps) {
  const [task] = useState(() => {
    const d = pick(p.rng, artDescriptions(p.level));
    const family = SHAPES.includes(d.kind) ? SHAPES : CELLS;
    const pool = family.filter((k) => k !== d.kind && (p.level !== 'primary' || !['sesamoid'].includes(k)));
    const extra: ArtKind[] = family === CELLS ? ['neuron', 'rbc'] : [];
    const others = sample(p.rng, pool.length >= 3 ? pool : [...pool, ...extra], 3);
    const opts = shuffle(p.rng, [d.kind, ...others]);
    return { d, opts };
  });
  return (
    <div className="mg">
      <p className="prompt">{L('Wskaż', 'Point to')}: <b>{task.d.text}</b></p>
      <ChoiceGrid columns={4} options={task.opts.map((k) => (
        <span className="cell-choice" key={k}><Art kind={k} size={Math.round(78 * Math.min(1.2, ART_SCALE[k]))} label={L('element do wyboru', 'option')} /></span>
      ))} correct={task.opts.indexOf(task.d.kind)}
        onAnswer={(i) => p.onDone({ success: task.opts[i] === task.d.kind, info: task.opts[i] === task.d.kind ? task.d.fact : `${L('To był(a)', 'That was')}: ${artName(task.opts[i])}. ${task.d.fact}` })} />
    </div>
  );
}
