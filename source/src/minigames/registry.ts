import type { MiniGameMeta } from '../types';
import { isEn } from '../i18n';
import { REGISTRY_EN } from '../i18n/registryEn';
import { bankFor } from '../engine/bank';
import { IMAGING, pairGroups, sortPool } from './common/bankHelpers';
import CatchBones from './CatchBones';
import MineralCatch from './MineralCatch';
import Remodel from './Remodel';
import HealFracture from './HealFracture';
import PostureGuard from './PostureGuard';
import CalciumRun from './CalciumRun';
import Mineralize from './Mineralize';
import Goniometer from './Goniometer';
import XrayScan from './XrayScan';
import BonePath from './BonePath';
import MatchFunction from './MatchFunction';
import OddOneOut from './OddOneOut';
import TrueFalse from './TrueFalse';
import JointToggle from './JointToggle';
import QuickQuiz from './QuickQuiz';
import MemoryBones from './MemoryBones';
import MemoryPatients from './MemoryPatients';
import VanishingLabels from './VanishingLabels';
import FindError from './FindError';
import FindBone from './FindBone';
import SpotChange from './SpotChange';
import { SortAxial, SortCells, SortChem, SortJoints, SortShape } from './BankSort';
import AcidFire from './AcidFire';
import CalcBone from './CalcBone';
import Imaging from './Imaging';
import CountVertebrae from './CountVertebrae';
import Immobilize from './Immobilize';
import { BoneLabels, BuildSkeleton, JointLabels, SkeletonLabels } from './DiagramLabels';
import FixLabels from './FixLabels';
import ConnectChain from './ConnectChain';
import ArrangeOrder from './ArrangeOrder';
import GrandSkeleton from './GrandSkeleton';

const ALL3 = ['primary', 'highschool', 'technical'] as const;
const HT = ['highschool', 'technical'] as const;
const LIMBS = ['konczyna-gorna', 'konczyna-dolna'] as const;
const SKELETON = ['czaszka', 'kregoslup', 'klatka', 'konczyna-gorna', 'konczyna-dolna'] as const;

/**
 * Rejestr minigier. Każda minigra to niezależny komponent; tutaj są tylko metadane:
 * kategorie, poziomy, trudność (→ czas), polecenia i informacje edukacyjne.
 */
