import { useEffect, useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, shuffle } from '../utils/random';
import { Art } from './common/Art';
import { ChoiceGrid } from './common/ChoiceGrid';
import { sfx } from '../engine/sound';
import { L, t } from '../i18n';

const SECTIONS = () => [
  { name: t('Odcinek szyjny'), n: 7 },
  { name: t('Odcinek piersiowy'), n: 12 },
  { name: t('Odcinek lędźwiowy'), n: 5 },
];

/** Policz kręgi: kręgi pojawiają się kolejno – policz je i rozpoznaj odcinek kręgosłupa. */
export default function CountVertebrae(p: MiniGameProps) {
  const [task] = useState(() => {
    const sec = pick(p.rng, SECTIONS());
    const askNumber = p.level === 'primary';
    const raw = [sec.n - 1, sec.n + 1, sec.n + 2, sec.n - 2].filter((x) => x > 0);
    const opts = askNumber ? shuffle(p.rng, [String(sec.n), ...shuffle(p.rng, raw).slice(0, 3).map(String)]) : shuffle(p.rng, [...SECTIONS().map((s) => s.name), t('Kość krzyżowa')]);
    const correct = askNumber ? String(sec.n) : sec.name;
    return { sec, opts, correct, askNumber, interval: p.level === 'technical' ? 280 : p.level === 'highschool' ? 340 : 420 };
  });
  const [n, setN] = useState(0);
  const watching = n < task.sec.n;
  useEffect(() => {
    if (!watching) { p.startTimer(); return; }
    if (p.paused) return;
    const t = setTimeout(() => { sfx('tick'); setN((x) => x + 1); }, n === 0 ? 500 : task.interval);
    return () => clearTimeout(t);
  }, [n, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const info = L('Kręgosłup: 7 kręgów szyjnych, 12 piersiowych, 5 lędźwiowych, kość krzyżowa (5 zrośniętych kręgów) i kość ogonowa.', 'Spine: 7 cervical, 12 thoracic and 5 lumbar vertebrae, the sacrum (5 fused vertebrae) and the coccyx.');
  return (
    <div className="mg center">
      <p className="prompt">{watching ? L(<><b>LICZ</b> pojawiające się kręgi!</>, <><b>COUNT</b> the vertebrae as they appear!</>) : task.askNumber ? L(<>Ile było kręgów? To odcinek: <b>{task.sec.name.toLowerCase()}</b>.</>, <>How many vertebrae were there? This is the <b>{task.sec.name.toLowerCase()}</b>.</>) : L('Który to odcinek kręgosłupa?', 'Which section of the spine is it?')}</p>
      <div className={`vert-stack ${!watching ? 'hidden-count' : ''}`} aria-hidden>
        {Array.from({ length: n }, (_, i) => <span key={i} className="vert"><Art kind="irregular" size={34} /></span>)}
      </div>
      {!watching && (
        <ChoiceGrid columns={task.askNumber ? 4 : 2} options={task.opts} correct={task.opts.indexOf(task.correct)}
          onAnswer={(i) => p.onDone({ success: task.opts[i] === task.correct, info: `${L('Kręgów było', 'Vertebrae shown')}: ${task.sec.n} – ${task.sec.name.toLowerCase()}. ${info}` })} />
      )}
    </div>
  );
}
