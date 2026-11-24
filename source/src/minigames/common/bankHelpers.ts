import type { BankItem, Category, Level, MiniGameProps, PairItem } from '../../types';
import { bankFor } from '../../engine/bank';

export const cats = (p: MiniGameProps) => p.categories;
export const IMAGING = 'imaging';

/** Grupy par z co najmniej `min` unikalnymi pozycjami. */
export function pairGroups(bank: BankItem[], level: Level, cs: Category[], filter: (g: string) => boolean, min = 3) {
  const items = bankFor(bank, 'pair', level, cs).filter((x) => filter(x.group));
  const groups: Record<string, PairItem[]> = {};
  for (const it of items) {
    const g = (groups[it.group] ??= []);
    if (!g.some((x) => x.left === it.left || x.right === it.right)) g.push(it);
  }
  return Object.entries(groups).filter(([, v]) => v.length >= min);
}

/** Pozycje zestawu sortowania; zestaw dostępny, gdy ≥4 pozycje i ≥2 kategorie. */
export function sortPool(bank: BankItem[], set: string, level: Level, cs: Category[]) {
  const items = bankFor(bank, 'sort', level, cs).filter((x) => x.set === set);
  const bins = [...new Set(items.map((x) => x.bin))];
  return { items, bins, ok: items.length >= 4 && bins.length >= 2 };
}
