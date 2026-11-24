import { useEffect, useState } from 'react';
import type { MiniGameProps } from '../types';
import { sample } from '../utils/random';
import { lv } from '../utils/level';
import { useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

type Way = 'fire' | 'acid';
const CARDS: { text: [string, string]; way: Way; tech?: boolean }[] = [
  { text: ['Kość staje się krucha i rozsypuje się', 'The bone becomes brittle and crumbles'], way: 'fire' },
  { text: ['Kość staje się giętka – można ją zgiąć', 'The bone becomes bendy – you can bend it'], way: 'acid' },
  { text: ['Zostają same sole mineralne', 'Only mineral salts remain'], way: 'fire' },
  { text: ['Zostaje sama osseina (kolagen)', 'Only ossein (collagen) remains'], way: 'acid' },
  { text: ['Usunięto związki organiczne', 'Organic matter has been removed'], way: 'fire' },
  { text: ['Rozpuściły się związki wapnia', 'Calcium compounds have dissolved'], way: 'acid' },
  { text: ['Kość traci sprężystość', 'The bone loses its flexibility'], way: 'fire' },
  { text: ['Kość traci twardość', 'The bone loses its hardness'], way: 'acid' },
  { text: ['Wydziela się zapach spalenizny', 'There is a burning smell'], way: 'fire', tech: true },
  { text: ['Pojawiają się pęcherzyki CO₂ (z węglanu wapnia)', 'CO₂ bubbles appear (from calcium carbonate)'], way: 'acid', tech: true },
];

/** Doświadczenie z kością: wyprażanie czy kwas? */
export default function AcidFire(p: MiniGameProps) {
  const [items] = useState(() => sample(p.rng, CARDS.filter((c) => !c.tech || p.level !== 'primary'), lv(p.level, 3, 4, 5) + (p.intensity === 2 ? 1 : 0)));
  const [i, setI] = useState(0);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  const answer = (w: Way) => {
    const it = items[i];
    if (!it) return;
    if (w === it.way) {
      sfx('pop');
      if (i + 1 >= items.length) p.onDone({ success: true, info: L('Wyprażanie usuwa związki organiczne (osseinę) – kość jest twarda, ale krucha. Kwas rozpuszcza sole mineralne – kość jest elastyczna. Dopiero oba składniki razem dają kość twardą i sprężystą.', 'Heating removes organic matter (ossein) – the bone is hard but brittle. Acid dissolves mineral salts – the bone is flexible. Only both components together make bone hard and flexible.') });
      setI(i + 1);
    } else {
      mistake(L(`„${it.text[0]}” – to efekt ${it.way === 'fire' ? 'WYPRAŻANIA (ogień usuwa osseinę)' : 'KWASU (rozpuszcza sole mineralne)'}.`, `“${it.text[1]}” – this is the effect of ${it.way === 'fire' ? 'HEATING (fire removes ossein)' : 'ACID (it dissolves mineral salts)'}.`));
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') answer('fire'); if (e.key === 'ArrowRight') answer('acid'); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const it = items[Math.min(i, items.length - 1)];
  return (
    <div className="mg center">
      <p className="prompt">{L('Doświadczenie z kością kurzą. Co spowodowało ten efekt?', 'Chicken bone experiment. What caused this effect?')}</p>
      <div className="tf-card" key={i} aria-live="polite">{L(...it.text)}</div>
      <div className="tf-buttons">
        <button className="btn big fire-btn" onClick={() => answer('fire')}>🔥 {L('WYPRAŻANIE', 'HEATING')} <small>←</small></button>
        <button className="btn big acid-btn" onClick={() => answer('acid')}>🧪 {L('KWAS / OCET', 'ACID / VINEGAR')} <small>→</small></button>
      </div>
      <div className="tap-dots">{items.map((_, k) => <span key={k} className={k < i ? 'on' : ''} />)}</div>
    </div>
  );
}