export const MINIGAMES: MiniGameMeta[] = [
  /* ---------- A. ZRĘCZNOŚCIOWE ---------- */
  { id: 'catch-bones', name: 'Złap kości', type: 'reflex', categories: ['ksztalt'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'easy', technical: 'medium' }, instruction: 'ZŁAP WŁAŚCIWE KOŚCI!',
    fact: 'Kości dzielimy według kształtu na długie, krótkie, płaskie i różnokształtne.',
    learn: 'Kości długie (np. udowa) mają trzon i dwie nasady i działają jak dźwignie. Kości krótkie (nadgarstka, stępu) są małe i wytrzymałe. Kości płaskie (łopatka, mostek, kości sklepienia czaszki) chronią narządy. Kości różnokształtne to np. kręgi.',
    component: CatchBones },
  { id: 'mineral-catch', name: 'Budulec kości', type: 'reflex', categories: ['sklad-chem', 'zdrowie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ŁAP MINERAŁY!',
    fact: 'Twardość kości zapewniają sole mineralne – głównie fosforany wapnia.',
    learn: 'Kość zawiera sole mineralne (głównie fosforan wapnia), związki organiczne (osseina – białko kolagen) i wodę. Wapń i fosfor dostarczamy z pożywieniem (np. nabiał, ryby), a witamina D ułatwia wchłanianie wapnia.',
    component: MineralCatch },
  { id: 'remodel', name: 'Przebudowa kości', type: 'reflex', categories: ['tkanka', 'wzrost'], levels: [...HT],
    difficulty: { highschool: 'medium', technical: 'medium' }, instruction: 'AKTYWUJ OSTEOKLASTY!',
    fact: 'Kość jest stale przebudowywana przez osteoklasty i osteoblasty.',
    learn: 'Osteoklasty (wielojądrowe komórki kościogubne) rozkładają tkankę kostną i uwalniają wapń. Osteoblasty (kościotwórcze) budują nową substancję międzykomórkową i przekształcają się w osteocyty. Dzięki przebudowie kość naprawia mikrouszkodzenia i dostosowuje się do obciążeń.',
    component: Remodel },
  { id: 'heal-fracture', name: 'Ratuj złamanie', type: 'reflex', categories: ['zdrowie', 'wzrost'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: { primary: 'UDZIEL PIERWSZEJ POMOCY!', highschool: 'ZROŚNIJ ZŁAMANIE!', technical: 'LECZ ZŁAMANIE!' },
    fact: 'Przy złamaniu unieruchamiamy kończynę i wzywamy pomoc – nie nastawiamy kości.',
    learn: 'Pierwsza pomoc: wezwij pomoc (112), unieruchom kończynę (przy złamaniu – dwa sąsiednie stawy), nie nastawiaj kości. Gojenie: krwiak → kostnina miękka (chrzęstno-włóknista) → kostnina twarda (kostna) → przebudowa. Kluczową rolę odgrywa okostna.',
    component: HealFracture },
  { id: 'posture-guard', name: 'Chroń kręgosłup', type: 'reflex', categories: ['kregoslup', 'zdrowie'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'medium' }, instruction: 'CHROŃ KRĘGOSŁUP!',
    fact: 'Prawidłowa postawa i ruch zapobiegają wadom postawy.',
    learn: 'Wady postawy to m.in. skolioza (boczne skrzywienie), nadmierna kifoza piersiowa (plecy okrągłe) i nadmierna lordoza lędźwiowa (plecy wklęsłe). Sprzyjają im: siedzenie w złej pozycji, brak ruchu, noszenie ciężarów jednostronnie. Chronią: aktywność fizyczna, pływanie, plecak na obu ramionach.',
    component: PostureGuard },
  { id: 'calcium-run', name: 'Transport wapnia', type: 'reflex', categories: ['sklad-chem', 'zdrowie', 'tkanka'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'DOSTARCZ WAPŃ DO KOŚCI!',
    fact: 'Wapń wchłania się w jelicie, a krew dostarcza go do kości.',
    learn: 'Wapń z pożywienia wchłania się w jelicie cienkim – ułatwia to witamina D (powstaje w skórze pod wpływem promieni UV, jest też w rybach). Krew rozprowadza wapń; w kości osteoblasty wbudowują go w substancję międzykomórkową. Niedobór witaminy D u dzieci prowadzi do krzywicy.',
    component: CalciumRun },
  { id: 'mineralize', name: 'Mineralizacja', type: 'reflex', categories: ['sklad-chem', 'tkanka'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZMINERALIZUJ KOŚĆ!',
    fact: 'Sole mineralne nadają kości twardość, a osseina – sprężystość.',
    learn: 'Substancja międzykomórkowa kości składa się z włókien kolagenu (osseina) i osadzonych na nich kryształów fosforanu wapnia (hydroksyapatytu). Połączenie obu składników daje kość twardą i jednocześnie odporną na złamanie.',
    component: Mineralize },
  { id: 'goniometer', name: 'Goniometr', type: 'reflex', categories: ['stawy', 'konczyna-gorna'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: 'ZMIERZ KĄT W STAWIE!',
    fact: 'Zakres ruchu w stawie mierzy się w stopniach – goniometrem.',
    learn: 'Staw łokciowy pozwala zginać i prostować przedramię. Goniometr ma dwa ramiona przykładane wzdłuż kości; odczytany kąt opisuje zgięcie. Zakres ruchu = zgięcie − wyprost. Wartości w grze są szkoleniowe.',
    component: Goniometer },
  { id: 'xray-scan', name: 'Skaner RTG', type: 'reflex', categories: ['budowa-kosci', 'konczyna-dolna', 'zdrowie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZATRZYMAJ SKANER RTG!',
    fact: 'Kość udowa ma nasadę bliższą, trzon i nasadę dalszą.',
    learn: 'Nasada bliższa leży bliżej tułowia (tu: przy stawie biodrowym – z głową kości udowej), nasada dalsza – dalej od tułowia (przy stawie kolanowym). Zdjęcie RTG to podstawowe badanie przy podejrzeniu złamania.',
    component: XrayScan },

  /* ---------- B. LOGICZNE ---------- */
  { id: 'bone-path', name: 'Kości po kolei', type: 'logic', categories: ['kregoslup', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'UŁÓŻ KOŚCI PO KOLEI!',
    fact: 'Kończyna = obręcz + kończyna wolna (od tułowia do palców).',
    learn: 'Kończyna górna: obręcz barkowa (obojczyk, łopatka) → kość ramienna → kości przedramienia (promieniowa, łokciowa) → kości nadgarstka → kości śródręcza → paliczki. Kończyna dolna: obręcz miedniczna → kość udowa → kości podudzia (piszczelowa, strzałkowa) → kości stępu → kości śródstopia → paliczki.',
    component: BonePath },
  { id: 'match-function', name: 'Połącz w pary', type: 'logic', categories: ['funkcje', 'budowa-kosci', 'stawy', 'tkanka', 'zdrowie', 'wzrost', ...LIMBS, 'klatka'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'medium' }, instruction: 'POŁĄCZ W PARY!',
    fact: 'Budowa każdego elementu szkieletu wiąże się z jego funkcją.',
    learn: 'Budowa jest związana z funkcją: np. gładka chrząstka stawowa zmniejsza tarcie, okostna odżywia kość, a szpik czerwony wytwarza krwinki.',
    available: (b, l, c) => pairGroups(b, l, c, (g) => g !== IMAGING).length > 0, component: MatchFunction },
  { id: 'odd-one-out', name: 'Kto tu nie pasuje?', type: 'logic', categories: ['funkcje', 'ksztalt', 'stawy', 'budowa-kosci', 'zdrowie', 'kregoslup', 'tkanka', 'polaczenia', 'czaszka', 'sklad-chem', 'klatka', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'KTO TU NIE PASUJE?',
    fact: 'Klasyfikowanie pojęć porządkuje wiedzę o szkielecie.',
    learn: 'Grupuj pojęcia: kości kończyny górnej i dolnej, kształty kości, elementy stawu, komórki tkanki kostnej, rodzaje połączeń kości.',
    available: (b, l, c) => bankFor(b, 'odd', l, c).length > 0, component: OddOneOut },
  { id: 'skeleton-labels', name: 'Podpisz szkielet', type: 'logic', categories: [...SKELETON], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'PODPISZ SZKIELET!',
    fact: 'Szkielet dorosłego człowieka tworzy ok. 206 kości.',
    learn: 'Na schematach w widoku od przodu prawa strona ciała jest po lewej stronie rysunku. W przedramieniu kość promieniowa leży po stronie kciuka, a w podudziu kość strzałkowa – bocznie (po stronie małego palca stopy).',
    component: SkeletonLabels },
  { id: 'true-false', name: 'Prawda czy fałsz?', type: 'logic', categories: ['funkcje', 'tkanka', 'budowa-kosci', 'ksztalt', 'sklad-chem', 'czaszka', 'kregoslup', 'klatka', 'konczyna-gorna', 'konczyna-dolna', 'polaczenia', 'stawy', 'wzrost', 'zdrowie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'PRAWDA CZY FAŁSZ?',
    fact: 'Uważne czytanie to połowa sukcesu!',
    learn: 'Zwróć uwagę na słowa „zawsze”, „nigdy”, „jedyny” – często kryją pułapki. Np. żuchwa to jedyna ruchoma kość czaszki, ale obręcze należą do szkieletu kończyn, a nie osiowego.',
    available: (b, l, c) => bankFor(b, 'tf', l, c).length >= 3, component: TrueFalse },
  { id: 'joint-toggle', name: 'Ruchome czy ścisłe?', type: 'logic', categories: ['polaczenia', 'stawy'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'USTAW RODZAJ POŁĄCZEŃ!',
    fact: 'Kości łączą się połączeniami ścisłymi lub ruchomymi (stawami).',
    learn: 'Połączenia ścisłe: więzozrosty (szwy czaszki), chrząstkozrosty (spojenie łonowe, krążki międzykręgowe), kościozrosty (kość krzyżowa, kość miedniczna). Połączenia ruchome to stawy – mają torebkę stawową, jamę stawową z mazią i powierzchnie stawowe pokryte chrząstką.',
    component: JointToggle },
  { id: 'quick-quiz', name: 'Szybki wybór', type: 'logic', categories: ['funkcje', 'budowa-kosci', 'czaszka', 'kregoslup', 'klatka', 'sklad-chem', 'stawy', 'tkanka', 'wzrost', 'polaczenia', 'zdrowie', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'SZYBKI WYBÓR!',
    fact: 'Szybka decyzja – ale przemyślana!',
    learn: 'Pytania z bazy zadań – nauczyciel może je edytować i dodawać własne w panelu nauczyciela.',
    available: (b, l, c) => bankFor(b, 'quiz', l, c).length > 0, component: QuickQuiz },

  /* ---------- C. PAMIĘCIOWE ---------- */
  { id: 'memory-bones', name: 'Zapamiętaj kości', type: 'memory', categories: ['ksztalt', 'tkanka'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'easy', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ KOLEJNOŚĆ!', delayedTimer: true,
    fact: 'Kształt kości łatwo rozpoznać: długa, krótka, płaska, różnokształtna.',
    learn: 'Komórki tkanki kostnej: osteoblasty (budują), osteocyty (dojrzałe, w jamkach, z wypustkami), osteoklasty (duże, wielojądrowe – rozkładają). Chondrocyty to komórki chrząstki.',
    component: MemoryBones },
  { id: 'memory-patients', name: 'Izba przyjęć', type: 'memory', categories: [...LIMBS, 'zdrowie'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ PACJENTÓW!', delayedTimer: true,
    fact: 'Złamanie potwierdza się badaniem RTG.',
    learn: 'Najczęściej łamane kości to m.in. kości przedramienia (np. przy upadku na rękę), obojczyk i kości podudzia. U osób z osteoporozą groźne są złamania szyjki kości udowej.',
    component: MemoryPatients },
  { id: 'vanishing-labels', name: 'Znikające podpisy', type: 'memory', categories: ['budowa-kosci', 'stawy', ...SKELETON], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'ZAPAMIĘTAJ PODPISY!', delayedTimer: true,
    fact: 'Nazwa anatomiczna zawsze wskazuje konkretne miejsce.',
    learn: 'Ucz się nazw razem z położeniem: nasada bliższa – bliżej tułowia, nasada dalsza – dalej; główka stawowa pasuje do panewki; kość promieniowa – po stronie kciuka.',
    component: VanishingLabels },

  /* ---------- D. OBSERWACYJNE ---------- */
  { id: 'find-error', name: 'Znajdź błąd', type: 'observation', categories: ['kregoslup', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'ZNAJDŹ BŁĄD W SCHEMACIE!',
    fact: 'Każda kość ma swoje stałe miejsce w szkielecie.',
    learn: 'Kręgosłup od góry: odcinek szyjny (7), piersiowy (12), lędźwiowy (5), kość krzyżowa, kość ogonowa. Kończyny – od obręczy do paliczków.',
    component: FindError },
  { id: 'find-bone', name: 'Znajdź właściwy element', type: 'observation', categories: ['ksztalt', 'tkanka'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'ZNAJDŹ WŁAŚCIWY ELEMENT!',
    fact: 'Budowa kości i komórek jest związana z ich funkcją.',
    learn: 'Kość długa – trzon i nasady; krótka – „kostka”; płaska – płytka; różnokształtna – np. kręg. Osteocyt ma liczne wypustki, osteoklast jest duży i wielojądrowy, osteoblast leży na powierzchni budowanej kości.',
    component: FindBone },
  { id: 'spot-change', name: 'Co się zmieniło?', type: 'observation', categories: ['ksztalt', 'tkanka'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'easy', technical: 'easy' }, instruction: 'CO SIĘ ZMIENIŁO?', delayedTimer: true,
    fact: 'Uważna obserwacja to podstawa pracy anatoma.',
    learn: 'Porównuj kształty: długość, szerokość, obecność wyrostków. W preparatach tkanki kostnej zwracaj uwagę na liczbę jąder i wypustki komórek.',
    component: SpotChange },

  /* ---------- E. KLASYFIKACYJNE ---------- */
  { id: 'sort-shape', name: 'Kształty kości', type: 'classification', categories: ['ksztalt'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'POSORTUJ KOŚCI!',
    fact: 'Kości: długie, krótkie, płaskie i różnokształtne.',
    learn: 'Długie: udowa, ramienna, piszczelowa, paliczki. Krótkie: kości nadgarstka i stępu. Płaskie: łopatka, mostek, kości sklepienia czaszki. Różnokształtne: kręgi, kość klinowa.',
    available: (b, l, c) => sortPool(b, 'shape', l, c).ok, component: SortShape },
  { id: 'sort-axial', name: 'Osiowy czy kończyn?', type: 'classification', categories: ['czaszka', 'kregoslup', 'klatka', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'SZKIELET OSIOWY CZY KOŃCZYN?',
    fact: 'Obręcze barkowa i miedniczna należą do szkieletu kończyn.',
    learn: 'Szkielet osiowy: czaszka, kręgosłup, klatka piersiowa. Szkielet kończyn: obręcz barkowa (obojczyki, łopatki) i kończyny górne wolne oraz obręcz miedniczna (kości miedniczne) i kończyny dolne wolne.',
    available: (b, l, c) => sortPool(b, 'axial', l, c).ok, component: SortAxial },
  { id: 'sort-chem', name: 'Sole czy osseina?', type: 'classification', categories: ['sklad-chem'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'POSORTUJ SKŁADNIKI KOŚCI!',
    fact: 'Sole mineralne – twardość; osseina – sprężystość.',
    learn: 'Sole mineralne (głównie fosforan wapnia) nadają kości twardość; po wyprażeniu zostają, a kwas je rozpuszcza. Osseina (kolagen) nadaje sprężystość; spala się w płomieniu, a w kwasie pozostaje.',
    available: (b, l, c) => sortPool(b, 'chem', l, c).ok, component: SortChem },
  { id: 'sort-joints', name: 'Połączenia kości', type: 'classification', categories: ['polaczenia'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'ŚCISŁE CZY RUCHOME?',
    fact: 'Stawy to połączenia ruchome; szwy czaszki – ścisłe.',
    learn: 'Połączenia ścisłe: więzozrosty, chrząstkozrosty, kościozrosty. Połączenia ruchome – stawy.',
    available: (b, l, c) => sortPool(b, 'joints', l, c).ok, component: SortJoints },
  { id: 'sort-cells', name: 'Komórki kostne', type: 'classification', categories: ['tkanka'], levels: [...HT],
    difficulty: { highschool: 'medium', technical: 'hard' }, instruction: 'POSORTUJ CECHY KOMÓREK!',
    fact: 'Osteoblasty budują, osteocyty utrzymują, osteoklasty rozkładają kość.',
    learn: 'Osteoblasty wytwarzają substancję międzykomórkową. Osteocyty to dojrzałe komórki w jamkach, połączone wypustkami. Osteoklasty – wielojądrowe – resorbują kość.',
    available: (b, l, c) => sortPool(b, 'cells', l, c).ok, component: SortCells },
  { id: 'acid-fire', name: 'Ogień czy kwas?', type: 'classification', categories: ['sklad-chem'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'easy', technical: 'medium' }, instruction: 'WYPRAŻANIE CZY KWAS?',
    fact: 'Wyprażona kość jest krucha, a odwapniona w kwasie – giętka.',
    learn: 'Doświadczenie: kość kurzą wyprażamy w płomieniu – spalają się związki organiczne, zostają sole mineralne, kość kruszy się. Drugą kość moczymy kilka dni w occie lub rozcieńczonym kwasie solnym – sole mineralne rozpuszczają się, zostaje osseina, kość daje się zgiąć.',
    component: AcidFire },

  /* ---------- F. MATEMATYCZNO-ANALITYCZNE ---------- */
  { id: 'calc-bone', name: 'Oblicz skład kości', type: 'math', categories: ['sklad-chem'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'OBLICZ SKŁAD KOŚCI!',
    fact: 'Sole mineralne stanowią większość masy kości (dane w zadaniach są uproszczone).',
    learn: 'Procent = część : całość × 100%. Po wyprażeniu zostaje masa soli mineralnych; ubytek masy to związki organiczne i woda. Dane w zadaniach są szkoleniowe.',
    component: CalcBone },
  { id: 'imaging', name: 'Badania obrazowe', type: 'math', categories: ['zdrowie'], levels: [...HT],
    difficulty: { highschool: 'medium', technical: 'hard' }, instruction: 'DOPASUJ BADANIA!',
    fact: 'Kości bada się m.in. za pomocą RTG, TK i densytometrii.',
    learn: 'RTG – podstawowe zdjęcie kości; TK – obrazy warstwowe; MR – dobrze pokazuje więzadła i chrząstki; USG – np. stawy biodrowe niemowląt; densytometria (DXA) – gęstość mineralna kości. Wyniki interpretuje lekarz; gra nie diagnozuje.',
    available: (b, l, c) => pairGroups(b, l, c, (g) => g === IMAGING).length > 0, component: Imaging },
  { id: 'count-vertebrae', name: 'Policz kręgi', type: 'math', categories: ['kregoslup'], levels: [...ALL3],
    difficulty: { primary: 'veryEasy', highschool: 'veryEasy', technical: 'easy' }, instruction: 'POLICZ KRĘGI!', delayedTimer: true,
    fact: 'Kręgosłup: 7 kręgów szyjnych, 12 piersiowych, 5 lędźwiowych.',
    learn: 'Do kręgów piersiowych (12) przyczepia się 12 par żeber. Kość krzyżowa powstaje z 5 zrośniętych kręgów, a kość ogonowa – z 3–5 szczątkowych kręgów.',
    component: CountVertebrae },
  { id: 'immobilize', name: 'Unieruchom!', type: 'math', categories: ['zdrowie', 'stawy', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'medium' }, instruction: 'CO UNIERUCHOMIĆ?',
    fact: 'Złamanie – dwa sąsiednie stawy; zwichnięcie – dwie sąsiednie kości.',
    learn: 'Przy złamaniu kości unieruchamia się dwa sąsiednie stawy (np. złamanie przedramienia – łokieć i nadgarstek). Przy zwichnięciu lub skręceniu stawu – dwie sąsiednie kości. Nie nastawiaj, unieruchom w zastanej pozycji i wezwij pomoc (112).',
    component: Immobilize },

  /* ---------- G. PRZESTRZENNE I MANIPULACYJNE ---------- */
  { id: 'build-skeleton', name: 'Złóż szkielet', type: 'spatial', categories: ['funkcje', ...SKELETON], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'ZŁÓŻ SZKIELET!',
    fact: 'Szkielet = szkielet osiowy + szkielet kończyn.',
    learn: 'Szkielet osiowy: czaszka, kręgosłup i klatka piersiowa. Szkielet kończyn: obręcze (barkowa i miedniczna) oraz kończyny wolne – górne i dolne.',
    component: BuildSkeleton },
  { id: 'bone-labels', name: 'Wnętrze kości', type: 'spatial', categories: ['budowa-kosci', 'wzrost'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'PODPISZ PRZEKRÓJ KOŚCI!',
    fact: 'Kość długa: nasady, trzon, okostna, istota zbita i gąbczasta, jama szpikowa.',
    learn: 'Trzon pokrywa okostna; ścianę trzonu tworzy istota zbita; wewnątrz jest jama szpikowa (u dorosłych ze szpikiem żółtym). Nasady wypełnia istota gąbczasta ze szpikiem czerwonym, a powierzchnie stawowe pokrywa chrząstka stawowa. U dzieci między nasadą a trzonem leży chrząstka nasadowa – dzięki niej kość rośnie na długość.',
    component: BoneLabels },
  { id: 'joint-labels', name: 'Budowa stawu', type: 'spatial', categories: ['stawy'], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'PODPISZ STAW!',
    fact: 'Staw: główka, panewka, chrząstka stawowa, torebka, jama stawowa z mazią, więzadła.',
    learn: 'Główka stawowa pasuje do panewki. Powierzchnie stawowe pokrywa gładka chrząstka. Torebka stawowa otacza staw; jej błona maziowa wytwarza maź wypełniającą jamę stawową. Więzadła wzmacniają staw.',
    component: JointLabels },
  { id: 'fix-labels', name: 'Popraw opis', type: 'spatial', categories: ['budowa-kosci', 'stawy', ...SKELETON], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'hard', technical: 'hard' }, instruction: 'POPRAW POMIESZANY OPIS!',
    fact: 'Opis schematu musi zgadzać się z rysunkiem.',
    learn: 'Sprawdzaj położenie: czy podpis wskazuje właściwy element? Pomagają punkty odniesienia – staw biodrowy, kolano, kciuk, nasada bliższa i dalsza.',
    component: FixLabels },
  { id: 'connect-chain', name: 'Połącz kości', type: 'spatial', categories: ['kregoslup', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'medium', highschool: 'medium', technical: 'hard' }, instruction: 'SZKIELET SIĘ ROZSYPAŁ!',
    fact: 'Kości łączą się w ciągłe łańcuchy – od obręczy do paliczków.',
    learn: 'Kości kończyn łączą się stawami: ramienny, łokciowy, promieniowo-nadgarstkowy; biodrowy, kolanowy, skokowy. Kręgi łączą się krążkami międzykręgowymi i stawami.',
    component: ConnectChain },
  { id: 'arrange-order', name: 'Ułóż według kryterium', type: 'spatial', categories: ['budowa-kosci', 'kregoslup', 'wzrost', 'konczyna-gorna'], levels: [...ALL3],
    difficulty: { primary: 'easy', highschool: 'medium', technical: 'hard' }, instruction: 'UŁÓŻ WEDŁUG KRYTERIUM!',
    fact: 'Porządkowanie pomaga zobaczyć zależności.',
    learn: 'Kość udowa jest najdłuższa. Trzon od zewnątrz: okostna → istota zbita → jama szpikowa. Gojenie złamania: krwiak → kostnina miękka → kostnina twarda → przebudowa.',
    component: ArrangeOrder },

  /* ---------- BOSS ---------- */
  { id: 'grand-skeleton', name: 'Wielki Szkielet', type: 'spatial', categories: ['ksztalt', 'zdrowie', 'kregoslup', ...LIMBS], levels: [...ALL3],
    difficulty: { primary: 'veryHard', highschool: 'veryHard', technical: 'veryHard' }, instruction: 'FINAŁ: WIELKI SZKIELET!', timeOverride: 40, bossOnly: true,
    fact: 'Wszystkie kości i stawy współpracują.',
    learn: 'Finał łączy kolejność kości, rozpoznawanie kształtów, gojenie złamań i zasady unieruchamiania.',
    component: GrandSkeleton },
];

export const BOSS_ID = 'grand-skeleton';
/** Metadane w bieżącym języku. */
export const locMeta = (g: MiniGameMeta): MiniGameMeta => (isEn() && REGISTRY_EN[g.id] ? { ...g, ...REGISTRY_EN[g.id] } : g);
export const gameById = (id: string) => locMeta(MINIGAMES.find((g) => g.id === id)!);
export const textFor = (v: string | Partial<Record<string, string>>, level: string) => (typeof v === 'string' ? v : v[level] ?? Object.values(v)[0] ?? '');
