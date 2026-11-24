import type { ArtKind, Level } from '../types';
import { t } from '../i18n';

/* ---------- Schematy z podpisami ---------- */
export interface DiagramPart {
  id: string;
  name: string;
  /** położenie pola z podpisem (w jednostkach widoku SVG) */
  anchor: { x: number; y: number };
  /** wskazywane miejsce na rysunku (linia odniesienia) */
  point: { x: number; y: number };
  levels: Level[];
}
const ALL: Level[] = ['primary', 'highschool', 'technical'];
const HT: Level[] = ['highschool', 'technical'];
const T: Level[] = ['technical'];
const part = (id: string, name: string, ax: number, ay: number, px: number, py: number, levels = ALL): DiagramPart =>
  ({ id, name, anchor: { x: ax, y: ay }, point: { x: px, y: py }, levels });

/** Szkielet człowieka – widok od przodu (prawa strona ciała po LEWEJ stronie rysunku). */
export const SKELETON_VIEW = { w: 440, h: 610 };
const LX = 52;
const RX = 388;
export const SKELETON_PARTS: DiagramPart[] = [
  part('czaszka', 'Czaszka', LX, 40, 196, 40),
  part('obojczyk', 'Obojczyk', LX, 128, 182, 143),
  part('mostek', 'Mostek', LX, 175, 220, 186),
  part('ramienna', 'Kość ramienna', LX, 220, 156, 205),
  part('krzyzowa', 'Kość krzyżowa', LX, 265, 218, 302, HT),
  part('promieniowa', 'Kość promieniowa', LX, 310, 141, 302, HT),
  part('nadgarstek', 'Kości nadgarstka', LX, 355, 146, 356, T),
  part('udowa', 'Kość udowa', LX, 400, 187, 400),
  part('rzepka', 'Rzepka', LX, 445, 190, 474),
  part('strzalkowa', 'Kość strzałkowa', LX, 530, 182, 527, HT),
  part('zuchwa', 'Żuchwa', RX, 85, 240, 102, HT),
  part('lopatka', 'Łopatka', RX, 130, 259, 168),
  part('zebra', 'Żebra', RX, 178, 268, 202),
  part('kregoslup', 'Kręgosłup', RX, 235, 226, 258),
  part('lokciowa', 'Kość łokciowa', RX, 290, 285, 300, HT),
  part('miednica', 'Kość miedniczna', RX, 335, 262, 314),
  part('paliczki', 'Paliczki', RX, 395, 295, 396, T),
  part('piszczelowa', 'Kość piszczelowa', RX, 480, 242, 525, HT),
  part('step', 'Kości stępu', RX, 575, 250, 580, T),
];
export const skeletonPartsFor = (l: Level) => SKELETON_PARTS.filter((p) => p.levels.includes(l));

/** Główne części szkieletu (minigra „Złóż szkielet”). */
export const REGION_PARTS: DiagramPart[] = [
  part('r-czaszka', 'Czaszka', LX, 40, 198, 44),
  part('r-klatka', 'Klatka piersiowa', LX, 185, 196, 192),
  part('r-obr-mied', 'Obręcz miedniczna', LX, 300, 186, 318),
  part('r-k-dolna', 'Kończyna dolna', LX, 430, 187, 430),
  part('r-obr-bark', 'Obręcz barkowa', RX, 130, 262, 146),
  part('r-k-gorna', 'Kończyna górna', RX, 215, 286, 215),
  part('r-kregoslup', 'Kręgosłup', RX, 275, 226, 262),
];

/** Przekrój podłużny kości długiej (rosnącej). */
export const LONGBONE_VIEW = { w: 440, h: 320 };
export const LONGBONE_PARTS: DiagramPart[] = [
  part('nasada-bliz', 'Nasada bliższa', 50, 30, 88, 112),
  part('okostna', 'Okostna', 135, 30, 165, 124),
  part('trzon', 'Trzon', 220, 30, 220, 132),
  part('chrz-nasad', 'Chrząstka nasadowa', 305, 30, 312, 132, HT),
  part('nasada-dal', 'Nasada dalsza', 390, 30, 350, 112),
  part('chrz-staw', 'Chrząstka stawowa', 50, 290, 54, 190),
  part('szpik-czerw', 'Szpik czerwony', 135, 290, 100, 186, HT),
  part('jama', 'Jama szpikowa', 220, 290, 220, 166),
  part('zbita', 'Istota zbita', 305, 290, 280, 190),
  part('gabczasta', 'Istota gąbczasta', 390, 290, 345, 190),
];
export const longbonePartsFor = (l: Level) => LONGBONE_PARTS.filter((p) => p.levels.includes(l));

