import { useState, type ReactNode } from 'react';
import { useNumberKeys } from './hooks';

/** Duże przyciski odpowiedzi (klawisze 1–n). Zwraca indeks wybranej opcji. */
export function ChoiceGrid({ options, correct, onAnswer, columns, big }: {
  options: ReactNode[];
  correct: number | null;
  onAnswer: (i: number) => void;
  columns?: number;
  big?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    onAnswer(i);
  };
  useNumberKeys(options.length, choose, picked === null);
  return (
    <div className={`choice-grid ${big ? 'big' : ''}`} style={{ gridTemplateColumns: `repeat(${columns ?? (options.length > 3 ? 2 : options.length)}, minmax(0, 1fr))` }}>
      {options.map((o, i) => (
        <button
          key={i}
          className={`choice ${picked === i ? (correct === null || i === correct ? 'ok' : 'bad') : ''} ${picked !== null && i === correct && picked !== i ? 'reveal' : ''}`}
          onClick={() => choose(i)}
          disabled={picked !== null}
        >
          <span className="kbd" aria-hidden>{i + 1}</span>
          <span className="choice-body">{o}</span>
        </button>
      ))}
    </div>
  );
}
