import { useState } from 'react';
import { ArrowLeft, Download, Trash2, PlayCircle, RotateCcw } from 'lucide-react';
import type { BankItem, Level } from '../types';
import { DEFAULT_SETTINGS, type Settings } from '../engine/settings';
import { CATEGORIES, DIFFICULTIES, GAME_TYPES, LEVELS, catName, levelName } from '../data/catalog';
import { MINIGAMES, locMeta } from '../minigames/registry';
import { L, locale, t, t as tr, type Lang } from '../i18n';
import { LangSwitch } from '../components/LangSwitch';
import { ThemeSwitch } from '../components/ThemeSwitch';
import type { Theme } from '../engine/settings';
import { eligibleGames } from '../engine/sequence';
import { clearResults, loadResults, resetProgress } from '../engine/achievements';
import { downloadFile } from '../engine/storage';
import { modeName } from '../components/AchievementsView';
import { NumberField, Toggle } from './fields';
import { QuestionBankEditor } from './QuestionBankEditor';

const TABS = ['Rozgrywka', 'Punktacja', 'Kategorie', 'Minigry', 'Dostępność', 'Baza zadań', 'Wyniki'] as const;
const TAB_EN: Record<string, string> = { Rozgrywka: 'Gameplay', Punktacja: 'Scoring', Kategorie: 'Categories', Minigry: 'Mini-games', 'Dostępność': 'Accessibility', 'Baza zadań': 'Task bank', Wyniki: 'Results' };
type Tab = (typeof TABS)[number];
const LV_SHORT = (): Record<Level, string> => L({ primary: 'SP', highschool: 'LO', technical: 'T' }, { primary: 'PS', highschool: 'HS', technical: 'VS' });

