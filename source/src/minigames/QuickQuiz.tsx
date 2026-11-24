import { useState } from 'react';
import type { MiniGameProps } from '../types';
import { pick, shuffle, sample } from '../utils/random';
import { bankFor } from '../engine/bank';
import { cats } from './common/bankHelpers';
import { ChoiceGrid } from './common/ChoiceGrid';

/** Szybki wybór – pytanie z bazy nauczyciela, odpowiedzi w losowej kolejności. */
export default function QuickQuiz(p: MiniGameProps) {
  const [task] = useState(() => {
    const q = pick(p.rng, bankFor(p.bank, 'quiz', p.level, cats(p)));
    const opts = shuffle(p.rng, [q.correct, ...sample(p.rng, q.wrong, 3)]);
    return { q, opts, correct: opts.indexOf(q.correct) };
  });
  return (
    <div className="mg">
      <p className="prompt big-q">{task.q.question}</p>
      <ChoiceGrid options={task.opts} correct={task.correct} onAnswer={(i) => p.onDone({ success: i === task.correct, info: task.q.explanation })} />
    </div>
  );
}
