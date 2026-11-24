import { useEffect, useRef, useState } from 'react';
import type { MiniGameProps } from '../types';
import { lv } from '../utils/level';
import { Art } from './common/Art';
import { useLoop } from './common/hooks';
import { sfx } from '../engine/sound';
import { L, t } from '../i18n';

const W = 100;
const H = 60;
interface Mol { x: number; y: number; taken: boolean }

/** Steruj kroplą krwi: (LO/T: najpierw witamina D) → zbierz wapń w jelicie → dostarcz do kości. */
export default function CalciumRun(p: MiniGameProps) {
  const needD = p.level !== 'primary';
  const nCa = lv(p.level, 3, 3, 4) + (p.intensity === 2 ? 1 : 0);
  const [, force] = useState(0);
  const st = useRef<{ x: number; y: number; tx: number | null; ty: number | null; ca: Mol[]; d: Mol | null; phase: 'vitd' | 'collect' | 'deliver' | 'done'; carried: number } | null>(null);
  if (!st.current) {
    st.current = {
      x: 50, y: 30, tx: null, ty: null, carried: 0, phase: needD ? 'vitd' : 'collect',
      ca: Array.from({ length: nCa }, () => ({ x: 5 + p.rng() * 17, y: 8 + p.rng() * 44, taken: false })),
      d: needD ? { x: 40 + p.rng() * 20, y: 8 + p.rng() * 44, taken: false } : null,
    };
  }
  const keys = useRef<Record<string, boolean>>({});
  const field = useRef<HTMLDivElement>(null);
  const speed = lv(p.level, 46, 52, 58);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key.startsWith('Arrow') || 'wasd'.includes(e.key)) { keys.current[e.key] = true; e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useLoop((dt) => {
    const s = st.current!;
    if (s.phase === 'done') return;
    const k = keys.current;
    let dx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0);
    let dy = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
    if (dx || dy) { s.tx = null; s.ty = null; }
    else if (s.tx != null && s.ty != null) {
      const ddx = s.tx - s.x, ddy = s.ty - s.y, d = Math.hypot(ddx, ddy);
      if (d > 1) { dx = ddx / d; dy = ddy / d; }
    }
    const len = Math.hypot(dx, dy) || 1;
    s.x = Math.max(3, Math.min(W - 3, s.x + (dx / len) * speed * dt));
    s.y = Math.max(4, Math.min(H - 4, s.y + (dy / len) * speed * dt));
    const near = (m: Mol) => !m.taken && Math.hypot(m.x - s.x, m.y - s.y) < 7;
    if (s.phase === 'vitd' && s.d && near(s.d)) { s.d.taken = true; sfx('good'); s.phase = 'collect'; }
    else if (s.phase === 'collect') {
      s.ca.forEach((m) => { if (near(m)) { m.taken = true; s.carried++; sfx('pop'); } });
      if (s.ca.every((m) => m.taken)) s.phase = 'deliver';
    } else if (s.phase === 'deliver' && s.x > 78) {
      s.phase = 'done';
      s.carried = 0;
      p.onDone({ success: true, info: needD
        ? L('Witamina D zwiększa wchłanianie wapnia w jelicie; krew dostarcza wapń do kości, gdzie osteoblasty wbudowują go w substancję międzykomórkową.', 'Vitamin D increases calcium absorption in the gut; blood carries calcium to bone, where osteoblasts build it into the matrix.')
        : L('Wapń z pożywienia wchłania się w jelicie i krew dostarcza go do kości. Źródła wapnia: mleko, jogurt, ser.', 'Calcium from food is absorbed in the gut and carried by blood to bone. Sources of calcium: milk, yoghurt, cheese.') });
    }
    force((n) => (n + 1) % 1e6);
  }, p.paused);

  const setTarget = (e: React.PointerEvent) => {
    const r = field.current!.getBoundingClientRect();
    st.current!.tx = ((e.clientX - r.left) / r.width) * W;
    st.current!.ty = ((e.clientY - r.top) / r.height) * H;
  };
  const s = st.current;
  const goal = L({ vitd: 'Najpierw złap witaminę D ☀️', collect: 'Zbierz Ca²⁺ w JELICIE', deliver: 'Dostarcz wapń do KOŚCI →', done: 'Gotowe!' }, { vitd: 'First grab vitamin D ☀️', collect: 'Collect Ca²⁺ in the GUT', deliver: 'Deliver calcium to the BONE →', done: 'Done!' })[s.phase];
  return (
    <div className="mg">
      <p className="prompt">{L(<>Steruj kroplą krwi: <b>kliknij/dotknij</b> miejsce na planszy (lub strzałki/WSAD). Cel: </>, <>Steer the blood drop: <b>click/tap</b> a spot on the board (or arrows/WASD). Goal: </>)}<b>{goal}</b></p>
      <div className="field transport" ref={field} style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={(e) => { setTarget(e); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (e.buttons) setTarget(e); }}>
        <div className="zone lungs"><span>{L('JELITO', 'GUT')}<br /><small>{L('wchłanianie', 'absorption')}</small></span></div>
        <div className="zone tissue"><span>{L('KOŚĆ', 'BONE')}<br /><small>{L('osteoblasty', 'osteoblasts')}</small></span></div>
        {s.d && !s.d.taken && <span className="mol" style={{ left: `${(s.d.x / W) * 100}%`, top: `${(s.d.y / H) * 100}%` }}><Art kind="vitd" size={50} label={t('witamina D')} /></span>}
        {s.ca.map((m, i) => !m.taken && (
          <span key={i} className={`mol ${s.phase === 'vitd' ? 'locked' : ''}`} style={{ left: `${(m.x / W) * 100}%`, top: `${(m.y / H) * 100}%` }}>
            <Art kind="ca" size={44} label={L('jon wapnia', 'calcium ion')} />
          </span>
        ))}
        <span className="player" style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%` }}>
          <Art kind="drop" size={58} label={L('Twoja kropla krwi', 'Your blood drop')} />
          {s.carried > 0 && <span className="carry">{s.carried}</span>}
        </span>
      </div>
    </div>
  );
}
