import { useState } from 'react';
import { ArrowLeft, Play, Trophy, UserPlus, X } from 'lucide-react';
import type { BankItem, Level, Round, SessionSummary } from '../types';
import type { Settings } from '../engine/settings';
import { buildRounds } from '../engine/sequence';
import { saveResult } from '../engine/achievements';
import { GameRunner } from '../engine/GameRunner';
import { levelName } from '../data/catalog';
import { newSeed } from '../utils/random';
import { L, t } from '../i18n';

/** Wyzwanie klasowe – wariant lokalny: gracze kolejno przy jednym stanowisku, te same zadania dla wszystkich. */
export function ClassChallenge({ settings, bank, level, reduceMotion, onExit }: { settings: Settings; bank: BankItem[]; level: Level; reduceMotion: boolean; onExit: () => void }) {
  const [names, setNames] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [n, setN] = useState(settings.classRounds);
  const [stage, setStage] = useState<'setup' | 'ready' | 'play' | 'ranking'>('setup');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [cur, setCur] = useState(0);
  const [results, setResults] = useState<SessionSummary[]>([]);
  const [runKey, setRunKey] = useState(0);

  const add = () => {
    const parts = input.split(/[\n,;]/).map((x) => x.trim()).filter(Boolean);
    if (parts.length) setNames((v) => [...v, ...parts.filter((p) => !v.includes(p))].slice(0, 40));
    setInput('');
  };
  const start = () => {
    setRounds(buildRounds(settings, 'class', level, n, bank, newSeed()));
    setResults([]);
    setCur(0);
    setStage('ready');
  };
  if (stage === 'play') {
    return (
      <GameRunner key={runKey} settings={settings} bank={bank} mode="class" level={level} rounds={rounds} player={names[cur]} skipIntro reduceMotion={reduceMotion}
        onQuit={() => setStage('ranking')} onRestart={() => setRunKey((k) => k + 1)}
        onFinish={(s) => {
          saveResult(s);
          const all = [...results, s];
          setResults(all);
          if (cur + 1 >= names.length) setStage('ranking');
          else { setCur(cur + 1); setStage('ready'); }
        }} />
    );
  }
  if (stage === 'ready') {
    const last = results[results.length - 1];
    return (
      <div className="page center">
        {last && <p className="muted">{last.player}: <b>{last.score} {L('pkt', 'pts')}</b> ({last.accuracy}%)</p>}
        <h1>{L('Teraz gra:', 'Now playing:')}</h1>
        <div className="player-name">{names[cur]}</div>
        <p>{L('Gracz', 'Player')} {cur + 1} {L('z', 'of')} {names.length} · {rounds.length} {L('minigier', 'mini-games')} · {t(levelName(level))}</p>
        <button className="btn start-btn" onClick={() => setStage('play')} autoFocus><Play aria-hidden /> {L('JESTEM GOTOWY/GOTOWA', 'I’M READY')}</button>
        <button className="btn ghost" onClick={() => setStage('ranking')}>{L('Zakończ wyzwanie', 'End challenge')}</button>
      </div>
    );
  }
  if (stage === 'ranking') {
    const sorted = [...results].sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
    return (
      <div className="page">
        <h1><Trophy aria-hidden /> {L('Ranking klasy', 'Class leaderboard')}</h1>
        {sorted.length === 0 ? <p className="muted">{L('Nikt jeszcze nie zagrał.', 'Nobody has played yet.')}</p> : (
          <ol className="podium">
            {sorted.map((r, i) => (
              <li key={r.player} className={`podium-row p${i + 1}`}>
                <span className="place">{i + 1}</span>
                <b>{r.player}</b>
                <span>{r.score} {L('pkt', 'pts')}</span>
                <span>{r.accuracy}%</span>
                <span>COMBO ×{r.bestCombo}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="row">
          <button className="btn primary" onClick={start}>{L('Rewanż (nowe zadania)', 'Rematch (new tasks)')}</button>
          <button className="btn" onClick={() => setStage('setup')}>{L('Zmień graczy', 'Change players')}</button>
          <button className="btn ghost" onClick={onExit}>{L('Menu główne', 'Main menu')}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      <button className="btn ghost" onClick={onExit}><ArrowLeft aria-hidden /> {L('Wróć', 'Back')}</button>
      <h1>{L('Wyzwanie klasowe', 'Class challenge')}</h1>
      <p>{L(<>Gracze podchodzą kolejno do jednego stanowiska. Każdy dostaje <b>te same zadania</b> – wygrywa najwyższy wynik. Poziom: </>, <>Players take turns at one device. Everyone gets <b>the same tasks</b> – the highest score wins. Level: </>)}<b>{t(levelName(level))}</b>.</p>
      <div className="row">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={L('Imię lub pseudonim (można wkleić kilka po przecinku)', 'Name or nickname (you can paste several, comma-separated)')} aria-label={L('Imię gracza', 'Player name')} />
        <button className="btn" onClick={add}><UserPlus aria-hidden /> {L('Dodaj', 'Add')}</button>
      </div>
      <div className="name-chips">
        {names.map((x) => <span key={x} className="chip">{x} <button className="icon-btn tiny" onClick={() => setNames(names.filter((y) => y !== x))} aria-label={`${L('Usuń', 'Remove')} ${x}`}><X size={14} /></button></span>)}
        {names.length === 0 && <span className="muted">{L('Dodaj co najmniej dwóch graczy.', 'Add at least two players.')}</span>}
      </div>
      <label className="field-row">{L('Liczba minigier na gracza:', 'Mini-games per player:')}
        <input type="number" className="input small" min={3} max={30} value={n} onChange={(e) => setN(Math.max(3, Math.min(30, Number(e.target.value) || 3)))} />
      </label>
      <button className="btn start-btn" disabled={names.length < 2} onClick={start}><Play aria-hidden /> {L('Rozpocznij wyzwanie', 'Start the challenge')}</button>
    </div>
  );
}
