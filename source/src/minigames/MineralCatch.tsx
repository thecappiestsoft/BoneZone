import { useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick } from '../utils/random';
import { lv } from '../utils/level';
import { CatchField } from './common/CatchField';
import { artName } from './common/Art';
import { L,  } from '../i18n';

/** Budulec kości: łap składniki mineralne kości, omijaj inne cząsteczki. */
export default function MineralCatch(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const n = lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0);
    const targets: ArtKind[] = Array.from({ length: n }, (_, i) => (i % 2 ? 'po4' : 'ca'));
    const pool: ArtKind[] = lv(p.level, ['o2', 'glucose', 'bacterium'], ['o2', 'glucose', 'acid', 'bacterium'], ['o2', 'glucose', 'acid', 'vitd', 'bacterium']);
    return { targets, distractors: Array.from({ length: lv(p.level, 4, 6, 8) }, () => pick(p.rng, pool)) };
  });
  return (
    <div className="mg">
      <p className="prompt">{L(<>Łap <b>budulec mineralny kości</b>: jony wapnia <b>Ca²⁺</b> i fosforany <b>P</b>. Nie klikaj innych cząsteczek!</>, <>Catch the <b>mineral building blocks of bone</b>: calcium ions <b>Ca²⁺</b> and phosphates <b>P</b>. Don’t click other molecules!</>)}</p>
      <CatchField p={p} targets={cfg.targets} distractors={cfg.distractors} speed={lv(p.level, 8, 11, 14)} allowed={lv(p.level, 2, 1, 1)}
        successInfo={L('Sole mineralne kości to głównie fosforany wapnia (hydroksyapatyt) – nadają kości twardość.', 'Bone mineral salts are mainly calcium phosphates (hydroxyapatite) – they make bone hard.')}
        wrongInfo={(k) => k === 'vitd'
          ? L('Witamina D nie jest budulcem kości – ułatwia wchłanianie wapnia w jelicie.', 'Vitamin D is not a building block of bone – it helps absorb calcium in the gut.')
          : k === 'acid' ? L('Kwas rozpuszcza sole mineralne kości – to ich wróg, nie budulec!', 'Acid dissolves bone minerals – it’s an enemy, not a building block!') : L(`To ${artName(k)} – nie jest składnikiem mineralnym kości.`, `That’s ${artName(k)} – not a bone mineral.`)} />
    </div>
  );
}
