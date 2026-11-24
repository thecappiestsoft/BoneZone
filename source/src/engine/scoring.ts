import type { Settings } from './settings';
import { L } from '../i18n';

export interface RoundScoreInput {
  success: boolean;
  timeout: boolean;
  elapsedMs: number;
  limitMs: number | null;
  mistakes: number;
  streakBefore: number;
  learn: boolean;
}
export interface RoundScore {
  base: number;
  speed: number;
  combo: number;
  penalty: number;
  total: number;
  streak: number;
  speedBonus: boolean;
  comboHit: number | null;
}

/** Punktacja pojedynczej rundy – czysta funkcja, łatwa do testowania. */
export function scoreRound(s: Settings, r: RoundScoreInput): RoundScore {
  const streak = r.success ? r.streakBefore + 1 : 0;
  const base = r.success ? s.pointsCorrect : 0;
  const fastEnough = r.limitMs ? r.elapsedMs <= r.limitMs * 0.5 : r.elapsedMs <= 4000;
  const speedBonus = r.success && !r.learn && r.mistakes === 0 && fastEnough;
  const speed = speedBonus ? s.pointsSpeed : 0;
  let combo = 0;
  let comboHit: number | null = null;
  if (s.comboEnabled && r.success) {
    if (streak === 3) combo = s.combo3;
    else if (streak === 5) combo = s.combo5;
    else if (streak % 10 === 0) combo = s.combo10;
    if (combo) comboHit = streak;
  }
  let penalty = 0;
  if (s.penaltiesEnabled) {
    penalty += r.mistakes * s.mistakePenalty;
    if (!r.success && !r.timeout) penalty += s.wrongPenalty;
  }
  return { base, speed, combo, penalty, total: base + speed + combo - penalty, streak, speedBonus, comboHit };
}

export function rankFor(accuracy: number): { title: string; stars: number } {
  if (accuracy >= 95) return { title: L('Mistrz Anatomii', 'Anatomy Master'), stars: 5 };
  if (accuracy >= 80) return { title: L('Specjalista Ortopedii', 'Orthopaedic Specialist'), stars: 4 };
  if (accuracy >= 65) return { title: L('Asystent Anatoma', 'Anatomist’s Assistant'), stars: 3 };
  if (accuracy >= 45) return { title: L('Praktykant Pracowni RTG', 'X-ray Lab Trainee'), stars: 2 };
  return { title: L('Stażysta – trenuj dalej!', 'Intern – keep practising!'), stars: 1 };
}
