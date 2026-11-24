import { useRef, useState } from 'react';
import type { ArtKind, MiniGameProps } from '../../types';
import { scatter } from '../../utils/random';
import { Art, ART_SCALE, artName } from './Art';
import { L } from '../../i18n';
import { useLoop, useMistakes } from './hooks';
import { sfx } from '../../engine/sound';

interface Item { id: number; kind: ArtKind; x: number; y: number; vx: number; vy: number; target: boolean; state: 'alive' | 'popped' | 'wrong' }

/**
 * Plansza z poruszającymi się elementami. Kliknij wszystkie elementy docelowe.
 * Kliknięcie niewłaściwego = pomyłka (kara punktowa).
 */
export function CatchField({ p, targets, distractors, speed, allowed, successInfo, wrongInfo, onTargetHit, showLabels }: {
  p: MiniGameProps;
  targets: ArtKind[];
  distractors: ArtKind[];
  speed: number;
  allowed: number;
  successInfo: string;
  wrongInfo: (k: ArtKind) => string;
  onTargetHit?: (hit: Item, items: Item[]) => void;
  showLabels?: boolean;
}) {
  const [, force] = useState(0);
  const items = useRef<Item[] | null>(null);
  if (!items.current) {
    const all = [...targets.map((k) => ({ k, t: true })), ...distractors.map((k) => ({ k, t: false }))];
    const pts = scatter(p.rng, all.length, 16);
    items.current = all.map((a, i) => {
      const ang = p.rng() * Math.PI * 2;
      const sp = speed * (0.6 + p.rng() * 0.8) * (a.k === 'bacterium' || a.k === 'acid' ? 1.4 : 1);
      return { id: i, kind: a.k, x: pts[i].x, y: pts[i].y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, target: a.t, state: 'alive' };
    });
  }
  const mistake = useMistakes(p, allowed);
  const done = useRef(false);

  useLoop((dt) => {
    if (p.reduceMotion) return;
    for (const it of items.current!) {
      if (it.state !== 'alive') continue;
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      if (it.x < 6 || it.x > 94) { it.vx *= -1; it.x = Math.max(6, Math.min(94, it.x)); }
      if (it.y < 8 || it.y > 92) { it.vy *= -1; it.y = Math.max(8, Math.min(92, it.y)); }
    }
    force((n) => (n + 1) % 1000000);
  }, p.paused);

  const hit = (it: Item) => {
    if (it.state !== 'alive' || done.current) return;
    if (it.target) {
      it.state = 'popped';
      sfx('pop');
      onTargetHit?.(it, items.current!);
      if (items.current!.every((x) => !x.target || x.state === 'popped')) {
        done.current = true;
        p.onDone({ success: true, info: successInfo });
      }
    } else {
      it.state = 'wrong';
      setTimeout(() => { if (it.state === 'wrong') it.state = 'alive'; force((n) => n + 1); }, 450);
      mistake(wrongInfo(it.kind));
    }
    force((n) => n + 1);
  };

  const left = items.current.filter((x) => x.target && x.state !== 'popped').length;
  return (
    <div className="field catch-field">
      <div className="field-counter" aria-live="polite">{L('Zostało', 'Left')}: <b>{left}</b></div>
      {items.current.map((it) =>
        it.state === 'popped' ? (
          <span key={it.id} className="pop-fx" style={{ left: `${it.x}%`, top: `${it.y}%` }} aria-hidden>✓</span>
        ) : (
          <button key={it.id} className={`field-item ${it.state === 'wrong' ? 'shake bad-ring' : ''}`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
            onPointerDown={(e) => { e.preventDefault(); hit(it); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(it); } }}
            aria-label={artName(it.kind)}>
            <Art kind={it.kind} size={Math.round(62 * ART_SCALE[it.kind])} />
            {showLabels && <span className="cell-tag">{artName(it.kind)}</span>}
          </button>
        ),
      )}
    </div>
  );
}
