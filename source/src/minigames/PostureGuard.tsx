import { useRef, useState } from 'react';
import type { MiniGameProps } from '../types';
import { sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { habits } from '../data/content';
import { useLoop, useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

interface Flow { id: number; label: string; icon: string; bad: boolean; spawn: number; y: number; state: 'alive' | 'gone' | 'wrong' }

/** Chroń kręgosłup: klikaj złe nawyki, zanim dotrą do kręgosłupa. Dobre nawyki przepuszczaj. */
export default function PostureGuard(p: MiniGameProps) {
  const [cfg] = useState(() => {
    const limit = p.timeLimit ?? 12;
    const travel = Math.min(lv(p.level, 5, 4.2, 3.6) / (1 + p.intensity * 0.15), Math.max(2, (limit - 1) * 0.6));
    const window = Math.max(1.5, Math.min(6, limit - travel - 1));
    const pool = habits(p.level);
    const bad = sample(p.rng, pool.filter((h) => h.bad), lv(p.level, 3, 4, 4));
    const good = sample(p.rng, pool.filter((h) => !h.bad), lv(p.level, 3, 4, 5));
    const all = shuffle(p.rng, [...bad, ...good]);
    const lanes = [16, 38, 60, 82];
    const flows: Flow[] = all.map((h, i) => ({ id: i, label: h.label, icon: h.icon, bad: h.bad, spawn: (i / all.length) * window, y: lanes[i % lanes.length], state: 'alive' }));
    return { travel, flows };
  });
  const t = useRef(0);
  const [, force] = useState(0);
  const ended = useRef(false);
  const mistake = useMistakes(p, 1);
  const xOf = (f: Flow) => ((t.current - f.spawn) / cfg.travel) * 88;

  useLoop((dt) => {
    if (ended.current) return;
    t.current += dt;
    for (const f of cfg.flows) {
      if (f.bad && f.state === 'alive' && xOf(f) >= 86) {
        ended.current = true;
        sfx('fail');
        p.onDone({ success: false, info: L(`„${f.label}” dotarło do kręgosłupa. Złe nawyki sprzyjają wadom postawy (np. skoliozie, nadmiernej kifozie).`, `“${f.label}” reached the spine. Bad habits lead to posture defects (e.g. scoliosis, excessive kyphosis).`) });
      }
    }
    if (!ended.current && cfg.flows.every((f) => !f.bad || f.state === 'gone') ) {
      ended.current = true;
      p.onDone({ success: true, info: L('Kręgosłup ochroniony! Ruch, prawidłowa postawa, plecak na obu ramionach oraz wapń i witamina D wspierają zdrowy szkielet.', 'Spine protected! Exercise, good posture, a backpack on both shoulders, calcium and vitamin D support a healthy skeleton.') });
    }
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const hit = (f: Flow) => {
    if (ended.current || f.state !== 'alive') return;
    if (f.bad) {
      f.state = 'gone';
      sfx('pop');
    } else {
      f.state = 'wrong';
      setTimeout(() => { if (f.state === 'wrong') f.state = 'alive'; }, 400);
      mistake(L(`„${f.label}” to dobry nawyk – przepuść go do kręgosłupa!`, `“${f.label}” is a good habit – let it reach the spine!`));
    }
  };
  const left = cfg.flows.filter((f) => f.bad && f.state !== 'gone').length;
  return (
    <div className="mg">
      <p className="prompt">{L(<>Klikaj <b>ZŁE nawyki</b> 👎, zanim dotrą do kręgosłupa. <b>Dobre</b> 👍 przepuszczaj!</>, <>Click the <b>BAD habits</b> 👎 before they reach the spine. Let the <b>good</b> ones 👍 through!</>)}</p>
      <div className="lane posture">
        <div className="lane-spine" aria-hidden><span>{L('KRĘGOSŁUP', 'SPINE')}</span></div>
        <div className="field-counter">{L('Złe nawyki', 'Bad habits')}: <b>{left}</b></div>
        {cfg.flows.map((f) => {
          const x = xOf(f);
          if (f.state === 'gone' || x < -20 || x > 100) return null;
          return (
            <button key={f.id} className={`habit ${f.state === 'wrong' ? 'shake bad-ring' : ''}`} style={{ left: `${x}%`, top: `${f.y}%` }}
              onPointerDown={(e) => { e.preventDefault(); hit(f); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') hit(f); }}>
              <span aria-hidden>{f.icon}</span> {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
