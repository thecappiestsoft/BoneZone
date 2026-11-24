import type { ArtKind } from '../../types';
import { t } from '../../i18n';

const BONE = '#fffdf6';
const BONE_D = '#6b4a1f';
const CELL = '#e0f2fe';
const CELL_D = '#1e40af';
const NUC = '#4338ca';

function Shape({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case 'long':
      return (
        <g transform="rotate(-32)" stroke={BONE_D} strokeWidth="3.5" fill={BONE}>
          <rect x="-28" y="-7" width="56" height="14" stroke="none" />
          <circle cx="-34" cy="-9" r="10" /><circle cx="-34" cy="9" r="10" />
          <circle cx="34" cy="-9" r="10" /><circle cx="34" cy="9" r="10" />
          <path d="M-26 -7 H26 M-26 7 H26" fill="none" />
          <rect x="-29" y="-5" width="58" height="10" stroke="none" />
        </g>
      );
    case 'short':
      return (
        <g>
          <rect x="-24" y="-22" width="48" height="44" rx="12" fill={BONE} stroke={BONE_D} strokeWidth="4" />
          {[[-10, -8], [8, -10], [-4, 8], [12, 8], [-14, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#e3c99a" />)}
        </g>
      );
    case 'flat':
      return (
        <g>
          <path d="M-38 -26 Q0 -44 38 -26 Q30 10 4 36 Q-2 40 -8 34 Q-32 8 -38 -26Z" fill={BONE} stroke={BONE_D} strokeWidth="4" />
          <path d="M-26 -22 Q0 -32 26 -22" stroke="#d8c39a" strokeWidth="3" fill="none" />
        </g>
      );
    case 'irregular':
      return (
        <g fill={BONE} stroke={BONE_D} strokeWidth="3.5" strokeLinejoin="round">
          <path d="M-6 -14 L-40 -20 L-40 -10 L-10 -2Z" />
          <path d="M6 -14 L40 -20 L40 -10 L10 -2Z" />
          <path d="M-6 -16 L-4 -44 L4 -44 L6 -16Z" />
          <path d="M-16 -2 Q-18 -20 0 -22 Q18 -20 16 -2Z" />
          <ellipse cx="0" cy="-8" rx="6" ry="5" fill="#fff" />
          <ellipse cx="0" cy="16" rx="26" ry="16" />
        </g>
      );
    case 'sesamoid':
      return <path d="M0 -36 C26 -32 32 -2 0 36 C-32 -2 -26 -32 0 -36Z" fill={BONE} stroke={BONE_D} strokeWidth="4" />;
    case 'osteoblast':
      return (
        <g>
          <rect x="-34" y="-26" width="68" height="52" rx="16" fill="#bfdbfe" stroke={CELL_D} strokeWidth="4" />
          <circle cx="-10" cy="2" r="13" fill={NUC} />
          {[[16, -12], [20, 4], [12, 16], [24, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#60a5fa" />)}
          <path d="M-30 30 h60" stroke="#b45309" strokeWidth="5" strokeDasharray="6 4" />
        </g>
      );
    case 'osteocyte':
      return (
        <g stroke={CELL_D} strokeLinecap="round">
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <path key={i} d={`M${Math.cos(a) * 18} ${Math.sin(a) * 11} L${Math.cos(a) * 44} ${Math.sin(a) * 34}`} strokeWidth="3" fill="none" />;
          })}
          <ellipse rx="24" ry="15" fill={CELL} strokeWidth="4" />
          <ellipse rx="10" ry="7" fill={NUC} stroke="none" />
        </g>
      );
    case 'osteoclast':
      return (
        <g>
          <path d="M-44 6 C-46 -26 -20 -40 4 -38 C30 -36 46 -20 44 6 C42 22 30 26 22 24 Q14 30 6 24 Q-2 30 -10 24 Q-18 30 -26 24 C-36 26 -44 20 -44 6Z" fill="#fbcfe8" stroke="#9d174d" strokeWidth="4" />
          {[[-24, -10], [-6, -18], [12, -14], [28, -4], [-10, 4], [8, 6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill="#9d174d" />)}
        </g>
      );
    case 'chondrocyte':
      return (
        <g>
          <ellipse rx="44" ry="34" fill="#cffafe" stroke="#0e7490" strokeWidth="3" />
          <ellipse cx="-14" rx="16" ry="20" fill="#fff" stroke="#0e7490" strokeWidth="3" />
          <ellipse cx="16" rx="16" ry="20" fill="#fff" stroke="#0e7490" strokeWidth="3" />
          <circle cx="-14" r="7" fill="#0e7490" />
          <circle cx="16" r="7" fill="#0e7490" />
        </g>
      );
    case 'rbc':
      return (
        <g>
          <circle r="38" fill="#e23b4a" stroke="#7a0b14" strokeWidth="4" />
          <circle r="17" fill="#f48a92" />
        </g>
      );
    case 'bacterium':
      return (
        <g transform="rotate(-20)">
          <path d="M34 0 q7 -9 14 0" stroke="#1b5e20" strokeWidth="3" fill="none" />
          <rect x="-34" y="-17" width="68" height="34" rx="17" fill="#4caf50" stroke="#1b5e20" strokeWidth="4" />
          <path d="M-14 -6 h28 M-10 6 h22" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'neuron':
      return (
        <g stroke="#1d3557" strokeWidth="5" strokeLinecap="round">
          <path d="M0 0 L-36 -26 M0 0 L-40 8 M0 0 L-18 -40 M0 0 L22 -38 M0 0 L-24 36 M0 0 L44 40" fill="none" />
          <circle r="15" fill="#8ecae6" />
        </g>
      );
    case 'muscle':
      return (
        <g transform="rotate(-20)">
          <rect x="-44" y="-15" width="88" height="30" rx="15" fill="#f87171" stroke="#991b1b" strokeWidth="4" />
          {[-30, -20, -10, 0, 10, 20, 30].map((x) => <path key={x} d={`M${x} -13 V13`} stroke="#991b1b" strokeWidth="2.5" />)}
        </g>
      );
    case 'ca':
      return (
        <g>
          <circle r="32" fill="#bbf7d0" stroke="#166534" strokeWidth="4" />
          <text y="8" textAnchor="middle" fontSize="24" fontWeight="900" fill="#14532d">Ca²⁺</text>
        </g>
      );
    case 'po4':
      return (
        <g>
          {[[0, -30], [28, 16], [-28, 16], [0, 26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#fecaca" stroke="#991b1b" strokeWidth="3" />)}
          <circle r="20" fill="#f97316" stroke="#7c2d12" strokeWidth="4" />
          <text y="7" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff">P</text>
        </g>
      );
    case 'vitd':
      return (
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <path key={i} d={`M${Math.cos(a) * 30} ${Math.sin(a) * 30} L${Math.cos(a) * 44} ${Math.sin(a) * 44}`} stroke="#ca8a04" strokeWidth="5" strokeLinecap="round" />;
          })}
          <circle r="26" fill="#fde047" stroke="#a16207" strokeWidth="4" />
          <text y="10" textAnchor="middle" fontSize="28" fontWeight="900" fill="#713f12">D</text>
        </g>
      );
    case 'acid':
      return (
        <g>
          <path d="M0 -40 C0 -40 -30 0 -30 14 a30 30 0 0 0 60 0 C30 0 0 -40 0 -40Z" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="4" />
          <text y="22" textAnchor="middle" fontSize="24" fontWeight="900" fill="#2e1065">H⁺</text>
        </g>
      );
    case 'o2':
      return (
        <g>
          <circle cx="-15" r="21" fill="#3fa9f5" stroke="#0b4f8a" strokeWidth="4" />
          <circle cx="15" r="21" fill="#3fa9f5" stroke="#0b4f8a" strokeWidth="4" />
          <text y="9" textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">O₂</text>
        </g>
      );
    case 'glucose':
      return (
        <g>
          <path d="M0 -34 L30 -17 L30 17 L0 34 L-30 17 L-30 -17Z" fill="#fef3c7" stroke="#92400e" strokeWidth="4" />
          <text y="7" textAnchor="middle" fontSize="18" fontWeight="900" fill="#78350f">Glu</text>
        </g>
      );
    case 'crack':
      return (
        <g>
          <rect x="-40" y="-16" width="80" height="32" rx="10" fill={BONE} stroke={BONE_D} strokeWidth="4" />
          <path d="M-6 -16 L4 -4 L-6 4 L6 16" stroke="#b91c1c" strokeWidth="5" fill="none" strokeLinejoin="round" />
        </g>
      );
    case 'drop':
      return (
        <g>
          <path d="M0 -42 C0 -42 -30 2 -30 16 a30 30 0 0 0 60 0 C30 2 0 -42 0 -42Z" fill="#e23b4a" stroke="#7a0b14" strokeWidth="4" />
          <ellipse cx="-10" cy="8" rx="6" ry="10" fill="#fff" opacity=".4" />
        </g>
      );
  }
}

export const ART_NAMES: Record<ArtKind, string> = {
  long: 'kość długa', short: 'kość krótka', flat: 'kość płaska', irregular: 'kość różnokształtna (kręg)', sesamoid: 'trzeszczka (rzepka)',
  osteoblast: 'osteoblast', osteocyte: 'osteocyt', osteoclast: 'osteoklast', chondrocyte: 'chondrocyt',
  rbc: 'krwinka czerwona', bacterium: 'bakteria', neuron: 'neuron', muscle: 'włókno mięśniowe',
  ca: 'jon wapnia (Ca²⁺)', po4: 'fosforan (PO₄³⁻)', vitd: 'witamina D', acid: 'kwas (H⁺)', o2: 'tlen (O₂)', glucose: 'glukoza', crack: 'mikrouszkodzenie kości', drop: 'kropla krwi',
};
/** Nazwa grafiki w bieżącym języku. */
export const artName = (k: ArtKind) => t(ART_NAMES[k]);
/** Względna wielkość rysunku. */
export const ART_SCALE: Record<ArtKind, number> = {
  long: 1.3, short: 1.15, flat: 1.2, irregular: 1.1, sesamoid: 1,
  osteoblast: 1, osteocyte: 1.1, osteoclast: 1.4, chondrocyte: 1,
  rbc: 0.7, bacterium: 0.85, neuron: 1.1, muscle: 1.1,
  ca: 0.8, po4: 0.85, vitd: 0.85, acid: 0.8, o2: 0.8, glucose: 0.8, crack: 1, drop: 0.9,
};

export function Art({ kind, size = 64, label }: { kind: ArtKind; size?: number; label?: string }) {
  return (
    <svg className="cell-svg" viewBox="-50 -50 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Shape kind={kind} />
    </svg>
  );
}
