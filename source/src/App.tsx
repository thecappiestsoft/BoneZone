import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BankItem, Level, Mode, Round, SessionSummary } from './types';
import { loadSettings, saveSettings, type Settings } from './engine/settings';
import { loadBank, saveBank } from './engine/bank';
import { configureSound } from './engine/sound';
import { buildRounds, eligibleGames } from './engine/sequence';
import { evaluateSession, saveResult, type Achievement } from './engine/achievements';
import { GameRunner } from './engine/GameRunner';
import { MainMenu } from './components/MainMenu';
import { Summary } from './components/Summary';
import { AchievementsView } from './components/AchievementsView';
import { ClassChallenge } from './components/ClassChallenge';
import { Footer, Logo } from './components/Logo';
import { TeacherPanel } from './teacher/TeacherPanel';
import { L, setLang, type Lang } from './i18n';
import type { Theme } from './engine/settings';

type Screen = 'menu' | 'game' | 'summary' | 'teacher' | 'achievements' | 'class';

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  setLang(settings.lang);
  const [bank, setBankState] = useState<BankItem[]>(() => loadBank(settings.lang));
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('quick');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [runKey, setRunKey] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [fresh, setFresh] = useState<Achievement[]>([]);
  const [test, setTest] = useState<{ level: Level } | null>(null);
  const [sysReduce, setSysReduce] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setSysReduce(mq.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  const reduceMotion = !settings.animations || sysReduce;

  const update = useCallback((p: Partial<Settings>) => {
    setSettings((s) => {
      const n = { ...s, ...p };
      saveSettings(n);
      return n;
    });
  }, []);
  const setBank = useCallback((b: BankItem[]) => {
    setBankState(b);
    saveBank(b, settings.lang);
  }, [settings.lang]);
  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    update({ lang: l });
    setBankState(loadBank(l));
  }, [update]);
  const changeTheme = useCallback((th: Theme) => update({ theme: th }), [update]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'light' ? '#f3eee4' : '#0d1530');
  }, [settings.theme]);
  useEffect(() => {
    document.documentElement.lang = settings.lang;
    document.title = 'Bone Zone';
  }, [settings.lang]);

  useEffect(() => configureSound(settings.sound, settings.volume), [settings.sound, settings.volume]);
  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * settings.uiScale}px`;
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [settings.uiScale, reduceMotion]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const roundCount = (m: Mode) => (m === 'marathon' ? settings.marathonRounds : m === 'boss' ? settings.bossRounds : settings.quickRounds);
  const start = useCallback((m: Mode = mode) => {
    if (m === 'class') { setScreen('class'); return; }
    setTest(null);
    setRounds(buildRounds(settings, m, settings.level, roundCount(m), bank));
    setRunKey((k) => k + 1);
    setScreen('game');
  }, [mode, settings, bank]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTest = (gameId: string, level: Level) => {
    setTest({ level });
    setMode('test');
    setRounds(buildRounds(settings, 'test', level, 1, bank, undefined, gameId));
    setRunKey((k) => k + 1);
    setScreen('game');
  };

  const finish = (s: SessionSummary) => {
    if (test) { setTest(null); setMode('quick'); setScreen('teacher'); return; }
    saveResult(s);
    setFresh(evaluateSession(s));
    setSummary(s);
    setScreen('summary');
  };

  const eligibleCount = useMemo(() => (l: Level) => eligibleGames(settings, l, bank).length, [settings, bank]);

  return (
    <div className={`app screen-${screen}`}>
      <div className="app-body">
        {screen === 'menu' && (
          <MainMenu settings={settings} update={update} onLang={changeLang} onTheme={changeTheme} mode={mode === 'test' ? 'quick' : mode} setMode={setMode} onStart={() => start()}
            onTeacher={() => setScreen('teacher')} onAchievements={() => setScreen('achievements')} eligibleCount={eligibleCount} />
        )}
        {screen === 'game' && rounds.length > 0 && (
          <GameRunner key={runKey} settings={settings} bank={bank} mode={mode} level={test?.level ?? settings.level} rounds={rounds} reduceMotion={reduceMotion}
            skipIntro={!!test || mode === 'learn'}
            onFinish={finish} onQuit={() => setScreen(test ? 'teacher' : 'menu')} onRestart={() => (test ? setRunKey((k) => k + 1) : start(mode))} />
        )}
        {screen === 'game' && rounds.length === 0 && (
          <div className="page center"><Logo small /><p className="warn">{L('Brak minigier spełniających ustawienia. Zmień kategorie lub typy w panelu nauczyciela.', 'No mini-games match the settings. Change categories or types in the teacher panel.')}</p><button className="btn" onClick={() => setScreen('menu')}>{L('Menu główne', 'Main menu')}</button></div>
        )}
        {screen === 'summary' && summary && (
          <Summary s={summary} fresh={fresh} onAgain={() => start(summary.mode)} onLevel={() => setScreen('menu')} onMenu={() => setScreen('menu')} />
        )}
        {screen === 'teacher' && <TeacherPanel settings={settings} update={update} onLang={changeLang} onTheme={changeTheme} bank={bank} setBank={setBank} onBack={() => setScreen('menu')} onTest={startTest} />}
        {screen === 'achievements' && <AchievementsView onBack={() => setScreen('menu')} />}
        {screen === 'class' && <ClassChallenge settings={settings} bank={bank} level={settings.level} reduceMotion={reduceMotion} onExit={() => setScreen('menu')} />}
      </div>
      <Footer />
    </div>
  );
}
