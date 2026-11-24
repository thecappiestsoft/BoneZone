import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { MiniGameProps } from '../types';
import { sample } from '../utils/random';
import { lv } from '../utils/level';
import { bankFor } from '../engine/bank';
import { cats } from './common/bankHelpers';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Prawda czy fałsz? Seria szybkich kart. */
export default function TrueFalse(p: MiniGameProps) {
  const [items] = useState(() => sample(p.rng, bankFor(p.bank, 'tf', p.level, cats(p)), lv(p.level, 2, 3, 3)));
  const [i, setI] = useState(0);
  const [anim, setAnim] = useState<'' | 'swipe-left' | 'swipe-right'>('');
  const answer = (v: boolean) => {
    if (anim) return;
    const it = items[i];
    if (v !== it.answer) {
      p.onDone({ success: false, info: `${it.answer ? L('PRAWDA', 'TRUE') : L('FAŁSZ', 'FALSE')}: ${it.explanation}` });
      return;
    }
    sfx('pop');
    setAnim(v ? 'swipe-right' : 'swipe-left');
    setTimeout(() => {
      setAnim('');
      if (i + 1 >= items.length) p.onDone({ success: true, info: it.explanation });
      else setI(i + 1);
    }, 220);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') answer(false);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 't') answer(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const it = items[i];
  return (
    <div className="mg center">
      <p className="prompt">{L('Prawda czy fałsz?', 'True or false?')} <span className="muted">({i + 1}/{items.length})</span></p>
      <div className="card-stack">
        {items.length - i > 1 && <div className="tf-card behind" aria-hidden />}
        <div className={`tf-card ${anim}`} aria-live="polite">{it.statement}</div>
      </div>
      <div className="tf-buttons">
        <button className="btn big tf-false" onClick={() => answer(false)}><X aria-hidden /> {L('FAŁSZ', 'FALSE')} <small>←</small></button>
        <button className="btn big tf-true" onClick={() => answer(true)}><Check aria-hidden /> {L('PRAWDA', 'TRUE')} <small>→</small></button>
      </div>
    </div>
  );
}
