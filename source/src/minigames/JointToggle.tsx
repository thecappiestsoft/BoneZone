import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { jointMarks, SKELETON_VIEW } from '../data/content';
import { DiagramBox, SkeletonSvg, pct } from './common/Diagrams';
import { L,  } from '../i18n';

/** Ruchome czy ścisłe? Ustaw rodzaj połączenia w zaznaczonych miejscach szkieletu. */
export default function JointToggle(p: MiniGameProps) {
  const [marks] = useState(() => {
    const pool = jointMarks(p.level);
    const n = lv(p.level, 5, 6, 6);
    for (let k = 0; k < 100; k++) {
      const s = sample(p.rng, pool, n);
      const groups = s.map((m) => m.group).filter(Boolean);
      const fixed = s.filter((m) => !m.movable).length;
      if (new Set(groups).size === groups.length && fixed >= 1 && fixed < s.length) return s;
    }
    return pool.filter((m) => !m.group || m.id === 'lonowe' || m.id === 'lokciowy').slice(0, n);
  });
  const [state, setState] = useState<Record<string, boolean>>(() => {
    const s = Object.fromEntries(marks.map((m) => [m.id, p.rng() < 0.5]));
    if (marks.every((m) => s[m.id] === m.movable)) s[shuffle(p.rng, marks)[0].id] = !s[marks[0].id];
    if (marks.every((m) => s[m.id] === m.movable)) s[marks[0].id] = !s[marks[0].id];
    return s;
  });
  const check = () => {
    const bad = marks.filter((m) => state[m.id] !== m.movable);
    p.onDone({
      success: bad.length === 0,
      info: bad.length
        ? `${L('Do poprawy', 'To fix')}: ${bad.map((m) => `${m.name} – ${m.movable ? L('ruchome (staw)', 'movable (synovial joint)') : `${L('ścisłe', 'fixed')} (${m.kind})`}`).join('; ')}.`
        : L('Stawy to połączenia ruchome. Połączenia ścisłe: więzozrosty (szwy), chrząstkozrosty (spojenie łonowe, krążki międzykręgowe) i kościozrosty (kość krzyżowa).', 'Synovial joints are movable. Fixed joints: fibrous (sutures), cartilaginous (pubic symphysis, intervertebral discs) and bony fusions (sacrum).'),
    });
  };
  return (
    <div className="mg">
      <p className="prompt">{L(<>Kliknij każde zaznaczone połączenie, aby ustawić: <b>RUCHOME</b> (staw) lub <b>ŚCISŁE</b>. Potem „Gotowe”.</>, <>Click each marked connection to set it: <b>MOVABLE</b> (synovial joint) or <b>FIXED</b>. Then “Done”.</>)}</p>
      <DiagramBox view={SKELETON_VIEW} svg={<SkeletonSvg hideSides />} className="tall">
        {marks.map((m) => (
          <button key={m.id} className={`valve-toggle ${state[m.id] ? 'open' : 'closed'}`} style={{ left: pct(m.x, SKELETON_VIEW.w), top: pct(m.y, SKELETON_VIEW.h) }}
            onClick={() => setState((s) => ({ ...s, [m.id]: !s[m.id] }))} aria-label={`${m.name}: ${state[m.id] ? L('ruchome', 'movable') : L('ścisłe', 'fixed')}`}>
            {state[m.id] ? L('🔄 RUCHOME', '🔄 MOVABLE') : L('🔒 ŚCISŁE', '🔒 FIXED')}
            <small>{m.name}</small>
          </button>
        ))}
      </DiagramBox>
      <button className="btn big primary" onClick={check}>{L('Gotowe ✓', 'Done ✓')}</button>
    </div>
  );
}