/** Schemat stawu. */
export const JOINT_VIEW = { w: 360, h: 420 };
export const JOINT_PARTS: DiagramPart[] = [
  part('torebka', 'Torebka stawowa', 50, 95, 108, 160),
  part('glowka', 'Główka stawowa', 50, 190, 150, 192),
  part('wiezadlo', 'Więzadło', 50, 300, 90, 290),
  part('panewka', 'Panewka stawowa', 50, 375, 150, 262),
  part('jama', 'Jama stawowa z mazią', 310, 110, 240, 172),
  part('chrzastka', 'Chrząstka stawowa', 310, 235, 216, 238),
];

/* ---------- Połączenia kości (minigra „Ruchome czy ścisłe?”) ---------- */
export interface JointMark { id: string; name: string; x: number; y: number; movable: boolean; kind: string; levels: Level[]; group?: string }
export const JOINT_MARKS: JointMark[] = [
  { id: 'szwy', name: 'Szwy czaszki', x: 220, y: 18, movable: false, kind: 'więzozrost', levels: ALL },
  { id: 'skron', name: 'Staw skroniowo-żuchwowy', x: 196, y: 84, movable: true, kind: 'staw', levels: HT },
  { id: 'ramienny', name: 'Staw ramienny', x: 160, y: 150, movable: true, kind: 'staw kulisty', levels: ALL },
  { id: 'lokciowy', name: 'Staw łokciowy', x: 288, y: 254, movable: true, kind: 'staw', levels: ALL, group: 'c' },
  { id: 'krazki', name: 'Krążki międzykręgowe', x: 220, y: 248, movable: false, kind: 'chrząstkozrost', levels: HT, group: 'c' },
  { id: 'krzyzowa', name: 'Kość krzyżowa (zrośnięte kręgi)', x: 220, y: 300, movable: false, kind: 'kościozrost', levels: HT, group: 'd' },
  { id: 'lonowe', name: 'Spojenie łonowe', x: 220, y: 352, movable: false, kind: 'chrząstkozrost', levels: ALL, group: 'd' },
  { id: 'biodrowy', name: 'Staw biodrowy', x: 250, y: 330, movable: true, kind: 'staw kulisty', levels: ALL, group: 'd' },
  { id: 'kolanowy', name: 'Staw kolanowy', x: 190, y: 468, movable: true, kind: 'staw', levels: ALL },
  { id: 'skokowy', name: 'Staw skokowy', x: 250, y: 568, movable: true, kind: 'staw', levels: ALL },
];

/* ---------- Łańcuchy kości (kolejność od tułowia / od góry) ---------- */
export interface Chain { name: string; items: string[]; levels: Level[] }
export const CHAINS: Chain[] = [
  { name: 'kończyna górna – od tułowia do palców', levels: ['primary', 'highschool'], items: ['Obręcz barkowa', 'Kość ramienna', 'Kości przedramienia', 'Kości nadgarstka', 'Kości śródręcza', 'Paliczki palców ręki'] },
  { name: 'kończyna dolna – od tułowia do palców', levels: ['primary', 'highschool'], items: ['Obręcz miedniczna', 'Kość udowa', 'Kości podudzia', 'Kości stępu', 'Kości śródstopia', 'Paliczki palców stopy'] },
  { name: 'kręgosłup – od góry', levels: ALL, items: ['Odcinek szyjny', 'Odcinek piersiowy', 'Odcinek lędźwiowy', 'Kość krzyżowa', 'Kość ogonowa'] },
  { name: 'kończyna górna – kości i stawy', levels: T, items: ['Łopatka', 'Staw ramienny', 'Kość ramienna', 'Staw łokciowy', 'Kości przedramienia', 'Staw promieniowo-nadgarstkowy', 'Kości nadgarstka', 'Kości śródręcza', 'Paliczki palców ręki'] },
  { name: 'kończyna dolna – kości i stawy', levels: T, items: ['Kość miedniczna', 'Staw biodrowy', 'Kość udowa', 'Staw kolanowy', 'Kości podudzia', 'Staw skokowy', 'Kości stępu', 'Kości śródstopia', 'Paliczki palców stopy'] },
];
export const chainsFor = (l: Level) => CHAINS.filter((c) => c.levels.includes(l));
export const allChainItems = () => [...new Set(CHAINS.flatMap((c) => c.items))];

