import { useState } from 'react';
import type { Level, MiniGameProps } from '../types';
import { sample } from '../utils/random';
import { lv } from '../utils/level';
import { jointParts, longboneParts, regionParts, skeletonParts, type DiagramPart } from '../data/content';
import { SlotDiagram } from './common/SlotDiagram';
import { DIAGRAMS, type DiagramKind } from './common/Diagrams';
import { L,  } from '../i18n';

/** Fabryka minigier „podpisz schemat”: podpisy przeciąga się (lub klika) na puste pola. */
function makeLabels(kind: DiagramKind, pool: (l: Level) => DiagramPart[], count: (p: MiniGameProps) => number, prompt: [string, string], info: [string, string], extra: (l: Level) => string[] = () => []) {
  return function DiagramLabels(p: MiniGameProps) {
    const [parts] = useState(() => {
      const all = pool(p.level);
      const n = Math.min(all.length, count(p));
      const ids = sample(p.rng, all, n).map((x) => x.id);
      return all.filter((x) => ids.includes(x.id));
    });
    const d = DIAGRAMS[kind];
    return (
      <div className="mg">
        <p className="prompt">{L(...prompt)}</p>
        <SlotDiagram p={p} parts={parts} view={d.view} svg={d.render(parts)} className={d.className} allowed={1} extraLabels={extra(p.level)} successInfo={L(...info)} />
      </div>
    );
  };
}

export const SkeletonLabels = makeLabels('skeleton', skeletonParts, (p) => lv(p.level, 5, 6, 7) + (p.intensity === 2 ? 1 : 0),
  ['Przeciągnij nazwy kości na puste pola (lub kliknij nazwę, potem pole).', 'Drag the bone names onto the empty fields (or click a name, then a field).'],
  ['Schemat w widoku od przodu: prawa strona ciała jest po lewej stronie rysunku.', 'Front view: the right side of the body is on the left of the picture.']);

export const BoneLabels = makeLabels('longbone', longboneParts, (p) => lv(p.level, 5, 6, 7) + (p.intensity === 2 ? 1 : 0),
  ['Podpisz przekrój kości długiej.', 'Label the section of a long bone.'],
  ['Kość długa: dwie nasady pokryte chrząstką stawową i trzon. Trzon ma ścianę z istoty zbitej, pokrytą okostną, a w środku jamę szpikową.', 'Long bone: two epiphyses covered with articular cartilage and a shaft. The shaft wall is compact bone covered by periosteum, with the medullary cavity inside.']);

export const JointLabels = makeLabels('joint', jointParts, (p) => lv(p.level, 4, 5, 6),
  ['Podpisz elementy stawu.', 'Label the parts of the joint.'],
  ['Staw: powierzchnie stawowe (główka i panewka) pokryte chrząstką, torebka stawowa, jama stawowa z mazią i wzmacniające więzadła.', 'Joint: cartilage-covered surfaces (head and socket), joint capsule, joint cavity with synovial fluid and strengthening ligaments.']);

export const BuildSkeleton = makeLabels('skeleton', regionParts, (p) => (p.intensity === 0 && p.level === 'primary' ? 5 : 7),
  ['Złóż szkielet: umieść nazwy głównych części szkieletu.', 'Build the skeleton: place the names of its main parts.'],
  ['Szkielet osiowy: czaszka, kręgosłup, klatka piersiowa. Szkielet kończyn: obręcze (barkowa, miedniczna) i kończyny wolne.', 'Axial skeleton: skull, spine, rib cage. Appendicular skeleton: girdles (shoulder, pelvic) and free limbs.'],
  (l) => (l === 'primary' ? [] : [L('Przepona', 'Diaphragm')]));
