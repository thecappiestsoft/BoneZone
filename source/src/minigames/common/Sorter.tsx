import { useState } from 'react';
import type { MiniGameProps } from '../../types';
import { useDragTap } from './useDragTap';
import { useMistakes } from './hooks';
import { sfx } from '../../engine/sound';
import { L } from '../../i18n';

export interface SortEntry { id: string; label: string; bin: string; explanation?: string }

/** Klasyfikacja: przeciągnij (lub kliknij element, potem kategorię) do właściwego pojemnika. */
export function Sorter({ p, entries, bins, allowed, successInfo, binIcons }: {
  p: MiniGameProps;
  entries: SortEntry[];
  bins: string[];
  allowed: number;
  successInfo: string;
  binIcons?: Record<string, string>;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [shake, setShake] = useState<string | null>(null);
  const mistake = useMistakes(p, allowed);
  const { itemProps, targetProps, selected, ghost, dragging } = useDragTap((itemId, bin) => {
    const e = entries.find((x) => x.id === itemId);
    if (!e || placed[itemId]) return;
    if (e.bin === bin) {
      sfx('pop');
      const next = { ...placed, [itemId]: bin };
      setPlaced(next);
      if (Object.keys(next).length === entries.length) p.onDone({ success: true, info: successInfo });
    } else {
      setShake(itemId);
      setTimeout(() => setShake(null), 400);
      mistake(`„${e.label}” → ${e.bin}. ${e.explanation ?? ''}`.trim());
    }
  });
  const left = entries.filter((e) => !placed[e.id]);
  return (
    <div className="sorter">
      <div className="tray" aria-label={L('Elementy do posortowania', 'Items to sort')}>
        {left.map((e) => (
          <button key={e.id} className={`chip ${selected === e.id ? 'selected' : ''} ${shake === e.id ? 'shake' : ''} ${dragging === e.id ? 'is-dragging' : ''}`} {...itemProps(e.id)}>
            {e.label}
          </button>
        ))}
        {left.length === 0 && <span className="muted">{L('Wszystko posortowane!', 'All sorted!')}</span>}
      </div>
      <div className="bins" style={{ gridTemplateColumns: `repeat(${bins.length}, minmax(0,1fr))` }}>
        {bins.map((b, i) => (
          <button key={b} className={`bin bin-${i} ${selected ? 'armed' : ''}`} {...targetProps(b)} aria-label={`${L('Kategoria', 'Category')}: ${b}`}>
            <span className="bin-title">{binIcons?.[b] ? `${binIcons[b]} ` : ''}{b}</span>
            <span className="bin-items">
              {entries.filter((e) => placed[e.id] === b).map((e) => (
                <span key={e.id} className="mini-chip">{e.label}</span>
              ))}
            </span>
          </button>
        ))}
      </div>
      {ghost((id) => <span className="chip">{entries.find((e) => e.id === id)?.label}</span>)}
    </div>
  );
}