/* ---------- Opisy (minigra „Znajdź właściwy element”) ---------- */
export const ART_DESCRIPTIONS: { kind: ArtKind; text: string; levels: Level[]; fact: string }[] = [
  { kind: 'long', text: 'Kość długa – wydłużony trzon i dwie nasady (np. kość udowa)', levels: ALL, fact: 'Kości długie (np. udowa, ramienna) mają trzon i dwie nasady – działają jak dźwignie.' },
  { kind: 'short', text: 'Kość krótka – mała, zbliżona do sześcianu (np. kości nadgarstka)', levels: ALL, fact: 'Kości krótkie (nadgarstka, stępu) są wytrzymałe i umożliwiają drobne ruchy.' },
  { kind: 'flat', text: 'Kość płaska – cienka płytka (np. łopatka, kości sklepienia czaszki)', levels: ALL, fact: 'Kości płaskie chronią narządy (czaszka – mózg) i dają duże przyczepy mięśniom.' },
  { kind: 'irregular', text: 'Kość różnokształtna – np. kręg z trzonem i wyrostkami', levels: ALL, fact: 'Kręgi to kości różnokształtne: mają trzon, łuk i wyrostki.' },
  { kind: 'sesamoid', text: 'Trzeszczka – kość leżąca w ścięgnie, np. rzepka', levels: HT, fact: 'Rzepka to największa trzeszczka – leży w ścięgnie mięśnia czworogłowego uda.' },
  { kind: 'osteoblast', text: 'Komórka kościotwórcza – wytwarza substancję międzykomórkową kości', levels: HT, fact: 'Osteoblasty budują kość, a gdy otoczą się substancją międzykomórkową, stają się osteocytami.' },
  { kind: 'osteocyte', text: 'Dojrzała komórka kostna w jamce, z licznymi wypustkami', levels: HT, fact: 'Osteocyty leżą w jamkach kostnych i łączą się wypustkami w kanalikach.' },
  { kind: 'osteoclast', text: 'Duża, wielojądrowa komórka rozkładająca (resorbująca) kość', levels: HT, fact: 'Osteoklasty usuwają starą tkankę kostną – to warunek przebudowy kości.' },
  { kind: 'chondrocyte', text: 'Komórka tkanki chrzęstnej leżąca w jamce (często po dwie)', levels: T, fact: 'Chondrocyty leżą w jamkach, często w grupach izogenicznych; chrząstka nie ma naczyń krwionośnych.' },
];

/* ---------- Kryteria porządkowania ---------- */
export const ORDER_CRITERIA: { prompt: string; items: string[]; levels: Level[]; arts?: ArtKind[]; fact: string }[] = [
  { prompt: 'Od NAJDŁUŻSZEJ kości do najkrótszej', items: ['Kość udowa', 'Kość ramienna', 'Kość śródręcza', 'Paliczek palca'], levels: ALL, fact: 'Kość udowa jest najdłuższą kością człowieka; paliczki to najmniejsze kości długie.' },
  { prompt: 'Odcinki kręgosłupa – od NAJWIĘKSZEJ liczby kręgów do najmniejszej', items: ['Piersiowy (12)', 'Szyjny (7)', 'Lędźwiowy (5)'], levels: ['primary'], fact: 'Kręgów piersiowych jest 12, szyjnych 7, lędźwiowych 5.' },
  { prompt: 'Odcinki kręgosłupa – od góry do dołu', items: ['Szyjny', 'Piersiowy', 'Lędźwiowy', 'Krzyżowy', 'Ogonowy'], levels: ALL, fact: 'Kręgosłup: 7 kręgów szyjnych, 12 piersiowych, 5 lędźwiowych, kość krzyżowa i kość ogonowa.' },
  { prompt: 'Budowa kości długiej – od ZEWNĄTRZ do środka trzonu', items: ['Okostna', 'Istota zbita', 'Jama szpikowa'], levels: ALL, fact: 'Trzon pokrywa okostna, pod nią leży istota zbita, a w środku – jama szpikowa ze szpikiem.' },
  { prompt: 'Gojenie złamania – po kolei', items: ['Krwiak', 'Kostnina miękka', 'Kostnina twarda', 'Przebudowa kości'], levels: HT, fact: 'Krwiak → kostnina chrzęstno-włóknista (miękka) → kostnina kostna (twarda) → przebudowa przez osteoklasty i osteoblasty.' },
  { prompt: 'Losy komórki kostnej – po kolei', items: ['Komórka macierzysta (osteoprogenitorowa)', 'Osteoblast', 'Osteocyt'], levels: HT, fact: 'Osteoblast, który otoczy się wytworzoną przez siebie substancją międzykomórkową, staje się osteocytem.' },
  { prompt: 'Kostnienie na podłożu chrzęstnym – po kolei', items: ['Model z chrząstki szklistej', 'Punkt kostnienia w trzonie', 'Punkty kostnienia w nasadach', 'Zarośnięcie chrząstki nasadowej'], levels: T, fact: 'Chrzęstny model kości zastępowany jest tkanką kostną; wzrost na długość kończy się, gdy chrząstka nasadowa skostnieje.' },
  { prompt: 'Kości kończyny górnej – od NAJWYŻEJ położonej', items: ['Obojczyk', 'Kość ramienna', 'Kość łokciowa', 'Kości nadgarstka'], levels: ['primary', 'highschool'], fact: 'Obręcz barkowa (obojczyk, łopatka) łączy kończynę górną z tułowiem; dalej: ramię, przedramię, ręka.' },
];

