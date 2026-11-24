import { useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick } from '../utils/random';
import { lv } from '../utils/level';
import { CatchField } from './common/CatchField';
import { artName } from './common/Art';
import { L,  } from '../i18n';

const SHAPES: { kind: ArtKind; name: [string, string]; hint: [string, string] }[] = [
  { kind: 'long', name: ['KOŚCI DŁUGIE', 'LONG BONES'], hint: ['wydłużony trzon i dwie nasady', 'an elongated shaft and two ends'] },
  { kind: 'short', name: ['KOŚCI KRÓTKIE', 'SHORT BONES'], hint: ['małe „kostki” zbliżone do sześcianu', 'small, roughly cube-shaped “blocks”'] },
  { kind: 'flat', name: ['KOŚCI PŁASKIE', 'FLAT BONES'], hint: ['cienkie, szerokie płytki', 'thin, wide plates'] },
  { kind: 'irregular', name: ['KOŚCI RÓŻNOKSZTAŁTNE', 'IRREGULAR BONES'], hint: ['np. kręg z wyrostkami', 'e.g. a vertebra with processes'] },
];

/** Złap kości o wskazanym kształcie. */
export default function CatchBones(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const target = p.level === 'primary' ? (p.rng() < 0.6 ? SHAPES[0] : pick(p.rng, SHAPES.slice(1, 3))) : pick(p.rng, SHAPES);
    const pool: ArtKind[] = [...SHAPES.map((s) => s.kind).filter((k) => k !== target.kind), ...(p.level === 'technical' ? ['sesamoid' as ArtKind] : [])];
    const nT = lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0);
    const nD = lv(p.level, 4, 6, 8) + p.intensity;
    return {
      target,
      targets: Array<ArtKind>(nT).fill(target.kind),
      distractors: Array.from({ length: nD }, () => pick(p.rng, pool)),
      speed: lv(p.level, 7, 11, 15) * (1 + p.intensity * 0.25),
    };
  });
  return (
    <div className="mg">
      <p className="prompt">{L('Klikaj tylko', 'Click only')} <b>{L(...cfg.target.name)}</b> – {L(...cfg.target.hint)}.</p>
      <CatchField p={p} targets={cfg.targets} distractors={cfg.distractors} speed={cfg.speed} allowed={lv(p.level, 2, 1, 1)}
        successInfo={L('Kształt kości wiąże się z funkcją: długie – dźwignie, płaskie – ochrona, krótkie – wytrzymałość i drobne ruchy.', 'Bone shape matches function: long – levers, flat – protection, short – strength and small movements.')}
        wrongInfo={(k) => L(`To była ${artName(k)}.`, `That was a ${artName(k)}.`)} />
    </div>
  );
}
