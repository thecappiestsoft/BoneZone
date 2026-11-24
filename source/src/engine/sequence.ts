import type { BankItem, Difficulty, Level, MiniGameMeta, Mode, Round } from '../types';
import type { Settings } from './settings';
import { BOSS_ID, MINIGAMES } from '../minigames/registry';
import { DIFF_ORDER } from '../data/catalog';
import { mulberry32, newSeed, type RNG } from '../utils/random';

/** Minigry dostępne przy aktualnych ustawieniach nauczyciela. */
export function eligibleGames(s: Settings, level: Level, bank: BankItem[]): MiniGameMeta[] {
  return MINIGAMES.filter((g) =>
    !g.bossOnly &&
    g.levels.includes(level) &&
    s.gameTypes.includes(g.type) &&
    !s.disabledGames.includes(g.id) &&
    g.categories.some((c) => s.categories.includes(c)) &&
    (!g.available || g.available(bank, level, s.categories)),
  );
}

export function timeFor(s: Settings, d: Difficulty, meta: MiniGameMeta, mode: Mode): number | null {
  if (mode === 'learn' || !s.timeLimitEnabled) return null;
  if (meta.timeOverride) return meta.timeOverride;
  return s.timeMode === 'fixed' ? s.fixedTime : s.diffTimes[d];
}

function shiftDiff(d: Difficulty, by: number): Difficulty {
  const i = Math.max(0, Math.min(DIFF_ORDER.length - 1, DIFF_ORDER.indexOf(d) + by));
  return DIFF_ORDER[i];
}

/**
 * Losuje kolejne minigry: preferuje najrzadziej używane, unika powtórzeń z rzędu
 * i przestrzega limitu powtórzeń ustawionego przez nauczyciela.
 */
export function buildRounds(s: Settings, mode: Mode, level: Level, count: number, bank: BankItem[], seed = newSeed(), only?: string): Round[] {
  const rng: RNG = mulberry32(seed);
  const pool = only ? MINIGAMES.filter((g) => g.id === only) : eligibleGames(s, level, bank);
  if (!pool.length) return [];
  const used: Record<string, number> = {};
  const recent: string[] = [];
  const rounds: Round[] = [];
  const gap = Math.min(4, pool.length - 1);
  const boss = mode === 'boss';
  for (let i = 0; i < count; i++) {
    let cands = pool.filter((g) => !recent.slice(-gap).includes(g.id) && (s.maxRepeats <= 0 || (used[g.id] ?? 0) < s.maxRepeats));
    if (!cands.length) cands = pool.filter((g) => !recent.slice(-gap).includes(g.id));
    if (!cands.length) cands = pool;
    if (boss) {
      // im dalej, tym trudniejsze minigry
      const want = Math.min(4, 1 + Math.floor((i / Math.max(1, count - 1)) * 3.5));
      const scored = cands.map((g) => ({ g, d: Math.abs(DIFF_ORDER.indexOf(g.difficulty[level] ?? 'medium') - want) }));
      const best = Math.min(...scored.map((x) => x.d));
      cands = scored.filter((x) => x.d <= best + 1).map((x) => x.g);
    }
    const minUse = Math.min(...cands.map((g) => used[g.id] ?? 0));
    const fresh = cands.filter((g) => (used[g.id] ?? 0) === minUse);
    const g = fresh[Math.floor(rng() * fresh.length)];
    used[g.id] = (used[g.id] ?? 0) + 1;
    recent.push(g.id);
    const intensity = boss ? Math.min(2, Math.floor((i / Math.max(1, count - 1)) * 3)) : Math.floor(rng() * 3);
    const difficulty = shiftDiff(g.difficulty[level] ?? 'medium', intensity === 2 ? 1 : 0);
    rounds.push({ gameId: g.id, intensity, difficulty, seed: Math.floor(rng() * 2 ** 31), time: timeFor(s, difficulty, g, mode) });
  }
  if (boss && !only) {
    const fin = MINIGAMES.find((g) => g.id === BOSS_ID)!;
    rounds.push({ gameId: fin.id, intensity: 2, difficulty: 'veryHard', seed: Math.floor(rng() * 2 ** 31), time: timeFor(s, 'veryHard', fin, mode) });
  }
  return rounds;
}