/* ---------- Pierwsza pomoc / gojenie (minigra „Ratuj złamanie”) ---------- */
export interface StepToken { label: string; icon: string; why?: string }
export const FRACTURE_TASKS: Record<Level, { prompt: string; ordered: boolean; steps: StepToken[]; wrong: StepToken[]; info: string; target: string }> = {
  primary: {
    prompt: 'Pierwsza pomoc przy złamaniu kości przedramienia: przeciągnij do poszkodowanego TYLKO właściwe działania.',
    ordered: false,
    target: 'POSZKODOWANY',
    steps: [
      { label: 'Wezwij pomoc (112)', icon: '📞' },
      { label: 'Unieruchom dwa sąsiednie stawy', icon: '🩹' },
      { label: 'Przyłóż zimny okład przez materiał', icon: '🧊' },
    ],
    wrong: [
      { label: 'Nastaw kość na miejsce', icon: '🤲', why: 'Nigdy nie nastawiamy kości – można uszkodzić naczynia i nerwy. Robi to lekarz.' },
      { label: 'Każ poruszać ręką', icon: '🔄', why: 'Ruch przemieszcza odłamy kości – kończynę trzeba unieruchomić.' },
      { label: 'Masuj bolące miejsce', icon: '💆', why: 'Masowanie złamania jest szkodliwe – może przemieścić odłamy.' },
    ],
    info: 'Złamanie: wezwij pomoc, unieruchom kończynę (dwa sąsiednie stawy), nie nastawiaj kości. Zimny okład zmniejsza obrzęk i ból.',
  },
  highschool: {
    prompt: 'Zrośnij złamanie: przeciągaj etapy gojenia kości do szczeliny złamania – po kolei!',
    ordered: true,
    target: 'ZŁAMANIE',
    steps: [
      { label: 'Krwiak w szczelinie złamania', icon: '🩸' },
      { label: 'Kostnina miękka (chrzęstno-włóknista)', icon: '🧵' },
      { label: 'Kostnina twarda (kostna)', icon: '🦴' },
      { label: 'Przebudowa kości', icon: '🔧' },
    ],
    wrong: [
      { label: 'Zanik okostnej', icon: '🩻', why: 'Okostna jest potrzebna do gojenia – zawiera komórki kościotwórcze.' },
      { label: 'Zamiana kości w chrząstkę stawową', icon: '🧊', why: 'Chrząstka stawowa pokrywa powierzchnie stawowe – nie jest etapem gojenia złamania.' },
    ],
    info: 'Gojenie złamania: krwiak → kostnina miękka (chrzęstno-włóknista) → kostnina twarda (kostna) → przebudowa i odtworzenie kształtu kości.',
  },
  technical: {
    prompt: 'Leczenie i gojenie złamania – ułóż etapy po kolei.',
    ordered: true,
    target: 'ZŁAMANIE',
    steps: [
      { label: 'Repozycja i unieruchomienie odłamów (lekarz)', icon: '🏥' },
      { label: 'Krwiak i odczyn zapalny', icon: '🩸' },
      { label: 'Kostnina miękka (chrzęstno-włóknista)', icon: '🧵' },
      { label: 'Kostnina twarda (kostna)', icon: '🦴' },
      { label: 'Przebudowa (osteoklasty + osteoblasty)', icon: '🔧' },
    ],
    wrong: [
      { label: 'Masaż miejsca złamania w 1. dobie', icon: '💆', why: 'Świeże złamanie wymaga unieruchomienia – masaż może przemieścić odłamy.' },
      { label: 'Resorpcja chrząstki stawowej', icon: '🧊', why: 'To nie jest etap gojenia złamania.' },
    ],
    info: 'Lekarz nastawia (repozycja) i unieruchamia odłamy. Gojenie: krwiak → kostnina miękka → kostnina twarda → przebudowa (osteoklasty usuwają nadmiar, osteoblasty budują).',
  },
};

