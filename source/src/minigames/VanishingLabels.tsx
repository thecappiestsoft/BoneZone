import { useEffect, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, sample } from '../utils/random';
import { lv } from '../utils/level';
import { jointParts, longboneParts, skeletonParts } from '../data/content';
import { DIAGRAMS, DiagramBox, pct, type DiagramKind } from './common/Diagrams';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Znikające podpisy: zapamiętaj podpisy na schemacie, potem wskaż wskazane miejsca. */
export default function VanishingLabels(p: MiniGameProps) {
  const [task] = useState(() => {
    const kind = pick(p.rng, ['skeleton', 'longbone', 'joint'] as DiagramKind[]);
    const pool = kind === 'skeleton' ? skeletonParts(p.level) : kind === 'longbone' ? longboneParts(p.level) : jointParts();
    const parts = sample(p.rng, pool, Math.min(pool.length, lv(p.level, 4, 5, 6)));
    const asks = sample(p.rng, parts, lv(p.level, 2, 3, 3) + (p.intensity === 2 ? 1 : 0));
    return { kind, parts, asks };
  });
  const [show, setShow] = useState(true);
  const [q, setQ] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, p.learn ? 6000 : lv(p.level, 3400, 3600, 3800));
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const click = (id: string) => {
    if (show) return;
    const target = task.asks[q];
    if (id === target.id) {
      sfx('pop');
      setFound([...found, id]);
      if (q + 1 >= task.asks.length) p.onDone({ success: true, info: L('Świetna pamięć! Kojarzenie nazwy z położeniem to podstawa anatomii.', 'Great memory! Linking a name to its location is the basis of anatomy.') });
      else setQ(q + 1);
    } else {
      setWrong(id);
      setTimeout(() => setWrong(null), 400);
      mistake(L(`${target.name} – to inne miejsce na schemacie.`, `${target.name} is somewhere else on the diagram.`));
    }
  };
  const d = DIAGRAMS[task.kind];
  return (
    <div className="mg">
      <p className="prompt">{show ? L(<><b>ZAPAMIĘTAJ</b> podpisy – zaraz znikną!</>, <><b>REMEMBER</b> the labels – they will disappear!</>) : <>{L('Wskaż', 'Point to')}: <b className="ask">{task.asks[q].name}</b></>}</p>
      <DiagramBox view={d.view} svg={d.render(task.parts)} className={d.className}>
        {task.parts.map((x) => (
          <button key={x.id} className={`slot swap ${found.includes(x.id) ? 'correct-place' : ''} ${wrong === x.id ? 'shake bad-ring' : ''}`}
            style={{ left: pct(x.anchor.x, d.view.w), top: pct(x.anchor.y, d.view.h) }}
            onClick={() => click(x.id)} aria-label={show || found.includes(x.id) ? x.name : L('Ukryty podpis', 'Hidden label')}>
            {show || found.includes(x.id) ? x.name : '?'}
          </button>
        ))}
      </DiagramBox>
    </div>
  );
}