export function TeacherPanel({ settings: s, update, onLang, onTheme, bank, setBank, onBack, onTest }: {
  settings: Settings;
  update: (p: Partial<Settings>) => void;
  onLang: (l: Lang) => void;
  onTheme: (t: Theme) => void;
  bank: BankItem[];
  setBank: (b: BankItem[]) => void;
  onBack: () => void;
  onTest: (gameId: string, level: Level) => void;
}) {
  const [tab, setTab] = useState<Tab>('Rozgrywka');
  const [, refresh] = useState(0);
  const counts = LEVELS.map((l) => ({ l, n: eligibleGames(s, l.id, bank).length }));

  return (
    <div className="page teacher">
      <div className="row between">
        <button className="btn ghost" onClick={onBack}><ArrowLeft aria-hidden /> {L('Menu główne', 'Main menu')}</button>
        <div className="top-controls"><ThemeSwitch theme={s.theme} onTheme={onTheme} /><LangSwitch lang={s.lang} onLang={onLang} /></div>
        <span className="saved-note" role="status">{L('✓ Ustawienia zapisują się automatycznie na tym urządzeniu', '✓ Settings are saved automatically on this device')}</span>
      </div>
      <h1>{L('Panel nauczyciela', 'Teacher panel')}</h1>
      <p className="muted">{L('Aktywne minigry', 'Active mini-games')}: {counts.map(({ l, n }) => <span key={l.id} className={n ? '' : 'warn'}><b>{t(l.name)}</b>: {n}{' '}</span>)}</p>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{L(t, TAB_EN[t])}</button>)}
      </div>

      <div className="tab-body" role="tabpanel">
        {tab === 'Rozgrywka' && (
          <div className="grid2">
            <section className="panel">
              <h2>{L('Domyślne ustawienia gry', 'Default game settings')}</h2>
              <label className="field-row">{L('Poziom edukacyjny', 'Education level')}
                <select className="input" value={s.level} onChange={(e) => update({ level: e.target.value as Level })}>
                  {LEVELS.map((l) => <option key={l.id} value={l.id}>{t(l.name)}</option>)}
                </select>
              </label>
              <NumberField label={L('Liczba minigier – Szybka gra / Nauka', 'Mini-games – Quick game / Learn')} value={s.quickRounds} min={3} max={60} onChange={(v) => update({ quickRounds: v })} />
              <label className="field-row">{L('Długość Maratonu', 'Marathon length')}
                <select className="input" value={s.marathonRounds} onChange={(e) => update({ marathonRounds: Number(e.target.value) })}>
                  {[20, 30, 50].map((n) => <option key={n} value={n}>{n} {L('minigier', 'mini-games')}</option>)}
                </select>
              </label>
              <NumberField label={L('Liczba minigier przed finałem Boss Rush', 'Mini-games before the Boss Rush finale')} value={s.bossRounds} min={3} max={20} onChange={(v) => update({ bossRounds: v })} />
              <NumberField label={L('Liczba minigier – Wyzwanie klasowe', 'Mini-games – Class challenge')} value={s.classRounds} min={3} max={30} onChange={(v) => update({ classRounds: v })} />
              <NumberField label={L('Maks. powtórzeń tej samej minigry w grze (0 = bez limitu)', 'Max repeats of the same mini-game (0 = no limit)')} value={s.maxRepeats} min={0} max={10} onChange={(v) => update({ maxRepeats: v })} />
              <NumberField label={L('Czas wyświetlania informacji zwrotnej', 'Feedback display time')} value={s.feedbackSeconds} min={0.8} max={6} step={0.2} suffix="s" onChange={(v) => update({ feedbackSeconds: v })} />
            </section>
            <section className="panel">
              <h2>{L('Czas zadań', 'Task time')}</h2>
              <Toggle label={L('Limit czasu włączony', 'Time limit on')} checked={s.timeLimitEnabled} onChange={(v) => update({ timeLimitEnabled: v })} hint={L('Po wyłączeniu zadania trwają do skutku (tryb Nauki zawsze bez limitu).', 'When off, tasks last until completed (Learn mode never has a limit).')} />
              <div className="seg" role="radiogroup" aria-label={L('Sposób ustalania czasu', 'How time is set')}>
                <button role="radio" aria-checked={s.timeMode === 'byDifficulty'} className={s.timeMode === 'byDifficulty' ? 'active' : ''} onClick={() => update({ timeMode: 'byDifficulty' })}>{L('Zależny od trudności', 'By difficulty')}</button>
                <button role="radio" aria-checked={s.timeMode === 'fixed'} className={s.timeMode === 'fixed' ? 'active' : ''} onClick={() => update({ timeMode: 'fixed' })}>{L('Jeden czas dla wszystkich', 'Same time for all')}</button>
              </div>
              {s.timeMode === 'fixed' ? (
                <NumberField label={L('Czas każdego zadania', 'Time for each task')} value={s.fixedTime} min={3} max={60} suffix="s" onChange={(v) => update({ fixedTime: v })} />
              ) : (
                DIFFICULTIES.map((d) => (
                  <NumberField key={d.id} label={t(d.name)} value={s.diffTimes[d.id]} min={3} max={60} suffix="s" onChange={(v) => update({ diffTimes: { ...s.diffTimes, [d.id]: v } })} />
                ))
              )}
              <p className="muted small">{L('Minigry pamięciowe i obserwacyjne liczą czas dopiero po fazie zapamiętywania. Finał Boss Rush ma stały czas 40 s.', 'Memory and observation mini-games start the clock after the memorising phase. The Boss Rush finale always has 40 s.')}</p>
            </section>
          </div>
        )}

        {tab === 'Punktacja' && (
          <section className="panel narrow-panel">
            <NumberField label={L('Punkty za poprawne wykonanie', 'Points for a correct task')} value={s.pointsCorrect} min={0} max={1000} onChange={(v) => update({ pointsCorrect: v })} />
            <NumberField label={L('Premia za szybkość (bez błędów, w pierwszej połowie czasu)', 'Speed bonus (no mistakes, within the first half of the time)')} value={s.pointsSpeed} min={0} max={500} onChange={(v) => update({ pointsSpeed: v })} />
            <Toggle label={L('System COMBO', 'COMBO system')} checked={s.comboEnabled} onChange={(v) => update({ comboEnabled: v })} />
            {s.comboEnabled && (<>
              <NumberField label="COMBO ×3" value={s.combo3} min={0} max={1000} onChange={(v) => update({ combo3: v })} />
              <NumberField label="COMBO ×5" value={s.combo5} min={0} max={1000} onChange={(v) => update({ combo5: v })} />
              <NumberField label={L('COMBO ×10 (i każde kolejne 10)', 'COMBO ×10 (and every further 10)')} value={s.combo10} min={0} max={2000} onChange={(v) => update({ combo10: v })} />
            </>)}
            <Toggle label={L('Kary za błędy', 'Penalties for mistakes')} checked={s.penaltiesEnabled} onChange={(v) => update({ penaltiesEnabled: v })} />
            {s.penaltiesEnabled && (<>
              <NumberField label={L('Kara za pomyłkę w trakcie zadania (np. złe kliknięcie)', 'Penalty for a slip during a task (e.g. a wrong click)')} value={s.mistakePenalty} min={0} max={500} onChange={(v) => update({ mistakePenalty: v })} />
              <NumberField label={L('Kara za błędnie wykonane zadanie', 'Penalty for a failed task')} value={s.wrongPenalty} min={0} max={500} onChange={(v) => update({ wrongPenalty: v })} />
            </>)}
            <p className="muted small">{L('Brak wykonania w czasie = 0 pkt (bez dodatkowej kary). Wynik całkowity nie spada poniżej zera.', 'Not finished in time = 0 pts (no extra penalty). The total score never drops below zero.')}</p>
          </section>
        )}

        {tab === 'Kategorie' && (
          <section className="panel">
            <div className="row"><button className="btn" onClick={() => update({ categories: CATEGORIES.map((c) => c.id) })}>{L('Zaznacz wszystkie', 'Select all')}</button><button className="btn ghost" onClick={() => update({ categories: [] })}>{L('Odznacz wszystkie', 'Deselect all')}</button></div>
            <div className="check-grid">
              {CATEGORIES.map((c) => {
                const n = MINIGAMES.filter((g) => !g.bossOnly && g.categories.includes(c.id)).length;
                return (
                  <Toggle key={c.id} label={<>{t(c.name)} <small className="muted">({n} {L('minigier', 'mini-games')})</small></>} checked={s.categories.includes(c.id)}
                    onChange={(v) => update({ categories: v ? [...s.categories, c.id] : s.categories.filter((x) => x !== c.id) })} />
                );
              })}
            </div>
            <p className="muted small">{L('Minigra pojawi się, jeśli dotyczy co najmniej jednej zaznaczonej kategorii. Zadania z bazy (np. „Prawda czy fałsz?”) są dodatkowo filtrowane po kategorii.', 'A mini-game appears if it covers at least one selected category. Bank tasks (e.g. “True or false?”) are also filtered by category.')}</p>
          </section>
        )}

        {tab === 'Minigry' && (
          <section className="panel">
            <h2>{L('Typy minigier', 'Mini-game types')}</h2>
            <div className="check-grid">
              {GAME_TYPES.map((t) => <Toggle key={t.id} label={L(t.name, tr(t.name))} checked={s.gameTypes.includes(t.id)} onChange={(v) => update({ gameTypes: v ? [...s.gameTypes, t.id] : s.gameTypes.filter((x) => x !== t.id) })} />)}
            </div>
            <h2>{L('Poszczególne minigry', 'Individual mini-games')} ({MINIGAMES.filter((g) => !g.bossOnly).length} + {L('finał', 'finale')})</h2>
            <ul className="game-list">
              {MINIGAMES.map(locMeta).map((g) => (
                <li key={g.id} className={!s.gameTypes.includes(g.type) ? 'dim' : ''}>
                  {g.bossOnly ? <span className="type-pill boss">{L('FINAŁ', 'FINALE')}</span> : <Toggle label="" checked={!s.disabledGames.includes(g.id)} onChange={(v) => update({ disabledGames: v ? s.disabledGames.filter((x) => x !== g.id) : [...s.disabledGames, g.id] })} />}
                  <div className="gl-main">
                    <b>{g.name}</b>
                    <small>{tr(GAME_TYPES.find((x) => x.id === g.type)?.name ?? '')} · {g.categories.map((c) => tr(catName(c))).join(', ')}</small>
                  </div>
                  <span className="lv-badges">{g.levels.map((l) => <span key={l} className="lv">{LV_SHORT()[l]}</span>)}</span>
                  <span className="test-btns">
                    {g.levels.map((l) => <button key={l} className="btn tiny" onClick={() => onTest(g.id, l)} title={`${L('Wypróbuj', 'Try')}: ${tr(levelName(l))}`}><PlayCircle size={14} aria-hidden /> {LV_SHORT()[l]}</button>)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'Dostępność' && (
          <section className="panel narrow-panel">
            <Toggle label={L('Dźwięki', 'Sounds')} checked={s.sound} onChange={(v) => update({ sound: v })} />
            <label className="field-row">{L('Głośność', 'Volume')}<input type="range" min={0} max={1} step={0.05} value={s.volume} onChange={(e) => update({ volume: Number(e.target.value) })} /></label>
            <Toggle label={L('Animacje (ruch elementów, efekty przejść)', 'Animations (moving items, transitions)')} checked={s.animations} onChange={(v) => update({ animations: v })} hint={L('Po wyłączeniu elementy w minigrach zręcznościowych stoją w miejscu. Ustawienie systemowe „ogranicz ruch” jest respektowane automatycznie.', 'When off, items in reflex mini-games stand still. The system “reduce motion” setting is respected automatically.')} />
            <Toggle label={L('Możliwość pauzy (przycisk i klawisz Esc)', 'Allow pause (button and Esc key)')} checked={s.allowPause} onChange={(v) => update({ allowPause: v })} />
            <label className="field-row">{L('Rozmiar interfejsu', 'Interface size')}
              <select className="input" value={s.uiScale} onChange={(e) => update({ uiScale: Number(e.target.value) })}>
                {[0.85, 1, 1.15, 1.3, 1.45, 1.6].map((v) => <option key={v} value={v}>{Math.round(v * 100)}%</option>)}
              </select>
            </label>
            <p className="muted small">{L('Każde przeciąganie ma alternatywę: kliknij element, a potem cel. Przyciski odpowiedzi obsługują klawisze 1–4, karty „Prawda/fałsz” – strzałki.', 'Every drag has an alternative: click the item, then the target. Answer buttons support keys 1–4, “True/false” cards – arrow keys.')}</p>
            <hr />
            <button className="btn ghost" onClick={() => { if (confirm(L('Przywrócić wszystkie ustawienia domyślne?', 'Restore all default settings?'))) update({ ...DEFAULT_SETTINGS, lang: s.lang, theme: s.theme }); }}><RotateCcw aria-hidden /> {L('Przywróć ustawienia domyślne', 'Restore default settings')}</button>
          </section>
        )}

        {tab === 'Baza zadań' && <QuestionBankEditor bank={bank} setBank={setBank} />}

        {tab === 'Wyniki' && <Results onChange={() => refresh((x) => x + 1)} />}
      </div>
    </div>
  );
}

function Results({ onChange }: { onChange: () => void }) {
  const results = loadResults();
  const csv = () => {
    const head = L('data;gracz;tryb;poziom;wynik;zadania;poprawne;bledy;skutecznosc;najlepsze_combo;sredni_czas_s', 'date;player;mode;level;score;tasks;correct;wrong;accuracy;best_combo;avg_time_s');
    const rows = results.map((r) => [new Date(r.date).toLocaleString(locale()), r.player ?? '', modeName(r.mode), tr(levelName(r.level)), r.score, r.rounds, r.correct, r.wrong, `${r.accuracy}%`, r.bestCombo, L(String(r.avgTime).replace('.', ','), String(r.avgTime))].join(';'));
    downloadFile(L('bone-zone-wyniki.csv', 'bone-zone-results.csv'), '﻿' + [head, ...rows].join('\n'), 'text/csv;charset=utf-8');
  };
  return (
    <section className="panel">
      <div className="row wrap">
        <button className="btn" onClick={csv} disabled={!results.length}><Download aria-hidden /> {L('Eksport CSV', 'Export CSV')}</button>
        <button className="btn ghost" onClick={() => { if (confirm(L('Usunąć wszystkie zapisane wyniki z tego urządzenia?', 'Delete all saved scores on this device?'))) { clearResults(); onChange(); } }}><Trash2 aria-hidden /> {L('Wyczyść wyniki', 'Clear scores')}</button>
        <button className="btn ghost" onClick={() => { if (confirm(L('Zresetować zdobyte odznaki na tym urządzeniu?', 'Reset earned badges on this device?'))) { resetProgress(); onChange(); } }}><RotateCcw aria-hidden /> {L('Resetuj odznaki', 'Reset badges')}</button>
      </div>
      {results.length === 0 ? <p className="muted">{L('Brak zapisanych wyników.', 'No saved scores.')}</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{L('Data', 'Date')}</th><th>{L('Gracz', 'Player')}</th><th>{L('Tryb', 'Mode')}</th><th>{L('Poziom', 'Level')}</th><th>{L('Wynik', 'Score')}</th><th>{L('Popr./Zad.', 'Corr./Tasks')}</th><th>{L('Skut.', 'Acc.')}</th><th>COMBO</th><th>{L('Śr. czas', 'Avg. time')}</th></tr></thead>
            <tbody>{results.map((r, i) => (
              <tr key={i}><td>{new Date(r.date).toLocaleString(locale())}</td><td>{r.player ?? '—'}</td><td>{modeName(r.mode)}</td><td>{tr(levelName(r.level))}</td><td><b>{r.score}</b></td><td>{r.correct}/{r.rounds}</td><td>{r.accuracy}%</td><td>×{r.bestCombo}</td><td>{r.avgTime.toFixed(1)} s</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