/* ---------- Zdrowa postawa (minigra „Chroń kręgosłup”) ---------- */
export const HABITS: { label: string; icon: string; bad: boolean; levels: Level[] }[] = [
  { label: 'Plecak na jednym ramieniu', icon: '🎒', bad: true, levels: ALL },
  { label: 'Garbienie się przy biurku', icon: '🪑', bad: true, levels: ALL },
  { label: 'Głowa pochylona nad telefonem', icon: '📱', bad: true, levels: ALL },
  { label: 'Cały dzień bez ruchu', icon: '🛋️', bad: true, levels: ALL },
  { label: 'Dźwiganie na prostych nogach', icon: '🏋️', bad: true, levels: HT },
  { label: 'Za ciężki tornister', icon: '🧱', bad: true, levels: ALL },
  { label: 'Plecak na obu ramionach', icon: '🎒', bad: false, levels: ALL },
  { label: 'Pływanie', icon: '🏊', bad: false, levels: ALL },
  { label: 'Spacer na słońcu (witamina D)', icon: '☀️', bad: false, levels: ALL },
  { label: 'Proste plecy przy biurku', icon: '🧍', bad: false, levels: ALL },
  { label: 'Nabiał – źródło wapnia', icon: '🥛', bad: false, levels: ALL },
  { label: 'Podnoszenie z ugiętymi kolanami', icon: '🦵', bad: false, levels: HT },
  { label: 'Przerwa na rozciąganie', icon: '🧘', bad: false, levels: ALL },
];

/* ---------- Pacjenci (minigra pamięciowa) ---------- */
export const PATIENT_NAMES = ['Ania', 'Bartek', 'Celina', 'Darek', 'Ewa', 'Filip', 'Gosia', 'Hubert', 'Iga', 'Janek', 'Kasia', 'Leon', 'Maja', 'Nikodem', 'Ola', 'Piotr'];
export const INJURY_BONES: Record<Level, string[]> = {
  primary: ['kość udowa', 'kość ramienna', 'obojczyk', 'żebro', 'kości przedramienia', 'kości podudzia'],
  highschool: ['kość udowa', 'kość ramienna', 'obojczyk', 'żebro', 'kość promieniowa', 'kość łokciowa', 'kość piszczelowa', 'kość strzałkowa'],
  technical: ['kość udowa', 'kość ramienna', 'obojczyk', 'żebro', 'kość promieniowa', 'kość łokciowa', 'kość piszczelowa', 'kość strzałkowa', 'kość łódeczkowata', 'kość piętowa'],
};

/* ---------- Dostęp do treści w bieżącym języku ---------- */
const locPart = (p: DiagramPart): DiagramPart => ({ ...p, name: t(p.name) });
export const skeletonParts = (l: Level) => skeletonPartsFor(l).map(locPart);
export const longboneParts = (l: Level) => longbonePartsFor(l).map(locPart);
export const jointParts = () => JOINT_PARTS.map(locPart);
export const regionParts = () => REGION_PARTS.map(locPart);
export const jointMarks = (l: Level) => JOINT_MARKS.filter((m) => m.levels.includes(l)).map((m) => ({ ...m, name: t(m.name), kind: t(m.kind) }));
export const chains = (l: Level): Chain[] => chainsFor(l).map((c) => ({ ...c, name: t(c.name), items: c.items.map(t) }));
export const artDescriptions = (l: Level) => ART_DESCRIPTIONS.filter((d) => d.levels.includes(l)).map((d) => ({ ...d, text: t(d.text), fact: t(d.fact) }));
export const orderCriteria = (l: Level) => ORDER_CRITERIA.filter((c) => c.levels.includes(l)).map((c) => ({ ...c, prompt: t(c.prompt), fact: t(c.fact), items: c.items.map(t) }));
export function fractureTask(l: Level) {
  const f = FRACTURE_TASKS[l];
  const s = (x: StepToken): StepToken => ({ ...x, label: t(x.label), why: x.why && t(x.why) });
  return { ...f, prompt: t(f.prompt), info: t(f.info), target: t(f.target), steps: f.steps.map(s), wrong: f.wrong.map(s) };
}
export const habits = (l: Level) => HABITS.filter((h) => h.levels.includes(l)).map((h) => ({ ...h, label: t(h.label) }));
export const injuryBones = (l: Level) => INJURY_BONES[l].map(t);
