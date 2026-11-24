import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, shuffle } from '../utils/random';
import { ChoiceGrid } from './common/ChoiceGrid';
import { L, locale } from '../i18n';

const f = (v: number) => v.toLocaleString(locale());

/** Oblicz skład kości – uproszczone dane szkoleniowe. */
export default function CalcBone(p: MiniGameProps) {
  const [task] = useState(() => {
    let q: string, ans: number, wrong: number[], info: string, unit: string;
    if (p.level === 'primary') {
      const m = pick(p.rng, [100, 200, 300, 500]);
      const pc = pick(p.rng, [60, 70]);
      ans = (m * pc) / 100;
      unit = 'g';
      q = L(`Przyjmij (w uproszczeniu): sole mineralne stanowią ${pc}% masy kości. Ile gramów soli mineralnych zawiera kość o masie ${m} g?`, `Assume (simplified): mineral salts make up ${pc}% of bone mass. How many grams of mineral salts are in a bone weighing ${m} g?`);
      wrong = [m - ans, m / 10, ans / 2];
      info = `${m} g × ${pc}% = ${m} × ${f(pc / 100)} = ${f(ans)} g.`;
    } else if (p.level === 'highschool' || p.rng() < 0.4) {
      const m = pick(p.rng, [40, 50, 80, 100]);
      const pc = pick(p.rng, [60, 65, 70]);
      const r = (m * pc) / 100;
      ans = pc;
      unit = '%';
      q = L(`Doświadczenie: kość ważyła ${m} g. Po wyprażeniu (spalenie związków organicznych i odparowanie wody) ważyła ${f(r)} g. Jaki procent masy kości stanowiły sole mineralne?`, `Experiment: a bone weighed ${m} g. After heating (burning off organic matter and evaporating water) it weighed ${f(r)} g. What percentage of the bone mass was mineral salts?`);
      wrong = [100 - pc, pc - 10, pc + 10];
      info = `${f(r)} g : ${m} g × 100% = ${pc}%. ${L('Po wyprażeniu zostają tylko sole mineralne – kość jest krucha.', 'After heating only mineral salts remain – the bone is brittle.')}`;
    } else {
      const m = pick(p.rng, [40, 60, 80]);
      const pc = pick(p.rng, [60, 65, 70]);
      const r = (m * pc) / 100;
      ans = 100 - pc;
      unit = '%';
      q = L(`Próbka kości: ${m} g. Po wyprażeniu pozostało ${f(r)} g popiołu (sole mineralne). Ile procent masy próbki stanowiły razem związki organiczne i woda?`, `Bone sample: ${m} g. After heating ${f(r)} g of ash (mineral salts) remained. What percentage of the sample mass was organic matter and water together?`);
      wrong = [pc, ans + 10, ans - 10];
      info = `${L('Ubytek masy', 'Mass lost')}: ${m} − ${f(r)} = ${f(m - r)} g; ${f(m - r)} : ${m} × 100% = ${ans}%. ${L('To głównie osseina i woda.', 'This is mainly ossein and water.')}`;
    }
    const uniq = [...new Set(wrong.map((w) => Math.round(w)).filter((w) => w !== Math.round(ans) && w > 0))].slice(0, 3);
    while (uniq.length < 3) uniq.push(Math.round(ans * (1 + 0.2 * (uniq.length + 1))));
    const opts = shuffle(p.rng, [Math.round(ans), ...uniq]);
    return { q, opts, correct: opts.indexOf(Math.round(ans)), info, unit };
  });
  return (
    <div className="mg">
      <div className="calc-card"><span className="calc-ico" aria-hidden>⚖️</span><p>{task.q}</p></div>
      <ChoiceGrid options={task.opts.map((o) => `${o} ${task.unit}`)} correct={task.correct} onAnswer={(i) => p.onDone({ success: i === task.correct, info: task.info })} />
    </div>
  );
}
