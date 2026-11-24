import { ArrowLeft } from 'lucide-react';
import { achievements, loadProgress, loadResults } from '../engine/achievements';
import { levelName } from '../data/catalog';
import { L, locale, t } from '../i18n';

const MODE_NAMES = (): Record<string, string> => L(
  { quick: 'Szybka gra', marathon: 'Maraton', boss: 'Boss Rush', learn: 'Nauka', class: 'Wyzwanie klasowe', test: 'Test minigry' },
  { quick: 'Quick game', marathon: 'Marathon', boss: 'Boss Rush', learn: 'Learn', class: 'Class challenge', test: 'Mini-game test' },
);
export const modeName = (m: string) => MODE_NAMES()[m] ?? m;

export function AchievementsView({ onBack }: { onBack: () => void }) {
  const p = loadProgress();
  const results = loadResults().filter((r) => r.mode !== 'test');
  const top = [...results].sort((a, b) => b.score - a.score).slice(0, 10);
  return (
    <div className="page">
      <button className="btn ghost" onClick={onBack}><ArrowLeft aria-hidden /> {L('Wróć', 'Back')}</button>
      <h1>{L('Odznaki', 'Badges')}</h1>
      <div className="badges">
        {achievements().map((a) => (
          <div key={a.id} className={`badge ${p.unlocked[a.id] ? 'on' : ''}`}>
            <span className="badge-icon" aria-hidden>{p.unlocked[a.id] ? a.icon : '🔒'}</span>
            <b>{a.name}</b>
            <small>{a.desc}</small>
            {a.id === 'bone-master' && !p.unlocked[a.id] && <small className="progress">{L('Postęp', 'Progress')}: {Math.min(10, p.boneCorrect)}/10</small>}
            {p.unlocked[a.id] && <small className="progress">{L('Zdobyto', 'Earned')}: {new Date(p.unlocked[a.id]).toLocaleDateString(locale())}</small>}
          </div>
        ))}
      </div>
      <h2>{L('Najlepsze wyniki na tym urządzeniu', 'Best scores on this device')}</h2>
      {top.length === 0 ? <p className="muted">{L('Brak wyników – zagraj pierwszą rozgrywkę!', 'No scores yet – play your first game!')}</p> : (
        <table className="table">
          <thead><tr><th>#</th><th>{L('Gracz', 'Player')}</th><th>{L('Wynik', 'Score')}</th><th>{L('Skuteczność', 'Accuracy')}</th><th>{L('Tryb', 'Mode')}</th><th>{L('Poziom', 'Level')}</th><th>{L('Data', 'Date')}</th></tr></thead>
          <tbody>{top.map((r, i) => (
            <tr key={i}><td>{i + 1}</td><td>{r.player ?? '—'}</td><td><b>{r.score}</b></td><td>{r.accuracy}%</td><td>{modeName(r.mode)}</td><td>{t(levelName(r.level))}</td><td>{new Date(r.date).toLocaleDateString(locale())}</td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
