import type { ComponentType } from 'react';
import type { RNG } from './utils/random';

export type Level = 'primary' | 'highschool' | 'technical';
export type Difficulty = 'veryEasy' | 'easy' | 'medium' | 'hard' | 'veryHard';
export type GameType = 'reflex' | 'logic' | 'memory' | 'observation' | 'classification' | 'math' | 'spatial';
export type Mode = 'quick' | 'marathon' | 'boss' | 'learn' | 'class' | 'test';
export type Category =
  | 'funkcje' | 'tkanka' | 'budowa-kosci' | 'ksztalt' | 'sklad-chem' | 'czaszka' | 'kregoslup'
  | 'klatka' | 'konczyna-gorna' | 'konczyna-dolna' | 'polaczenia' | 'stawy' | 'wzrost' | 'zdrowie';

/** Rodzaje grafik używanych w minigrach (kości, komórki, cząsteczki). */
export type ArtKind =
  | 'long' | 'short' | 'flat' | 'irregular' | 'sesamoid'
  | 'osteoblast' | 'osteocyte' | 'osteoclast' | 'chondrocyte'
  | 'rbc' | 'bacterium' | 'neuron' | 'muscle'
  | 'ca' | 'po4' | 'vitd' | 'acid' | 'o2' | 'glucose' | 'crack' | 'drop';

/* ---------- Baza zadań (edytowalna przez nauczyciela) ---------- */
export interface BankBase {
  id: string;
  levels: Level[];
  category: Category;
  explanation: string;
}
export interface TFItem extends BankBase { type: 'tf'; statement: string; answer: boolean }
export interface OddItem extends BankBase { type: 'odd'; odd: string; others: string[] }
export interface PairItem extends BankBase { type: 'pair'; group: string; left: string; right: string }
export interface SortItem extends BankBase { type: 'sort'; set: string; item: string; bin: string }
export interface QuizItem extends BankBase { type: 'quiz'; question: string; correct: string; wrong: string[] }
export type BankItem = TFItem | OddItem | PairItem | SortItem | QuizItem;
export type BankType = BankItem['type'];

/* ---------- Minigry ---------- */
export interface MiniGameResult {
  success: boolean;
  /** krótka, konkretna informacja zwrotna dotycząca tej rozgrywki */
  info?: string;
}

export interface MiniGameProps {
  level: Level;
  rng: RNG;
  /** 0 – łagodniej, 1 – standard, 2 – trudniej (losowane lub rosnące w Boss Rush) */
  intensity: number;
  /** limit czasu w sekundach; null = bez limitu (tryb nauki / limit wyłączony) */
  timeLimit: number | null;
  paused: boolean;
  reduceMotion: boolean;
  learn: boolean;
  bank: BankItem[];
  /** kategorie tematyczne wybrane przez nauczyciela */
  categories: Category[];
  onDone: (r: MiniGameResult) => void;
  onMistake: () => void;
  /** dla minigier z fazą zapamiętywania/obserwacji – uruchamia licznik czasu */
  startTimer: () => void;
}

export interface MiniGameMeta {
  id: string;
  name: string;
  type: GameType;
  categories: Category[];
  levels: Level[];
  difficulty: Partial<Record<Level, Difficulty>>;
  /** krótkie polecenie na ekran zapowiedzi */
  instruction: string | Partial<Record<Level, string>>;
  /** domyślna informacja edukacyjna (gdy minigra nie poda własnej) */
  fact: string | Partial<Record<Level, string>>;
  /** dłuższe wyjaśnienie w trybie nauki */
  learn: string;
  delayedTimer?: boolean;
  /** stały czas (np. finał Boss Rush) */
  timeOverride?: number;
  bossOnly?: boolean;
  /** czy baza zadań zawiera wystarczająco danych dla danego poziomu i kategorii */
  available?: (bank: BankItem[], level: Level, cats: Category[]) => boolean;
  component: ComponentType<MiniGameProps>;
}

export interface Round {
  gameId: string;
  intensity: number;
  difficulty: Difficulty;
  seed: number;
  time: number | null;
}

export interface RoundLog {
  gameId: string;
  categories: Category[];
  success: boolean;
  timeout: boolean;
  timeMs: number;
  speedBonus: boolean;
  mistakes: number;
  points: number;
}

export interface SessionSummary {
  mode: Mode;
  level: Level;
  player?: string;
  date: string;
  score: number;
  rounds: number;
  correct: number;
  wrong: number;
  accuracy: number;
  bestCombo: number;
  avgTime: number;
  log: RoundLog[];
  bossCleared?: boolean;
}
