import type { ReactNode } from 'react';
import { JOINT_VIEW, LONGBONE_VIEW, SKELETON_VIEW, type DiagramPart } from '../../data/content';
import { t } from '../../i18n';

const BONE = '#f5ecd7';
const BONE_D = '#7c5a2a';
const SPONGY = '#fecaca';
const CART = '#93c5fd';

/** Linie odniesienia od pola podpisu do wskazywanego miejsca. */
function Leaders({ parts, highlight }: { parts: DiagramPart[]; highlight?: string | null }) {
  return (
    <g>
      {parts.map((p) => (
        <g key={p.id}>
          <line x1={p.anchor.x} y1={p.anchor.y} x2={p.point.x} y2={p.point.y} stroke={highlight === p.id ? '#f59e0b' : '#334155'} strokeWidth={highlight === p.id ? 3 : 1.6} />
          <circle cx={p.point.x} cy={p.point.y} r="4.5" fill="#0f172a" stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

/** Kości jednej strony ciała (lewa strona rysunku = prawa strona ciała). Druga strona to lustrzane odbicie. */
function SideBones() {
  const ribs = [34, 42, 48, 52, 54, 54, 52, 48, 42, 36];
  return (
    <g stroke={BONE_D} strokeLinecap="round" strokeLinejoin="round">
      {/* łopatka (za żebrami) */}
      <path d="M166 146 L196 150 L182 204Z" fill="#ede0c4" strokeWidth="2.5" opacity=".85" />
      {/* żebra */}
      {ribs.map((w, i) => {
        const y = 158 + i * 9.5;
        return <path key={i} d={`M214 ${y} C ${220 - w} ${y - 8}, ${220 - w - 8} ${y + 18}, ${220 - w + 8} ${y + 24}`} fill="none" stroke={BONE_D} strokeWidth="5" />;
      })}
      {ribs.map((w, i) => {
        const y = 158 + i * 9.5;
        return <path key={`f${i}`} d={`M214 ${y} C ${220 - w} ${y - 8}, ${220 - w - 8} ${y + 18}, ${220 - w + 8} ${y + 24}`} fill="none" stroke={BONE} strokeWidth="2.5" />;
      })}
      {/* obojczyk */}
      <line x1="210" y1="148" x2="162" y2="140" stroke={BONE_D} strokeWidth="8" />
      <line x1="210" y1="148" x2="162" y2="140" stroke={BONE} strokeWidth="4.5" />
      {/* kość ramienna */}
      <Long x1={162} y1={154} x2={152} y2={250} w={9} />
      <circle cx="164" cy="152" r="9" fill={BONE} strokeWidth="2.5" />
      {/* przedramię: promieniowa (bocznie, po stronie kciuka) i łokciowa */}
      <Long x1={146} y1={260} x2={136} y2={344} w={6} />
      <Long x1={158} y1={258} x2={153} y2={345} w={6} />
      {/* ręka */}
      {[[136, 352], [144, 350], [152, 352], [140, 359], [148, 359]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={BONE} strokeWidth="1.8" />)}
      {[132, 139, 146, 153].map((x, i) => <g key={i}><line x1={x + 2} y1={365} x2={x} y2={384} stroke={BONE_D} strokeWidth="4" /><line x1={x} y1={388} x2={x - 1} y2={404} stroke={BONE_D} strokeWidth="3.4" /></g>)}
      <line x1="130" y1="362" x2="122" y2="380" stroke={BONE_D} strokeWidth="4" />
      <line x1="121" y1="384" x2="117" y2="396" stroke={BONE_D} strokeWidth="3.4" />
      {/* kość miedniczna */}
      <path d="M216 290 Q180 282 168 300 Q166 322 186 336 Q196 350 212 354 L216 346Z" fill={BONE} strokeWidth="2.5" />
      <ellipse cx="200" cy="338" rx="7" ry="5" fill="#fff" strokeWidth="1.5" />
      {/* kość udowa */}
      <circle cx="190" cy="328" r="9" fill={BONE} strokeWidth="2.5" />
      <Long x1={186} y1={338} x2={190} y2={460} w={11} />
      <ellipse cx="190" cy="464" rx="13" ry="7" fill={BONE} strokeWidth="2.5" />
      {/* rzepka */}
      <circle cx="190" cy="474" r="7" fill="#fff7e6" strokeWidth="2.5" />
      {/* podudzie: piszczelowa (przyśrodkowo) i strzałkowa (bocznie) */}
      <ellipse cx="195" cy="486" rx="13" ry="5" fill={BONE} strokeWidth="2.5" />
      <Long x1={198} y1={490} x2={198} y2={566} w={9} />
      <Long x1={181} y1={490} x2={183} y2={566} w={5} />
      {/* stopa */}
      <path d="M176 572 L208 572 L212 588 L170 594Z" fill={BONE} strokeWidth="2.5" />
    </g>
  );
}

function Long({ x1, y1, x2, y2, w }: { x1: number; y1: number; x2: number; y2: number; w: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BONE_D} strokeWidth={w + 3} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={BONE} strokeWidth={w - 1} strokeLinecap="round" />
    </g>
  );
}

/** Szkielet człowieka (uproszczony, widok od przodu). */
export function SkeletonSvg({ parts = [], highlight, hideSides }: { parts?: DiagramPart[]; highlight?: string | null; hideSides?: boolean }) {
  return (
    <svg viewBox="0 0 440 610" className="diagram-svg" aria-hidden>
      <rect x="0" y="0" width="440" height="610" fill="#f1f5f9" rx="18" />
      <SideBones />
      <g transform="translate(440 0) scale(-1 1)"><SideBones /></g>
      <g stroke={BONE_D} strokeLinejoin="round">
        {/* czaszka */}
        <ellipse cx="220" cy="50" rx="36" ry="42" fill={BONE} strokeWidth="3" />
        <path d="M188 30 Q220 18 252 30" fill="none" stroke="#c9b48a" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="206" cy="54" r="8" fill="#334155" strokeWidth="1" />
        <circle cx="234" cy="54" r="8" fill="#334155" strokeWidth="1" />
        <path d="M220 62 L214 74 L226 74Z" fill="#334155" strokeWidth="1" />
        {/* żuchwa */}
        <path d="M192 74 Q194 104 220 108 Q246 104 248 74 L240 78 Q236 96 220 98 Q204 96 200 78Z" fill={BONE} strokeWidth="2.5" />
        <path d="M206 84 H234" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
        {/* odcinek szyjny */}
        {[112, 120, 128, 136].map((y) => <rect key={y} x="213" y={y} width="14" height="6" rx="2" fill={BONE} strokeWidth="1.8" />)}
        {/* mostek */}
        <rect x="213" y="150" width="14" height="72" rx="5" fill={BONE} strokeWidth="2.5" />
        <path d="M214 222 L226 222 L220 232Z" fill={BONE} strokeWidth="2" />
        {/* odcinek lędźwiowy */}
        {[236, 247, 258, 269, 280].map((y) => <rect key={y} x="209" y={y} width="22" height="9" rx="3" fill={BONE} strokeWidth="2" />)}
        {/* kość krzyżowa */}
        <path d="M207 291 L233 291 L220 330Z" fill="#ede0c4" strokeWidth="2.5" />
      </g>
      {!hideSides && (
        <>
          <text x="96" y="604" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">{t('PRAWA strona ciała')}</text>
          <text x="344" y="604" textAnchor="middle" fontSize="12" fontWeight="800" fill="#64748b">{t('LEWA strona ciała')}</text>
        </>
      )}
      <Leaders parts={parts} highlight={highlight} />
    </svg>
  );
}

/** Przekrój podłużny kości długiej (rosnącej). */
export function LongBoneSvg({ parts = [], highlight }: { parts?: DiagramPart[]; highlight?: string | null }) {
  return (
    <svg viewBox="0 0 440 320" className="diagram-svg" aria-hidden>
      <defs>
        <pattern id="spongy" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={SPONGY} />
          <path d="M0 6 L6 0 L12 6 L6 12Z" fill="none" stroke="#e7c9a0" strokeWidth="2.2" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="440" height="320" fill="#f1f5f9" rx="18" />
      {/* nasady z istotą gąbczastą */}
      <ellipse cx="95" cy="160" rx="45" ry="62" fill="url(#spongy)" stroke={BONE} strokeWidth="9" />
      <ellipse cx="345" cy="160" rx="45" ry="58" fill="url(#spongy)" stroke={BONE} strokeWidth="9" />
      <ellipse cx="95" cy="160" rx="49.5" ry="66.5" fill="none" stroke={BONE_D} strokeWidth="2" />
      <ellipse cx="345" cy="160" rx="49.5" ry="62.5" fill="none" stroke={BONE_D} strokeWidth="2" />
      {/* trzon: istota zbita + jama szpikowa */}
      <rect x="118" y="126" width="204" height="68" fill={BONE} />
      <rect x="138" y="141" width="164" height="38" rx="6" fill="#fde68a" stroke="#d6a419" strokeWidth="2" />
      <text x="220" y="165" textAnchor="middle" fontSize="11" fontWeight="700" fill="#a16207">{t('szpik żółty')}</text>
      <line x1="122" y1="124" x2="318" y2="124" stroke="#e11d48" strokeWidth="3.5" />
      <line x1="122" y1="196" x2="318" y2="196" stroke="#e11d48" strokeWidth="3.5" />
      {/* chrząstki nasadowe */}
      <line x1="128" y1="116" x2="128" y2="204" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" />
      <line x1="312" y1="118" x2="312" y2="202" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 4" />
      {/* chrząstki stawowe */}
      <path d="M80 102 A45 62 0 0 0 80 218" fill="none" stroke={CART} strokeWidth="9" />
      <path d="M360 105 A45 58 0 0 1 360 215" fill="none" stroke={CART} strokeWidth="9" />
      <Leaders parts={parts} highlight={highlight} />
    </svg>
  );
}

/** Schemat stawu (przekrój). */
export function JointSvg({ parts = [], highlight }: { parts?: DiagramPart[]; highlight?: string | null }) {
  return (
    <svg viewBox="0 0 360 420" className="diagram-svg" aria-hidden>
      <rect x="0" y="0" width="360" height="420" fill="#f1f5f9" rx="18" />
      {/* jama stawowa z mazią */}
      <path d="M150 118 C104 138 96 214 100 262 L260 262 C264 214 256 138 210 118Z" fill="#fef3c7" />
      {/* więzadła */}
      <path d="M140 108 C90 140 80 230 88 300" fill="none" stroke="#b45309" strokeWidth="9" strokeDasharray="10 4" />
      <path d="M220 108 C270 140 280 230 272 300" fill="none" stroke="#b45309" strokeWidth="9" strokeDasharray="10 4" />
      {/* torebka stawowa */}
      <path d="M150 118 C104 138 96 214 100 262 M210 118 C256 138 264 214 260 262" fill="none" stroke="#7c3aed" strokeWidth="5" />
      {/* kość górna z główką */}
      <path d="M150 0 L210 0 L210 160 L150 160Z" fill={BONE} stroke={BONE_D} strokeWidth="3" />
      <circle cx="180" cy="200" r="52" fill={BONE} stroke={BONE_D} strokeWidth="3" />
      <rect x="152" y="140" width="56" height="30" fill={BONE} />
      <path d="M130 214 A52 52 0 0 0 230 214" fill="none" stroke={CART} strokeWidth="8" />
      {/* kość dolna z panewką */}
      <path d="M100 420 L100 236 L126 236 A65 65 0 0 0 234 236 L260 236 L260 420Z" fill={BONE} stroke={BONE_D} strokeWidth="3" />
      <path d="M131 238 A61 61 0 0 0 229 238" fill="none" stroke={CART} strokeWidth="7" />
      <Leaders parts={parts} highlight={highlight} />
    </svg>
  );
}

/** Kontener z rysunkiem i nakładkami pozycjonowanymi w procentach. */
export function DiagramBox({ view, svg, children, className }: { view: { w: number; h: number }; svg: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`diagram-box ${className ?? ''}`} style={{ aspectRatio: `${view.w} / ${view.h}` }}>
      {svg}
      {children}
    </div>
  );
}
export const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/* ---------- wybór schematu ---------- */
export type DiagramKind = 'skeleton' | 'longbone' | 'joint';
export const DIAGRAMS: Record<DiagramKind, { view: { w: number; h: number }; render: (parts: DiagramPart[], highlight?: string | null) => ReactNode; className: string }> = {
  skeleton: { view: SKELETON_VIEW, className: 'tall', render: (p, h) => <SkeletonSvg parts={p} highlight={h} /> },
  longbone: { view: LONGBONE_VIEW, className: 'wide', render: (p, h) => <LongBoneSvg parts={p} highlight={h} /> },
  joint: { view: JOINT_VIEW, className: 'mid', render: (p, h) => <JointSvg parts={p} highlight={h} /> },
};
