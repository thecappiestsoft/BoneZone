import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Home, Flame, Timer, Trophy, ChevronRight, Lightbulb } from 'lucide-react';
import type { BankItem, Level, MiniGameProps, MiniGameResult, Mode, Round, RoundLog, SessionSummary } from '../types';
import type { Settings } from './settings';
import { scoreRound, type RoundScore } from './scoring';
import { sfx } from './sound';
import { BOSS_ID, gameById, textFor } from '../minigames/registry';
import { GAME_TYPES } from '../data/catalog';
import { mulberry32 } from '../utils/random';
import { L, t } from '../i18n';

type Phase = 'intro' | 'announce' | 'play' | 'feedback';
interface Feedback { verdict: 'super' | 'good' | 'fail' | 'timeout'; score: RoundScore; info: string; learn: string }

interface Props {
  settings: Settings;
  bank: BankItem[];
  mode: Mode;
  level: Level;
  rounds: Round[];
  player?: string;
  skipIntro?: boolean;
  reduceMotion: boolean;
  onFinish: (s: SessionSummary) => void;
  onQuit: () => void;
  onRestart: () => void;
}

export function GameRunner({ settings: s, bank, mode, level, rounds, player, skipIntro, reduceMotion, onFinish, onQuit, onRestart }: Props) {
  const learn = mode === 'learn';
  const [phase, setPhase] = useState<Phase>(skipIntro ? 'announce' : 'intro');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [log, setLog] = useState<RoundLog[]>([]);
  const [paused, setPaused] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [floater, setFloater] = useState<{ id: number; text: string } | null>(null);

  const round = rounds[idx];
  const meta = gameById(round.gameId);
  const limitMs = round.time ? round.time * 1000 : null;

  // pomiar czasu z obsługą pauzy
  const clock = useRef({ start: 0, pausedAt: 0, pausedTotal: 0 });
  const mistakes = useRef(0);
  const roundDone = useRef(false);
  const lastTick = useRef(99);

  const now = () => performance.now();
  const elapsedNow = () => {
    const c = clock.current;
    if (!c.start) return 0;
    const pausedExtra = c.pausedAt ? now() - c.pausedAt : 0;
    return now() - c.start - c.pausedTotal - pausedExtra;
  };

  const startTimer = useCallback(() => {
    if (clock.current.start) return;
    clock.current = { start: performance.now(), pausedAt: 0, pausedTotal: 0 };
    setTimerOn(true);
  }, []);

  // faza intro / zapowiedź
  useEffect(() => {
    if (paused) return;
    if (phase === 'intro') {
      const t = setTimeout(() => setPhase('announce'), 3200);
      return () => clearTimeout(t);
    }
    if (phase === 'announce') {
      sfx('start');
      const t = setTimeout(() => setPhase('play'), learn ? 1800 : 1500);
      return () => clearTimeout(t);
    }
  }, [phase, paused, learn]);

  // start rundy
  useEffect(() => {
    if (phase !== 'play') return;
    roundDone.current = false;
    mistakes.current = 0;
    lastTick.current = 99;
    clock.current = { start: 0, pausedAt: 0, pausedTotal: 0 };
    setTimerOn(false);
    setElapsed(0);
    if (!meta.delayedTimer || learn) startTimer();
  }, [phase, idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishRound = useCallback((res: MiniGameResult, timeout = false) => {
    if (roundDone.current) return;
    roundDone.current = true;
    if (!clock.current.start) startTimer();
    const el = elapsedNow();
    const sc = scoreRound(s, { success: res.success, timeout, elapsedMs: el, limitMs, mistakes: mistakes.current, streakBefore: streak, learn });
    const verdict: Feedback['verdict'] = timeout ? 'timeout' : res.success ? (sc.speedBonus ? 'super' : 'good') : 'fail';
    sfx(timeout ? 'timeout' : res.success ? (sc.comboHit ? 'combo' : verdict === 'super' ? 'super' : 'good') : 'fail');
    setScore((v) => Math.max(0, v + sc.total));
    setStreak(sc.streak);
    setBest((b) => Math.max(b, sc.streak));
    setLog((l) => [...l, { gameId: meta.id, categories: meta.categories, success: res.success, timeout, timeMs: Math.round(el), speedBonus: sc.speedBonus, mistakes: mistakes.current, points: sc.total }]);
    setFb({
      verdict,
      score: sc,
      info: timeout ? textFor(meta.fact, level) : res.info ?? textFor(meta.fact, level),
      learn: meta.learn,
    });
    setPhase('feedback');
  }, [s, limitMs, streak, learn, meta, level, startTimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // licznik czasu
  useEffect(() => {
    if (phase !== 'play' || !timerOn || paused) return;
    const iv = setInterval(() => {
      const el = elapsedNow();
      setElapsed(el);
      if (limitMs) {
        const left = Math.ceil((limitMs - el) / 1000);
        if (left <= 3 && left >= 1 && left < lastTick.current) { lastTick.current = left; sfx('tick'); }
        if (el >= limitMs) finishRound({ success: false }, true);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [phase, timerOn, paused, limitMs, finishRound]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = useCallback(() => {
    if (phase !== 'feedback') return;
    if (idx + 1 >= rounds.length) {
      const all = log;
      const correct = all.filter((r) => r.success).length;
      sfx('end');
      onFinish({
        mode, level, player, date: new Date().toISOString(), score,
        rounds: all.length, correct, wrong: all.length - correct,
        accuracy: all.length ? Math.round((correct / all.length) * 100) : 0,
        bestCombo: best,
        avgTime: all.length ? Math.round(all.reduce((a, r) => a + r.timeMs, 0) / all.length / 100) / 10 : 0,
        log: all,
        bossCleared: mode === 'boss' && !!all.find((r) => r.gameId === BOSS_ID && r.success),
      });
      return;
    }
    setFb(null);
    setIdx(idx + 1);
    setPhase('announce');
  }, [phase, idx, rounds.length, log, mode, level, player, score, best, onFinish]);

  // automatyczne przejście po informacji zwrotnej
  useEffect(() => {
    if (phase !== 'feedback' || learn || paused) return;
    const t = setTimeout(next, s.feedbackSeconds * 1000 + (fb?.verdict === 'fail' || fb?.verdict === 'timeout' ? 600 : 0));
    return () => clearTimeout(t);
  }, [phase, learn, paused, next, s.feedbackSeconds, fb]);

  // pauza
  const togglePause = useCallback(() => {
    if (!s.allowPause && !paused) return;
    setPaused((p) => {
      const c = clock.current;
      if (!p) c.pausedAt = performance.now();
      else if (c.pausedAt) { c.pausedTotal += performance.now() - c.pausedAt; c.pausedAt = 0; }
      return !p;
    });
  }, [s.allowPause, paused]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause();
      if (e.key === 'Enter' && phase === 'feedback' && !paused) next();
      if (e.key === 'Enter' && phase === 'intro') setPhase('announce');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [togglePause, phase, paused, next]);

  const onMistake = useCallback(() => {
    if (roundDone.current) return;
    mistakes.current++;
    if (s.penaltiesEnabled && s.mistakePenalty > 0) setFloater({ id: Math.random(), text: `−${s.mistakePenalty}` });
  }, [s.penaltiesEnabled, s.mistakePenalty]);

  const rng = useMemo(() => mulberry32(round.seed), [round.seed, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const gameProps: MiniGameProps = {
    level, rng, intensity: round.intensity, timeLimit: round.time, paused: paused || phase !== 'play',
    reduceMotion, learn, bank, categories: s.categories,
    onDone: finishRound, onMistake, startTimer,
  };

  const Comp = meta.component;
  const timeLeft = limitMs ? Math.max(0, limitMs - elapsed) : null;
  const frac = limitMs ? (timerOn ? timeLeft! / limitMs : 1) : 1;
  const typeName = t(GAME_TYPES.find((x) => x.id === meta.type)?.name ?? '');

  return (
    <div className="runner">
      <header className="hud" aria-label={L('Pasek gry', 'Game bar')}>
        <div className="hud-left">
          <span className="hud-round">{mode === 'boss' && round.gameId === BOSS_ID ? L('FINAŁ', 'FINAL') : `${idx + 1}/${rounds.length}`}</span>
          {player && <span className="hud-player">{player}</span>}
        </div>
        <div className="hud-timer" aria-live="off">
          <Timer size={18} aria-hidden />
          <div className="timer-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} aria-label={L('Pozostały czas', 'Time left')}>
            <div className={`timer-fill ${frac < 0.3 ? 'low' : ''}`} style={{ transform: `scaleX(${phase === 'play' ? frac : 1})` }} />
          </div>
          <span className="timer-num">{limitMs ? (phase === 'play' && timerOn ? `${(timeLeft! / 1000).toFixed(1)} s` : phase === 'play' ? L('start…', 'ready…') : `${round.time} s`) : '∞'}</span>
        </div>
        <div className="hud-right">
          <span className="hud-score"><Trophy size={18} aria-hidden /> {score}</span>
          <span className={`hud-combo ${streak >= 3 ? 'hot' : ''}`} title={L('Seria poprawnych odpowiedzi', 'Correct answers in a row')}><Flame size={18} aria-hidden /> ×{streak}</span>
          {s.allowPause && <button className="icon-btn" onClick={togglePause} aria-label={paused ? L('Wznów', 'Resume') : L('Pauza', 'Pause')}>{paused ? <Play size={20} /> : <Pause size={20} />}</button>}
        </div>
      </header>

      <main className="stage">
        {phase === 'intro' && (
          <div className="screen-overlay intro" onClick={() => setPhase('announce')}>
            <div className="alarm" aria-hidden>⚠</div>
            <h2>{L('ALARM W PRACOWNI ANATOMII!', 'ALERT IN THE ANATOMY LAB!')}</h2>
            <p>{L('Szkielet się rozsypał! Wykonaj serię zadań, złóż kości, napraw połączenia i uratuj układ kostny!', 'The skeleton has fallen apart! Complete a series of tasks, put the bones together, fix the joints and save the skeletal system!')}</p>
            <button className="btn primary big" onClick={() => setPhase('announce')}>{L('Do dzieła!', 'Let’s go!')} <ChevronRight aria-hidden /></button>
          </div>
        )}
        {phase === 'announce' && (
          <div className="screen-overlay announce" key={idx}>
            <span className="type-pill">{typeName}</span>
            <h2 className="announce-title">{textFor(meta.instruction, level)}</h2>
            <p className="announce-time">{round.time ? L(<>Masz <b>{round.time} sekund</b>!</>, <>You have <b>{round.time} seconds</b>!</>) : L('Bez limitu czasu – skup się na zrozumieniu.', 'No time limit – focus on understanding.')}</p>
            <p className="muted">{meta.name}</p>
          </div>
        )}
        {(phase === 'play' || phase === 'feedback') && (
          <div className={`game-area ${phase === 'feedback' ? 'frozen' : ''}`} key={idx} inert={phase === 'feedback' ? true : undefined}>
            <Comp {...gameProps} />
          </div>
        )}
        {floater && <span key={floater.id} className="floater" onAnimationEnd={() => setFloater(null)}>{floater.text}</span>}
        {phase === 'feedback' && fb && (
          <div className={`feedback ${fb.verdict}`} role="status">
            <div className="verdict">{L({ super: 'SUPER!', good: 'DOBRZE!', fail: 'NIESTETY!', timeout: 'CZAS MINĄŁ!' }, { super: 'SUPER!', good: 'WELL DONE!', fail: 'OH NO!', timeout: 'TIME’S UP!' })[fb.verdict]}</div>
            <div className="points">
              {fb.score.base > 0 && <span>+{fb.score.base}</span>}
              {fb.score.speed > 0 && <span className="bonus">⚡ +{fb.score.speed}</span>}
              {fb.score.combo > 0 && <span className="bonus">🔥 COMBO ×{fb.score.comboHit} +{fb.score.combo}</span>}
              {fb.score.penalty > 0 && <span className="minus">−{fb.score.penalty}</span>}
              {fb.score.total === 0 && fb.score.penalty === 0 && <span>0 {L('pkt', 'pts')}</span>}
            </div>
            <p className="fb-info"><Lightbulb size={18} aria-hidden /> {fb.info}</p>
            {learn && <p className="fb-learn">{fb.learn}</p>}
            <button className="btn primary" onClick={next} autoFocus={learn}>{idx + 1 >= rounds.length ? L('Podsumowanie', 'Summary') : L('Dalej', 'Next')} <ChevronRight aria-hidden /></button>
          </div>
        )}
        {paused && (
          <div className="pause-overlay" role="dialog" aria-label={L('Pauza', 'Pause')}>
            <h2>{L('PAUZA', 'PAUSED')}</h2>
            <button className="btn primary big" onClick={togglePause}><Play aria-hidden /> {L('Wznów', 'Resume')}</button>
            <button className="btn" onClick={onRestart}><RotateCcw aria-hidden /> {L('Zacznij od nowa', 'Restart')}</button>
            <button className="btn ghost" onClick={onQuit}><Home aria-hidden /> {L('Menu główne', 'Main menu')}</button>
          </div>
        )}
      </main>
    </div>
  );
}
