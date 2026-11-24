import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, shuffle } from '../utils/random';
import { injuryLabel, possibleInjuries, toImmobilize, type Segment } from '../engine/firstAid';
import { ChoiceGrid } from './common/ChoiceGrid';
import { sfx } from '../engine/sound';
import { L, t } from '../i18n';

/** Unieruchom! Złamanie → dwa sąsiednie stawy; zwichnięcie → dwie sąsiednie kości. */
export default function Immobilize(p: MiniGameProps) {
  const [task] = useState(() => {
    const pool = possibleInjuries().filter((i) => p.level !== 'primary' || i.type === 'fracture');
    const inj = pick(p.rng, pool);
    const need = toImmobilize(inj);
    const segs = inj.limb.segments;
    // SP: 4 gotowe pary do wyboru
    const pairs: Segment[][] = [need];
    const cand: Segment[][] = [];
    for (let a = 0; a < segs.length; a++) for (let b = a + 1; b < segs.length; b++) cand.push([segs[a], segs[b]]);
    const wrong = shuffle(p.rng, cand.filter((c) => !(c.includes(need[0]) && c.includes(need[1])) && c.every((s) => s.kind === need[0].kind)));
    const extra = shuffle(p.rng, cand.filter((c) => !(c.includes(need[0]) && c.includes(need[1])) && !wrong.includes(c)));
    pairs.push(...[...wrong, ...extra].slice(0, 3));
    return { inj, need, segs, pairs: shuffle(p.rng, pairs) };
  });
  const [sel, setSel] = useState<string[]>([]);
  const rule = task.inj.type === 'fracture' ? L('Złamanie kości → unieruchom DWA SĄSIEDNIE STAWY.', 'Broken bone → immobilise the TWO NEIGHBOURING JOINTS.') : L('Zwichnięcie stawu → unieruchom DWIE SĄSIEDNIE KOŚCI.', 'Dislocated joint → immobilise the TWO NEIGHBOURING BONES.');
  const info = `${rule} ${L('Tutaj', 'Here')}: ${task.need.map((s) => t(s.name)).join(' + ')}. ${L('Nie nastawiaj – wezwij pomoc (112).', 'Don’t try to set it – call for help (112 / 999).')}`;
  const head = <p className="prompt">{L('Uraz', 'Injury')}: <b className="injury-tag">{injuryLabel(task.inj)}</b>. {L('Co należy unieruchomić?', 'What should be immobilised?')}</p>;

  if (p.level === 'primary') {
    const correct = task.pairs.findIndex((pr) => pr.includes(task.need[0]) && pr.includes(task.need[1]));
    return (
      <div className="mg">
        {head}
        <ChoiceGrid options={task.pairs.map((pr) => pr.map((s) => t(s.name)).join(' + '))} correct={correct} onAnswer={(i) => p.onDone({ success: i === correct, info })} />
      </div>
    );
  }
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const check = () => {
    const ok = sel.length === 2 && task.need.every((n) => sel.includes(n.id));
    if (ok) sfx('pop');
    p.onDone({ success: ok, info });
  };
  return (
    <div className="mg">
      {head}
      <p className="muted center-text">{L(<>Zaznacz <b>dokładnie dwa</b> odcinki kończyny</>, <>Select <b>exactly two</b> limb segments</>)} ({t(task.inj.limb.name)}, {L('od tułowia', 'from the trunk')}), {L('potem „Gotowe”.', 'then “Done”.')}</p>
      <div className="limb-chain">
        {task.segs.map((s, i) => (
          <button key={s.id} className={`limb-seg ${s.kind} ${sel.includes(s.id) ? 'checked' : ''} ${i === task.inj.at ? 'injured' : ''}`} onClick={() => toggle(s.id)} aria-pressed={sel.includes(s.id)}>
            <span aria-hidden>{sel.includes(s.id) ? '🩹' : s.kind === 'joint' ? '⚙️' : '🦴'}</span> {t(s.name)}{i === task.inj.at && <small> ⚠ {L('uraz', 'injury')}</small>}
          </button>
        ))}
      </div>
      <button className="btn big primary" onClick={check} disabled={sel.length === 0}>{L('Gotowe ✓', 'Done ✓')}</button>
    </div>
  );
}
