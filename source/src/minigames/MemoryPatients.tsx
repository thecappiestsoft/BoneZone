import { useEffect, useState } from 'react';
import type { MiniGameProps } from '../types';
import { sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { injuryBones, PATIENT_NAMES } from '../data/content';
import { ChoiceGrid } from './common/ChoiceGrid';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Izba przyjęć: zapamiętaj, kto złamał którą kość, potem odpowiadaj. */
export default function MemoryPatients(p: MiniGameProps) {
  const [task] = useState(() => {
    const n = lv(p.level, 3, 3, 4) + (p.intensity === 2 ? 1 : 0);
    const names = sample(p.rng, PATIENT_NAMES, n);
    const pool = injuryBones(p.level);
    const bones = sample(p.rng, pool, n);
    const order = sample(p.rng, names.map((_, i) => i), lv(p.level, 2, 2, 3));
    const questions = order.map((i) => {
      const correct = bones[i];
      const others = shuffle(p.rng, [...bones.filter((b) => b !== correct), ...pool.filter((b) => !bones.includes(b))]).slice(0, 3);
      return { name: names[i], correct, opts: shuffle(p.rng, [correct, ...others]) };
    });
    return { names, bones, questions };
  });
  const [show, setShow] = useState(true);
  const [q, setQ] = useState(0);
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, (p.learn ? 5000 : 1800) + task.names.length * 700);
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = task.questions[q];
  return (
    <div className="mg center">
      {show ? (
        <>
          <p className="prompt">{L(<><b>ZAPAMIĘTAJ</b> zdjęcia RTG pacjentów – kto co złamał?</>, <><b>REMEMBER</b> the patients’ X-rays – who broke what?</>)}</p>
          <div className="patients">
            {task.names.map((n, i) => (
              <div key={n} className="patient-card">
                <span className="avatar" aria-hidden>{n[0]}</span>
                <b>{n}</b>
                <span className="bone-tag">🦴 {task.bones[i]}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="prompt">{L(<>Którą kość złamał(a) <b>{cur.name}</b>?</>, <>Which bone did <b>{cur.name}</b> break?</>)} <span className="muted">({q + 1}/{task.questions.length})</span></p>
          <ChoiceGrid key={q} options={cur.opts} correct={cur.opts.indexOf(cur.correct)} onAnswer={(i) => {
            if (cur.opts[i] !== cur.correct) return p.onDone({ success: false, info: `${cur.name}: ${cur.correct}. ${L('Przy złamaniu kości długiej unieruchamia się dwa sąsiednie stawy.', 'For a broken long bone, the two neighbouring joints are immobilised.')}` });
            sfx('pop');
            if (q + 1 >= task.questions.length) p.onDone({ success: true, info: L('Dobra pamięć! Złamanie potwierdza się badaniem RTG; pierwsza pomoc to unieruchomienie i wezwanie pomocy.', 'Good memory! A fracture is confirmed by X-ray; first aid means immobilising and calling for help.') });
            else setTimeout(() => setQ(q + 1), 250);
          }} />
        </>
      )}
    </div>
  );
}
