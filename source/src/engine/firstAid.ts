/**
 * Zasada unieruchamiania (pierwsza pomoc, w uproszczeniu dydaktycznym):
 *  - złamanie kości długiej → unieruchamiamy DWA SĄSIEDNIE STAWY,
 *  - zwichnięcie / skręcenie stawu → unieruchamiamy DWIE SĄSIEDNIE KOŚCI (odcinki kończyny).
 * Kończyna to naprzemienny ciąg: staw – kość – staw – kość …
 */
export interface Segment { id: string; name: string; kind: 'joint' | 'bone' }
export interface Limb { id: 'upper' | 'lower'; name: string; segments: Segment[] }

export const LIMBS: Limb[] = [
  {
    id: 'upper', name: 'kończyna górna',
    segments: [
      { id: 'bark', name: 'staw ramienny (bark)', kind: 'joint' },
      { id: 'ramie', name: 'ramię (kość ramienna)', kind: 'bone' },
      { id: 'lokiec', name: 'staw łokciowy', kind: 'joint' },
      { id: 'przedramie', name: 'przedramię (kość promieniowa i łokciowa)', kind: 'bone' },
      { id: 'nadgarstek', name: 'staw promieniowo-nadgarstkowy', kind: 'joint' },
      { id: 'reka', name: 'ręka (kości nadgarstka i dalsze)', kind: 'bone' },
    ],
  },
  {
    id: 'lower', name: 'kończyna dolna',
    segments: [
      { id: 'biodro', name: 'staw biodrowy', kind: 'joint' },
      { id: 'udo', name: 'udo (kość udowa)', kind: 'bone' },
      { id: 'kolano', name: 'staw kolanowy', kind: 'joint' },
      { id: 'podudzie', name: 'podudzie (kość piszczelowa i strzałkowa)', kind: 'bone' },
      { id: 'skokowy', name: 'staw skokowy', kind: 'joint' },
      { id: 'stopa', name: 'stopa', kind: 'bone' },
    ],
  },
];

export interface Injury { limb: Limb; at: number; type: 'fracture' | 'dislocation' }

/** Urazy, dla których obie strony mają sąsiada (bez barku/biodra i dłoni/stopy). */
export function possibleInjuries(): Injury[] {
  const out: Injury[] = [];
  for (const limb of LIMBS) {
    limb.segments.forEach((s, i) => {
      if (i === 0 || i === limb.segments.length - 1) return;
      out.push({ limb, at: i, type: s.kind === 'bone' ? 'fracture' : 'dislocation' });
    });
  }
  return out;
}

/** Odcinki, które należy unieruchomić przy danym urazie. */
export function toImmobilize(inj: Injury): Segment[] {
  return [inj.limb.segments[inj.at - 1], inj.limb.segments[inj.at + 1]];
}

import { L, t } from '../i18n';
export const injuryLabel = (inj: Injury) => {
  const s = inj.limb.segments[inj.at];
  return inj.type === 'fracture' ? `${L('złamanie', 'fracture')}: ${t(s.name)}` : `${L('zwichnięcie', 'dislocation')}: ${t(s.name)}`;
};
