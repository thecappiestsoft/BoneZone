import { useState } from 'react';
import type { MiniGameProps, MiniGameResult } from '../types';
import BonePath from './BonePath';
import CatchBones from './CatchBones';
import HealFracture from './HealFracture';
import Immobilize from './Immobilize';
import { L,  } from '../i18n';

const STAGES = [
  { name: ['Etap 1/4: Kości po kolei', 'Stage 1/4: Bones in order'], C: BonePath },
  { name: ['Etap 2/4: Złap kości', 'Stage 2/4: Catch the bones'], C: CatchBones },
  { name: ['Etap 3/4: Ratuj złamanie', 'Stage 3/4: Save the fracture'], C: HealFracture },
  { name: ['Etap 4/4: Unieruchom!', 'Stage 4/4: Immobilise!'], C: Immobilize },
] as const;

/** Finał Boss Rush – „Wielki Szkielet” łączy kilka mechanik w jednym zadaniu. */
export default function GrandSkeleton(p: MiniGameProps) {
  const [stage, setStage] = useState(0);
  const S = STAGES[stage];
  const child: MiniGameProps = {
    ...p,
    intensity: 1,
    onDone: (r: MiniGameResult) => {
      if (!r.success) return p.onDone({ success: false, info: `${L('Szkielet runął na etapie', 'The skeleton collapsed at stage')} ${stage + 1}. ${r.info ?? ''}` });
      if (stage + 1 >= STAGES.length) p.onDone({ success: true, info: L('WIELKI SZKIELET ZŁOŻONY! Budowa, kształty kości, gojenie złamań i pierwsza pomoc – wszystko na swoim miejscu.', 'THE GREAT SKELETON IS REBUILT! Structure, bone shapes, fracture healing and first aid – everything in its place.') });
      else setStage(stage + 1);
    },
  };
  return (
    <div className="mg boss">
      <div className="boss-bar">
        {STAGES.map((s, i) => <span key={i} className={i < stage ? 'done' : i === stage ? 'now' : ''}>{i + 1}</span>)}
        <b>{L(S.name[0], S.name[1])}</b>
      </div>
      <S.C key={stage} {...child} />
    </div>
  );
}
