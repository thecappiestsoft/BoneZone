import { useEffect, useState } from 'react';
import type { ArtKind, MiniGameProps } from '../types';
import { pick } from '../utils/random';
import { lv } from '../utils/level';
import { Art, artName } from './common/Art';
import { useMistakes, useNumberKeys } from './common/hooks';
import { sfx } from '../engine/sound';
import { L,  } from '../i18n';

/** Zapamiętaj kolejność kości (lub komórek kostnych), a potem ją odtwórz. */
export default function MemoryBones(p: MiniGameProps) {
  const palette: ArtKind[] = lv(p.level, ['long', 'short', 'flat'], ['long', 'short', 'flat', 'irregular', 'sesamoid'], ['osteoblast', 'osteocyte', 'osteoclast', 'chondrocyte', 'long', 'flat']);
  const [seq] = useState(() => {
    const k = lv(p.level, 3, 4, 5) + (p.intensity === 2 ? 1 : 0);
    const s: ArtKind[] = [];
    while (s.length < k) { const c = pick(p.rng, palette); if (s[s.length - 1] !== c) s.push(c); }
    return s;
  });
  const [show, setShow] = useState(true);
  const [pos, setPos] = useState(0);
  const mistake = useMistakes(p, lv(p.level, 1, 0, 0));
  useEffect(() => {
    if (!show || p.paused) return;
    const t = setTimeout(() => { setShow(false); p.startTimer(); }, (p.learn ? 4500 : 1500) + seq.length * 450);
    return () => clearTimeout(t);
  }, [show, p.paused]); // eslint-disable-line react-hooks/exhaustive-deps
  const press = (k: ArtKind) => {
    if (show) return;
    if (k === seq[pos]) {
      sfx('pop');
      if (pos + 1 === seq.length) p.onDone({ success: true, info: L('Świetna pamięć! Kości dzielimy na długie, krótkie, płaskie i różnokształtne; tkankę kostną budują osteoblasty, osteocyty i osteoklasty.', 'Great memory! Bones are long, short, flat or irregular; bone tissue is built by osteoblasts, osteocytes and osteoclasts.') });
      setPos(pos + 1);
    } else {
      mistake(`${L('Kolejność', 'Order')}: ${seq.map((x) => artName(x)).join(' → ')}.`);
    }
  };
  return (
    <div className="mg center">
      <p className="prompt">{show ? L(<><b>ZAPAMIĘTAJ</b> kolejność!</>, <><b>REMEMBER</b> the order!</>) : L('Odtwórz kolejność – klikaj elementy.', 'Repeat the order – click the items.')}</p>
      <div className="seq-row">
        {seq.map((k, i) => (
          <div key={i} className={`seq-slot ${!show && i < pos ? 'ok' : ''}`}>
            {show || i < pos ? <Art kind={k} size={58} /> : <span className="q">?</span>}
            {(show || i < pos) && <small>{artName(k)}</small>}
          </div>
        ))}
      </div>
      {!show && (
        <div className="palette">
          {palette.map((k, i) => (
            <button key={k} className="palette-btn" onClick={() => press(k)}>
              <Art kind={k} size={52} />
              <small>{i + 1}. {artName(k)}</small>
            </button>
          ))}
          <Keys n={palette.length} on={(i) => press(palette[i])} />
        </div>
      )}
    </div>
  );
}
function Keys({ n, on }: { n: number; on: (i: number) => void }) { useNumberKeys(n, on); return null; }
