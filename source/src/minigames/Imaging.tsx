import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, sample } from '../utils/random';
import { lv } from '../utils/level';
import { Matcher } from './common/Matcher';
import { IMAGING, pairGroups } from './common/bankHelpers';
import { L,  } from '../i18n';

/** Pracownia diagnostyki obrazowej: dopasuj skrót badania do jego opisu (bez diagnozowania). */
export default function Imaging(p: MiniGameProps) {
  const [pairs] = useState(() => {
    const [, items] = pick(p.rng, pairGroups(p.bank, p.level, p.categories, (g) => g === IMAGING));
    return sample(p.rng, items, Math.min(items.length, lv(p.level, 3, 4, 5)));
  });
  return (
    <div className="mg">
      <p className="prompt">{L('Skierowanie do pracowni', 'Imaging referral')} <span className="tag">{L('dane szkoleniowe – bez diagnozowania', 'training data – no diagnosis')}</span>. {L('Połącz skrót badania z jego opisem.', 'Match each test with its description.')}</p>
      <Matcher p={p} variant="lab" pairs={pairs} allowed={1} successInfo={L('Badania obrazowe pokazują kości i stawy; wynik zawsze opisuje i interpretuje lekarz.', 'Imaging tests show bones and joints; the result is always described and interpreted by a doctor.')} />
    </div>
  );
}
