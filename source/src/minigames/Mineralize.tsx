import { useEffect, useRef, useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { lv } from '../utils/level';
import { Art } from './common/Art';
import { useLoop, useMistakes } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

interface Drop { id: number; kind: ArtKind; x: number; y: number; v: number; gone: boolean }

/** Mineralizacja: osteoblast łapie Ca²⁺ i fosforany na włókna kolagenu; unikaj kwasu. */
export default function Mineralize(p: MiniGameProps) {
  const withAcid = p.level !== 'primary';
  const [, force] = useState(0);
  const st = useRef({ x: 50, drops: [] as Drop[], next: 0.2, t: 0, n: 0, ca: 0, po: 0, done: false });
  const keys = useRef({ l: false, r: false });
  const box = useRef<HTMLDivElement>(null);
  const mistake = useMistakes(p, lv(p.level, 9, 1, 0));
  const fall = lv(p.level, 26, 32, 38) * (1 + p.intensity * 0.15);

  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keys.current.l = true; if (e.key === 'ArrowRight') keys.current.r = true; };
    const u = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keys.current.l = false; if (e.key === 'ArrowRight') keys.current.r = false; };
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, []);

  useLoop((dt) => {
    const s = st.current;
    if (s.done) return;
    s.t += dt;
    s.x = Math.max(6, Math.min(94, s.x + ((keys.current.r ? 1 : 0) - (keys.current.l ? 1 : 0)) * 70 * dt));
    if (s.t >= s.next) {
      const r = p.rng();
      const kind: ArtKind = withAcid && r < lv(p.level, 0, 0.28, 0.36) ? 'acid' : p.level === 'technical' && r > 0.85 ? 'glucose' : p.rng() < 0.5 ? 'ca' : 'po4';
      s.drops.push({ id: s.n++, kind, x: 8 + p.rng() * 84, y: -6, v: fall * (0.8 + p.rng() * 0.4), gone: false });
      s.next = s.t + lv(p.level, 0.7, 0.58, 0.5);
    }
    for (const d of s.drops) {
      if (d.gone) continue;
      d.y += d.v * dt;
      if (d.y > 76 && d.y < 92 && Math.abs(d.x - s.x) < 11) {
        d.gone = true;
        if (d.kind === 'ca' || d.kind === 'po4') {
          if (d.kind === 'ca' && s.ca < 2) { s.ca++; sfx('pop'); }
          else if (d.kind === 'po4' && s.po < 2) { s.po++; sfx('pop'); }
          else sfx('click');
          if (s.ca >= 2 && s.po >= 2) {
            s.done = true;
            p.onDone({ success: true, info: L('Fosforany wapnia krystalizują na włóknach kolagenu (osseiny) jako hydroksyapatyt – kość jest twarda, a zarazem sprężysta.', 'Calcium phosphates crystallise on collagen (ossein) fibres as hydroxyapatite – bone is hard and flexible at the same time.') });
          }
        } else {
          mistake(d.kind === 'acid' ? L('Kwas rozpuszcza sole mineralne kości (jak w doświadczeniu z octem)!', 'Acid dissolves bone minerals (as in the vinegar experiment)!') : L('Glukoza to źródło energii, a nie budulec mineralny kości.', 'Glucose is an energy source, not a bone mineral.'));
        }
      }
      if (d.y > 100) d.gone = true;
    }
    s.drops = s.drops.filter((d) => !d.gone || d.y < 0);
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const s = st.current;
  const move = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    s.x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100));
  };
  return (
    <div className="mg">
      <p className="prompt">{L(<>Przesuwaj osteoblast (mysz, palec lub ← →) i łap <b>2 × Ca²⁺</b> oraz <b>2 × fosforan (P)</b></>, <>Move the osteoblast (mouse, finger or ← →) and catch <b>2 × Ca²⁺</b> and <b>2 × phosphate (P)</b></>)}{withAcid ? L(<>. Unikaj <b>kwasu H⁺</b>!</>, <>. Avoid <b>acid H⁺</b>!</>) : '.'}</p>
      <div className="field hemo" ref={box} onPointerMove={move} onPointerDown={move}>
        {s.drops.filter((d) => !d.gone).map((d) => (
          <span key={d.id} className="mol" style={{ left: `${d.x}%`, top: `${d.y}%` }}><Art kind={d.kind} size={42} label={d.kind} /></span>
        ))}
        <span className="catcher" style={{ left: `${s.x}%` }}>
          <Art kind="osteoblast" size={70} label="osteoblast" />
          <span className="hemes" aria-label={L(`Wapń ${s.ca} z 2, fosforany ${s.po} z 2`, `Calcium ${s.ca} of 2, phosphates ${s.po} of 2`)}>
            {[0, 1].map((i) => <span key={`c${i}`} className={`heme ${i < s.ca ? 'full' : ''}`}>Ca</span>)}
            {[0, 1].map((i) => <span key={`p${i}`} className={`heme ${i < s.po ? 'full' : ''}`}>P</span>)}
          </span>
        </span>
      </div>
      <div className="move-buttons">
        <button className="btn ghost" onPointerDown={() => (keys.current.l = true)} onPointerUp={() => (keys.current.l = false)} onPointerLeave={() => (keys.current.l = false)} aria-label={L('W lewo', 'Left')}>◀</button>
        <button className="btn ghost" onPointerDown={() => (keys.current.r = true)} onPointerUp={() => (keys.current.r = false)} onPointerLeave={() => (keys.current.r = false)} aria-label={L('W prawo', 'Right')}>▶</button>
      </div>
    </div>
  );
}
