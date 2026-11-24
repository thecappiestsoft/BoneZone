import { useMemo, useState, type ReactNode } from 'react';
import type { MiniGameProps } from '../../types';
import type { DiagramPart } from '../../data/content';
import { shuffle } from '../../utils/random';
import { useDragTap } from './useDragTap';
import { useMistakes } from './hooks';
import { DiagramBox, pct } from './Diagrams';
import { sfx } from '../../engine/sound';
import { L } from '../../i18n';

/** Umieszczanie podpisów w pustych polach schematu (przeciągnij albo kliknij podpis → pole). */
export function SlotDiagram({ p, parts, view, svg, allowed, successInfo, extraLabels = [], className }: {
  p: MiniGameProps;
  parts: DiagramPart[];
  view: { w: number; h: number };
  svg: ReactNode;
  allowed: number;
  successInfo: string;
  extraLabels?: string[];
  className?: string;
}) {
  const labels = useMemo(() => shuffle(p.rng, [...parts.map((x) => ({ id: x.id, name: x.name })), ...extraLabels.map((n, i) => ({ id: `x${i}`, name: n }))]), [parts, extraLabels, p.rng]);
  const [filled, setFilled] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);
  const mistake = useMistakes(p, allowed);
  const { itemProps, targetProps, selected, ghost } = useDragTap((labelId, slotId) => {
    if (filled.includes(slotId)) return;
    if (labelId === slotId) {
      sfx('pop');
      const next = [...filled, slotId];
      setFilled(next);
      if (next.length === parts.length) p.onDone({ success: true, info: successInfo });
    } else {
      setShake(slotId);
      setTimeout(() => setShake(null), 400);
      const correct = parts.find((x) => x.id === slotId)!;
      mistake(`${L('W tym miejscu', 'This spot is')}: ${correct.name}.`);
    }
  });
  return (
    <div className="slot-diagram">
      <DiagramBox view={view} svg={svg} className={className}>
        {parts.map((x, i) => (
          <button key={x.id}
            className={`slot ${filled.includes(x.id) ? 'filled' : ''} ${shake === x.id ? 'shake' : ''} ${selected ? 'armed' : ''}`}
            style={{ left: pct(x.anchor.x, view.w), top: pct(x.anchor.y, view.h) }}
            disabled={filled.includes(x.id)}
            aria-label={filled.includes(x.id) ? x.name : `${L('Puste pole', 'Empty field')} ${i + 1}`}
            {...targetProps(x.id)}>
            {filled.includes(x.id) ? x.name : '?'}
          </button>
        ))}
      </DiagramBox>
      <div className="tray">
        {labels.filter((l) => !filled.includes(l.id)).map((l) => (
          <button key={l.id} className={`chip ${selected === l.id ? 'selected' : ''}`} {...itemProps(l.id)}>{l.name}</button>
        ))}
      </div>
      {ghost((id) => <span className="chip">{labels.find((l) => l.id === id)?.name}</span>)}
    </div>
  );
}
