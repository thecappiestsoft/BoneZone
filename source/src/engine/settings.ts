import type { Category, Difficulty, GameType, Level } from '../types';
import { CATEGORIES, GAME_TYPES } from '../data/catalog';
import { load, save } from './storage';
import { detectLang, type Lang } from '../i18n';

export type Theme = 'dark' | 'light';
/** Domyślnie motyw systemu; gra zapamiętuje wybór gracza. */
const detectTheme = (): Theme => (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

export interface Settings {
  level: Level;
  quickRounds: number;
  marathonRounds: number;
  bossRounds: number;
  classRounds: number;
  timeLimitEnabled: boolean;
  timeMode: 'byDifficulty' | 'fixed';
  fixedTime: number;
  diffTimes: Record<Difficulty, number>;
  feedbackSeconds: number;
  pointsCorrect: number;
  pointsSpeed: number;
  comboEnabled: boolean;
  combo3: number;
  combo5: number;
  combo10: number;
  penaltiesEnabled: boolean;
  mistakePenalty: number;
  wrongPenalty: number;
  /** ile razy ta sama minigra może pojawić się w jednej rozgrywce (0 = bez limitu) */
  maxRepeats: number;
  categories: Category[];
  gameTypes: GameType[];
  disabledGames: string[];
  sound: boolean;
  volume: number;
  animations: boolean;
  allowPause: boolean;
  uiScale: number;
  lang: Lang;
  theme: Theme;
}

export const DEFAULT_SETTINGS: Settings = {
  level: 'primary',
  quickRounds: 10,
  marathonRounds: 20,
  bossRounds: 8,
  classRounds: 8,
  timeLimitEnabled: true,
  timeMode: 'byDifficulty',
  fixedTime: 10,
  diffTimes: { veryEasy: 5, easy: 7, medium: 10, hard: 12, veryHard: 15 },
  feedbackSeconds: 1.8,
  pointsCorrect: 100,
  pointsSpeed: 25,
  comboEnabled: true,
  combo3: 50,
  combo5: 100,
  combo10: 250,
  penaltiesEnabled: true,
  mistakePenalty: 10,
  wrongPenalty: 0,
  maxRepeats: 2,
  categories: CATEGORIES.map((c) => c.id),
  gameTypes: GAME_TYPES.map((g) => g.id),
  disabledGames: [],
  sound: true,
  volume: 0.6,
  animations: true,
  allowPause: true,
  uiScale: 1,
  lang: detectLang(),
  theme: detectTheme(),
};

const KEY = 'settings.v1';
export function loadSettings(): Settings {
  const s = load<Partial<Settings>>(KEY, {});
  return { ...DEFAULT_SETTINGS, ...s, diffTimes: { ...DEFAULT_SETTINGS.diffTimes, ...(s.diffTimes ?? {}) } };
}
export const saveSettings = (s: Settings) => save(KEY, s);
