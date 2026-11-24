import { useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick } from '../utils/random';
import { lv } from '../utils/level';
import { CatchField } from './common/CatchField';
import { artName } from './common/Art';
import { L,  } from '../i18n';

/** Przebudowa kości: aktywuj osteoklasty – każdy usunie najbliższe mikrouszkodzenie. */
export default function Remodel(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const n = lv(p.level, 3, 3, 4) + (p.intensity === 2 ? 1 : 0);
    const others: ArtKind[] = p.level === 'technical' ? ['osteoblast', 'osteocyte', 'chondrocyte'] : ['osteoblast', 'osteocyte'];
    return {
      targets: Array<ArtKind>(n).fill('osteoclast'),
      distractors: [...Array<ArtKind>(n + 1).fill('crack'), ...Array.from({ length: lv(p.level, 2, 3, 4) }, () => pick(p.rng, others))],
    };
  });
  return (
    <div className="mg">
      <p className="prompt">{L(<>Aktywuj <b>osteoklasty</b> (duże, wielojądrowe komórki) – każdy usunie najbliższe <b>mikrouszkodzenie</b> kości!</>, <>Activate the <b>osteoclasts</b> (large, multinucleated cells) – each one removes the nearest bone <b>micro-damage</b>!</>)}</p>
      <CatchField p={p} targets={cfg.targets} distractors={cfg.distractors} speed={lv(p.level, 8, 9, 12)} allowed={1}
        successInfo={L('Osteoklasty usuwają uszkodzoną tkankę kostną, a osteoblasty budują w tym miejscu nową. Tak kość stale się przebudowuje.', 'Osteoclasts remove damaged bone tissue and osteoblasts build new tissue in its place. This is how bone is constantly remodelled.')}
        wrongInfo={(k) => k === 'crack' ? L('Kliknij komórkę, która rozkłada kość – osteoklast sam usunie uszkodzenie.', 'Click the cell that breaks bone down – the osteoclast will remove the damage.') : k === 'osteoblast' ? L('Osteoblast buduje kość – rozkładają ją osteoklasty.', 'An osteoblast builds bone – osteoclasts break it down.') : L(`To ${artName(k)} – nie resorbuje kości.`, `That’s a ${artName(k)} – it doesn’t resorb bone.`)}
        onTargetHit={(hit, items) => {
          let best: (typeof items)[number] | null = null;
          let bd = Infinity;
          for (const it of items) {
            if (it.kind !== 'crack' || it.state !== 'alive') continue;
            const d = Math.hypot(it.x - hit.x, it.y - hit.y);
            if (d < bd) { bd = d; best = it; }
          }
          if (best) best.state = 'popped';
        }} />
    </div>
  );
}
