import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { shuffle } from '../utils/random';
import { fractureTask } from '../data/content';
import { useDragTap } from './common/useDragTap';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Ratuj złamanie: pierwsza pomoc (SP) / etapy gojenia (LO) / leczenie i gojenie (T). */
export default function HealFracture(p: MiniGameProps) {
  const [ft] = useState(() => fractureTask(p.level));
  const t = ft;
  const [tokens] = useState(() => shuffle(p.rng, [
    ...t.steps.map((s, i) => ({ ...s, id: `s${i}`, order: i, good: true })),
    ...t.wrong.map((s, i) => ({ ...s, id: `w${i}`, order: -1, good: false })),
  ]));
  const [used, setUsed] = useState<string[]>([]);
  const mistake = useMistakes(p, 1);
  const done = used.length;

  const { itemProps, targetProps, selected, ghost } = useDragTap((id) => {
    const tok = tokens.find((x) => x.id === id)!;
    if (used.includes(id)) return;
    if (!tok.good) return mistake(tok.why);
    if (t.ordered && tok.order !== done) return mistake(`${L('Kolejność', 'Order')}: ${t.steps.map((s) => s.label).join(' → ')}.`);
    sfx('pop');
    const next = [...used, id];
    setUsed(next);
    if (next.length === t.steps.length) p.onDone({ success: true, info: t.info });
  });

  const healed = done / t.steps.length;
  return (
    <div className="mg">
      <p className="prompt">{t.prompt}</p>
      <div className="fracture-box">
        <button className={`fracture ${selected ? 'armed' : ''}`} {...targetProps('target')} aria-label={`${t.target} – ${L('upuść tutaj', 'drop here')}`}>
          <svg viewBox="0 0 400 110" aria-hidden>
            <rect x="20" y="35" width="360" height="40" rx="18" fill="#f5ecd7" stroke="#7c5a2a" strokeWidth="5" />
            <circle cx="28" cy="40" r="22" fill="#f5ecd7" stroke="#7c5a2a" strokeWidth="5" />
            <circle cx="28" cy="70" r="22" fill="#f5ecd7" stroke="#7c5a2a" strokeWidth="5" />
            <circle cx="372" cy="40" r="22" fill="#f5ecd7" stroke="#7c5a2a" strokeWidth="5" />
            <circle cx="372" cy="70" r="22" fill="#f5ecd7" stroke="#7c5a2a" strokeWidth="5" />
            <rect x="30" y="39" width="340" height="32" fill="#f5ecd7" />
            <path d="M196 30 L210 50 L192 62 L206 82" stroke="#b91c1c" strokeWidth="7" fill="none" strokeLinejoin="round" opacity={1 - healed} />
            {healed > 0 && <ellipse cx="200" cy="55" rx={18 + healed * 14} ry={26 + healed * 6} fill={healed >= 1 ? '#bbf7d0' : '#fde68a'} opacity=".75" />}
          </svg>
          <span className="fracture-label">{healed >= 1 ? L('GOTOWE ✓', 'DONE ✓') : t.target}</span>
        </button>
        <ol className="step-log" aria-live="polite">
          {used.map((u) => { const s = tokens.find((x) => x.id === u)!; return <li key={u}>{s.icon} {s.label}</li>; })}
        </ol>
      </div>
      <div className="tray">
        {tokens.filter((x) => !used.includes(x.id)).map((x) => (
          <button key={x.id} className={`chip token ${selected === x.id ? 'selected' : ''}`} {...itemProps(x.id)}>
            <span className="tok-ico" aria-hidden>{x.icon}</span> {x.label}
          </button>
        ))}
      </div>
      {ghost((id) => { const x = tokens.find((y) => y.id === id)!; return <span className="chip token">{x.icon} {x.label}</span>; })}
    </div>
  );
}
