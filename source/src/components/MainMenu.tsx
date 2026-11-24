import { Play, GraduationCap, Volume2, VolumeX, Award, Zap, Infinity as Inf, Skull, BookOpen, Users, Minus, Plus, Timer } from 'lucide-react';
import type { Level, Mode } from '../types';
import type { Settings } from '../engine/settings';
import { LEVELS } from '../data/catalog';
import { Logo } from './Logo';
import { LangSwitch } from './LangSwitch';
import { ThemeSwitch } from './ThemeSwitch';
import type { Theme } from '../engine/settings';
import { L, t, type Lang } from '../i18n';

const MODES = (): { id: Mode; name: string; desc: string; icon: typeof Zap }[] => [
  { id: 'quick', name: L('Szybka gra', 'Quick game'), desc: L('Seria losowych minigier na czas.', 'A series of random timed mini-games.'), icon: Zap },
  { id: 'marathon', name: L('Maraton', 'Marathon'), desc: L('20, 30 lub 50 minigier – pobij rekord!', '20, 30 or 50 mini-games – beat your record!'), icon: Inf },
  { id: 'boss', name: 'Boss Rush', desc: L('Coraz trudniej, a na końcu finał „Wielki Szkielet”.', 'Harder and harder, ending with the “Great Skeleton” finale.'), icon: Skull },
  { id: 'learn', name: L('Nauka', 'Learn'), desc: L('Bez presji czasu, z wyjaśnieniami.', 'No time pressure, with explanations.'), icon: BookOpen },
  { id: 'class', name: L('Wyzwanie klasowe', 'Class challenge'), desc: L('Gracze kolejno przy jednym stanowisku – ranking.', 'Players take turns at one device – leaderboard.'), icon: Users },
];

