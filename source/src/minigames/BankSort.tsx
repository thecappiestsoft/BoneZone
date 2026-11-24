import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { sample, shuffle } from '../utils/random';
import { lv } from '../utils/level';
import { SORT_SETS } from '../data/questions';
import { Sorter } from './common/Sorter';
import { sortPool } from './common/bankHelpers';
import { L, t } from '../i18n';

/** Wspólny komponent dla minigier sortujących z bazy zadań. */
export function makeBankSort(set: string, prompt: [string, string], icons?: Record<string, string>) {
  return function BankSort(p: MiniGameProps) {
    const [task] = useState(() => {
      const { items, bins } = sortPool(p.bank, set, p.level, p.categories);
      const order = (SORT_SETS[set]?.bins ?? []).map(t);
      // przy wielu kategoriach (np. 4 kształty) losujemy 2–3, żeby plansza była czytelna
      const maxBins = lv(p.level, 2, 3, 4);
      const useBins = bins.length > maxBins ? sample(p.rng, bins, maxBins) : bins;
      const pool = items.filter((x) => useBins.includes(x.bin));
      const n = Math.min(pool.length, lv(p.level, 4, 5, 6) + (p.intensity === 2 ? 1 : 0));
      const first = useBins.map((b) => sample(p.rng, pool.filter((x) => x.bin === b), 1)[0]);
      const rest = sample(p.rng, pool.filter((x) => !first.includes(x)), Math.max(0, n - first.length));
      const chosen = shuffle(p.rng, [...first, ...rest]);
      const usedBins = [...new Set(chosen.map((x) => x.bin))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return { chosen, bins: usedBins };
    });
    return (
      <div className="mg">
        <p className="prompt">{L(prompt[0], prompt[1])}</p>
        <Sorter p={p} bins={task.bins} binIcons={icons && Object.fromEntries(Object.entries(icons).map(([k, v]) => [t(k), v]))} allowed={1}
          entries={task.chosen.map((x) => ({ id: x.id, label: x.item, bin: x.bin, explanation: x.explanation }))}
          successInfo={pickInfo(task.chosen.map((x) => x.explanation))} />
      </div>
    );
  };
}
const pickInfo = (arr: string[]) => arr.find((x) => x.includes('!') || x.length > 40) ?? arr[0];

export const SortShape = makeBankSort('shape', ['Posortuj kości według kształtu.', 'Sort the bones by shape.'], { 'Kości długie': '🦴', 'Kości krótkie': '🧊', 'Kości płaskie': '🛡️', 'Kości różnokształtne': '🧩' });
export const SortAxial = makeBankSort('axial', ['Szkielet osiowy czy szkielet kończyn? Uwaga na obręcze!', 'Axial or appendicular skeleton? Watch out for the girdles!'], { 'Szkielet osiowy': '🧍', 'Szkielet kończyn': '🦵' });
export const SortChem = makeBankSort('chem', ['Który składnik kości? Sole mineralne czy osseina?', 'Which bone component? Mineral salts or ossein?'], { 'Sole mineralne': '🪨', 'Osseina (związki organiczne)': '🧬' });
export const SortJoints = makeBankSort('joints', ['Połączenie ścisłe czy staw (połączenie ruchome)?', 'Fixed joint or synovial (movable) joint?'], { 'Połączenia ścisłe': '🔒', 'Stawy (połączenia ruchome)': '🔄' });
export const SortCells = makeBankSort('cells', ['Przypisz cechy do właściwych komórek tkanki kostnej.', 'Match the features to the right bone cells.'], { Osteoblasty: '🧱', Osteocyty: '🕸️', Osteoklasty: '⛏️' });
