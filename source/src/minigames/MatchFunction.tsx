import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, sample } from '../utils/random';
import { lv } from '../utils/level';
import { PAIR_GROUPS } from '../data/questions';
import { Matcher } from './common/Matcher';
import { IMAGING, cats, pairGroups } from './common/bankHelpers';
import { L, t } from '../i18n';

/** Dopasuj w pary – grupy par z bazy zadań (bez badań obrazowych). */
export default function MatchFunction(p: MiniGameProps) {
  const [task] = useState(() => {
    const groups = pairGroups(p.bank, p.level, cats(p), (g) => g !== IMAGING);
    const [name, items] = pick(p.rng, groups);
    const n = Math.min(items.length, lv(p.level, 3, 4, 4) + (p.intensity === 2 ? 1 : 0));
    return { name, pairs: sample(p.rng, items, n) };
  });
  return (
    <div className="mg">
      <p className="prompt">{L('Połącz w pary', 'Match the pairs')}: <b>{t(PAIR_GROUPS[task.name] ?? task.name)}</b>. {L('Kliknij element z lewej, potem pasujący z prawej.', 'Click an item on the left, then its match on the right.')}</p>
      <Matcher p={p} pairs={task.pairs} allowed={1} successInfo={task.pairs[0].explanation} />
    </div>
  );
}