export function MainMenu({ settings, update, onLang, onTheme, mode, setMode, onStart, onTeacher, onAchievements, eligibleCount }: {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  onLang: (l: Lang) => void;
  onTheme: (t: Theme) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  onStart: () => void;
  onTeacher: () => void;
  onAchievements: () => void;
  eligibleCount: (l: Level) => number;
}) {
  const count = eligibleCount(settings.level);
  return (
    <div className="menu">
      <div className="menu-top">
        <div className="top-controls">
          <ThemeSwitch theme={settings.theme} onTheme={onTheme} />
          <LangSwitch lang={settings.lang} onLang={onLang} />
        </div>
        <Logo />
        <p className="tagline">{L(<>Pracownia anatomii zgłasza: <b>szkielet się rozsypał!</b> Tylko Ty możesz go złożyć.</>, <>The anatomy lab reports: <b>the skeleton has fallen apart!</b> Only you can put it back together.</>)}</p>
      </div>

      <section className="menu-section" aria-labelledby="lvl-h">
        <h2 id="lvl-h">{L('1. Poziom edukacyjny', '1. Education level')}</h2>
        <div className="level-cards" role="radiogroup">
          {LEVELS.map((l, i) => (
            <button key={l.id} role="radio" aria-checked={settings.level === l.id} className={`level-card ${settings.level === l.id ? 'active' : ''}`} onClick={() => update({ level: l.id as Level })}>
              <span className="level-icon" aria-hidden>{['🦴', '🔬', '🩻'][i]}</span>
              <b>{t(l.name)}</b>
              <small>{t(l.short)}</small>
              <span className="level-desc">{t(l.desc)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="menu-section" aria-labelledby="mode-h">
        <h2 id="mode-h">{L('2. Tryb gry', '2. Game mode')}</h2>
        <div className="mode-cards" role="radiogroup">
          {MODES().map((m) => (
            <button key={m.id} role="radio" aria-checked={mode === m.id} className={`mode-card ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
              <m.icon aria-hidden />
              <b>{m.name}</b>
              <small>{m.desc}</small>
            </button>
          ))}
        </div>
        {mode === 'marathon' && (
          <div className="seg" role="radiogroup" aria-label={L('Długość maratonu', 'Marathon length')}>
            {[20, 30, 50].map((n) => (
              <button key={n} role="radio" aria-checked={settings.marathonRounds === n} className={settings.marathonRounds === n ? 'active' : ''} onClick={() => update({ marathonRounds: n })}>{n} {L('minigier', 'mini-games')}</button>
            ))}
          </div>
        )}
      </section>

      <section className="menu-section" aria-labelledby="time-h">
        <h2 id="time-h">{L('3. Czas na zadanie', '3. Time per task')}</h2>
        {mode === 'learn' ? (
          <p className="muted">{L('W trybie Nauki zadania nie mają limitu czasu.', 'In Learn mode tasks have no time limit.')}</p>
        ) : (
          <TimePicker settings={settings} update={update} />
        )}
      </section>

      <button className="btn start-btn" onClick={onStart} disabled={count === 0}>
        <Play aria-hidden /> START
      </button>
      {count === 0 ? (
        <p className="warn">{L('Brak minigier dla wybranych ustawień – sprawdź kategorie i typy w panelu nauczyciela.', 'No mini-games for these settings – check categories and types in the teacher panel.')}</p>
      ) : (
        <p className="muted center-text">{L('Dostępnych minigier na tym poziomie:', 'Mini-games available at this level:')} <b>{count}</b></p>
      )}

      <div className="menu-bottom">
        <button className="btn ghost" onClick={onTeacher}><GraduationCap aria-hidden /> {L('Panel nauczyciela', 'Teacher panel')}</button>
        <button className="btn ghost" onClick={onAchievements}><Award aria-hidden /> {L('Odznaki i wyniki', 'Badges & scores')}</button>
        <div className="sound-ctrl">
          <button className="icon-btn" onClick={() => update({ sound: !settings.sound })} aria-label={settings.sound ? L('Wyłącz dźwięk', 'Mute') : L('Włącz dźwięk', 'Unmute')} aria-pressed={settings.sound}>
            {settings.sound ? <Volume2 /> : <VolumeX />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => update({ volume: Number(e.target.value), sound: true })} aria-label={L('Głośność', 'Volume')} />
        </div>
        <div className="scale-ctrl" aria-label={L('Rozmiar interfejsu', 'Interface size')}>
          <button className="icon-btn" onClick={() => update({ uiScale: Math.max(0.85, +(settings.uiScale - 0.15).toFixed(2)) })} aria-label={L('Zmniejsz interfejs', 'Smaller interface')}><Minus /></button>
          <span>A</span>
          <button className="icon-btn" onClick={() => update({ uiScale: Math.min(1.6, +(settings.uiScale + 0.15).toFixed(2)) })} aria-label={L('Powiększ interfejs', 'Larger interface')}><Plus /></button>
        </div>
      </div>
    </div>
  );
}

/* Wybór czasu: Auto (wg trudności) → 10 … 60 s → Bez limitu */
type TimeOpt = 'auto' | number | 'off';
const TIME_STEPS: TimeOpt[] = ['auto', 10, 20, 30, 40, 50, 60, 'off'];

function currentTime(s: Settings): TimeOpt {
  if (!s.timeLimitEnabled) return 'off';
  return s.timeMode === 'byDifficulty' ? 'auto' : s.fixedTime;
}
function applyTime(v: TimeOpt): Partial<Settings> {
  if (v === 'off') return { timeLimitEnabled: false };
  if (v === 'auto') return { timeLimitEnabled: true, timeMode: 'byDifficulty' };
  return { timeLimitEnabled: true, timeMode: 'fixed', fixedTime: v };
}
function timeLabel(v: TimeOpt) {
  return v === 'auto' ? 'Auto' : v === 'off' ? L('Bez limitu', 'No limit') : `${v} s`;
}

function TimePicker({ settings, update }: { settings: Settings; update: (p: Partial<Settings>) => void }) {
  const cur = currentTime(settings);
  // czas spoza skali (np. 8 s ustawione w panelu) – „+” idzie do najbliższego wyższego kroku, „−” do niższego
  const onGrid = TIME_STEPS.includes(cur);
  let idx = typeof cur === 'number' ? TIME_STEPS.findIndex((x) => typeof x === 'number' && x >= cur) : TIME_STEPS.indexOf(cur);
  if (idx < 0) idx = TIME_STEPS.length - 1;
  const step = (dir: -1 | 1) => {
    const next = onGrid ? idx + dir : dir === 1 ? idx : idx - 1;
    update(applyTime(TIME_STEPS[Math.max(0, Math.min(TIME_STEPS.length - 1, next))]));
  };
  const desc = cur === 'auto'
    ? L(`Czas zależny od trudności zadania: ${settings.diffTimes.veryEasy}–${settings.diffTimes.veryHard} s.`, `Time depends on task difficulty: ${settings.diffTimes.veryEasy}–${settings.diffTimes.veryHard} s.`)
    : cur === 'off' ? L('Zadania trwają do skutku – bez odliczania i premii za szybkość liczonej od limitu.', 'Tasks last until completed – no countdown and no limit-based speed bonus.')
    : L(`Każde zadanie: ${cur} sekund.`, `Each task: ${cur} seconds.`);
  return (
    <div className="time-picker">
      <div className="time-stepper" role="group" aria-label={L('Czas na zadanie', 'Time per task')}>
        <button className="icon-btn big" onClick={() => step(-1)} disabled={cur === TIME_STEPS[0]} aria-label={L('Mniej czasu', 'Less time')}><Minus /></button>
        <output className="time-value" aria-live="polite"><Timer aria-hidden /> {timeLabel(cur)}</output>
        <button className="icon-btn big" onClick={() => step(1)} disabled={cur === 'off'} aria-label={L('Więcej czasu', 'More time')}><Plus /></button>
      </div>
      <label className="time-select">
        <span className="muted">{L('lub wybierz z listy:', 'or pick from the list:')}</span>
        <select className="input" value={String(cur)} onChange={(e) => {
          const v = e.target.value;
          update(applyTime(v === 'auto' || v === 'off' ? v : Number(v)));
        }}>
          {typeof cur === 'number' && !TIME_STEPS.includes(cur) && <option value={cur}>{cur} s {L('(z panelu nauczyciela)', '(from teacher panel)')}</option>}
          {TIME_STEPS.map((t) => <option key={String(t)} value={String(t)}>{t === 'auto' ? L('Auto – według trudności', 'Auto – by difficulty') : timeLabel(t)}</option>)}
        </select>
      </label>
      <p className="muted time-desc">{desc}</p>
    </div>
  );
}
