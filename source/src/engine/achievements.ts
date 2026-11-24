import type { Category, SessionSummary } from '../types';
import { load, save } from './storage';
import { isEn } from '../i18n';

export interface Achievement { id: string; name: string; desc: string; icon: string }
const ACH_PL: Achievement[] = [
  { id: 'bone-master', name: 'MISTRZ KOŚCI', desc: '10 poprawnych zadań o budowie i kształtach kości (łącznie).', icon: '🦴' },
  { id: 'guardian', name: 'STRAŻNIK KRĘGOSŁUPA', desc: '20 minigier z rzędu bez błędu.', icon: '🛡️' },
  { id: 'anatomist', name: 'ANATOM', desc: 'Perfekcyjnie wykonane zadania o częściach szkieletu (min. 3 w jednej grze).', icon: '💀' },
  { id: 'rescuer', name: 'RATOWNIK', desc: 'Wszystkie zadania o urazach i zdrowiu kości poprawnie (min. 2 w jednej grze).', icon: '🩹' },
  { id: 'lightning', name: 'BŁYSKAWICA', desc: '5 zadań z premią za szybkość w jednej grze.', icon: '⚡' },
  { id: 'first-bone', name: 'PIERWSZA KOŚĆ', desc: 'Ukończ pierwszą rozgrywkę.', icon: '🦷' },
  { id: 'marathon', name: 'MARATOŃCZYK', desc: 'Ukończ tryb Maraton.', icon: '🏃' },
  { id: 'boss', name: 'POGROMCA ZŁAMAŃ', desc: 'Pokonaj finał „Wielki Szkielet” w Boss Rush.', icon: '👑' },
  { id: 'scholar', name: 'PILNY ANATOM', desc: 'Ukończ tryb Nauki ze skutecznością min. 80%.', icon: '📚' },
  { id: 'perfect', name: 'CZYSTE RTG', desc: 'Ukończ grę (min. 10 zadań) bez żadnego błędu.', icon: '✨' },
];
const ACH_EN: Record<string, [string, string]> = {
  'bone-master': ['BONE MASTER', '10 correct tasks about bone structure and shapes (in total).'],
  guardian: ['SPINE GUARDIAN', '20 mini-games in a row without a mistake.'],
  anatomist: ['ANATOMIST', 'Perfect tasks about parts of the skeleton (min. 3 in one game).'],
  rescuer: ['RESCUER', 'All tasks about injuries and bone health correct (min. 2 in one game).'],
  lightning: ['LIGHTNING', '5 tasks with a speed bonus in one game.'],
  'first-bone': ['FIRST BONE', 'Finish your first game.'],
  marathon: ['MARATHON RUNNER', 'Finish Marathon mode.'],
  boss: ['FRACTURE CRUSHER', 'Beat the “Great Skeleton” finale in Boss Rush.'],
  scholar: ['DILIGENT ANATOMIST', 'Finish Learn mode with at least 80% accuracy.'],
  perfect: ['CLEAN X-RAY', 'Finish a game (min. 10 tasks) without any mistake.'],
};
/** Odznaki w bieżącym języku. */
export const achievements = (): Achievement[] => ACH_PL.map((a) => (isEn() ? { ...a, name: ACH_EN[a.id][0], desc: ACH_EN[a.id][1] } : a));

const BONE_CATS: Category[] = ['budowa-kosci', 'ksztalt'];
const SKELETON_CATS: Category[] = ['czaszka', 'kregoslup', 'klatka', 'konczyna-gorna', 'konczyna-dolna'];

interface Progress { unlocked: Record<string, string>; boneCorrect: number }
const KEY = 'achievements.v1';
export const loadProgress = (): Progress => ({ unlocked: {}, boneCorrect: 0, ...load<Partial<Progress>>(KEY, {}) });
export const resetProgress = () => save(KEY, { unlocked: {}, boneCorrect: 0 });

/** Aktualizuje postęp po zakończonej grze i zwraca nowo odblokowane osiągnięcia. */
export function evaluateSession(s: SessionSummary): Achievement[] {
  const p = loadProgress();
  const fresh: string[] = [];
  const unlock = (id: string) => { if (!p.unlocked[id]) { p.unlocked[id] = new Date().toISOString(); fresh.push(id); } };
  p.boneCorrect += s.log.filter((r) => r.success && r.categories.some((c) => BONE_CATS.includes(c))).length;
  if (p.boneCorrect >= 10) unlock('bone-master');
  if (s.bestCombo >= 20) unlock('guardian');
  const skel = s.log.filter((r) => r.categories.some((c) => SKELETON_CATS.includes(c)));
  if (skel.length >= 3 && skel.every((r) => r.success && r.mistakes === 0)) unlock('anatomist');
  const health = s.log.filter((r) => r.categories.includes('zdrowie'));
  if (health.length >= 2 && health.every((r) => r.success)) unlock('rescuer');
  if (s.log.filter((r) => r.speedBonus).length >= 5) unlock('lightning');
  if (s.mode !== 'test') unlock('first-bone');
  if (s.mode === 'marathon') unlock('marathon');
  if (s.mode === 'boss' && s.bossCleared) unlock('boss');
  if (s.mode === 'learn' && s.accuracy >= 80 && s.rounds >= 5) unlock('scholar');
  if (s.rounds >= 10 && s.wrong === 0 && s.log.every((r) => r.mistakes === 0)) unlock('perfect');
  save(KEY, p);
  return achievements().filter((a) => fresh.includes(a.id));
}

/* ---------- Wyniki ---------- */
const RKEY = 'results.v1';
export type StoredResult = Omit<SessionSummary, 'log'>;
export const loadResults = () => load<StoredResult[]>(RKEY, []);
export function saveResult(s: SessionSummary) {
  const { log: _log, ...rest } = s;
  void _log;
  const all = [rest, ...loadResults()].slice(0, 300);
  save(RKEY, all);
}
export const clearResults = () => save(RKEY, []);
