import type { Category, Difficulty, GameType, Level } from '../types';

export const LEVELS: { id: Level; name: string; short: string; desc: string }[] = [
  { id: 'primary', name: 'Szkoła podstawowa', short: 'Klasy 7–8', desc: 'Funkcje i budowa szkieletu, kości, stawy, zdrowa postawa.' },
  { id: 'highschool', name: 'Liceum', short: 'Zakres podst. i rozsz.', desc: 'Tkanka kostna, komórki kostne, połączenia kości, wzrost i gojenie.' },
  { id: 'technical', name: 'Technikum', short: 'Praktyka i dane', desc: 'Obliczenia, pomiary, diagnostyka obrazowa, pierwsza pomoc.' },
];
export const levelName = (l: Level) => LEVELS.find((x) => x.id === l)!.name;

export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'funkcje', name: 'Funkcje szkieletu' },
  { id: 'tkanka', name: 'Tkanka kostna i chrzęstna' },
  { id: 'budowa-kosci', name: 'Budowa kości' },
  { id: 'ksztalt', name: 'Kształty kości' },
  { id: 'sklad-chem', name: 'Skład chemiczny kości' },
  { id: 'czaszka', name: 'Czaszka' },
  { id: 'kregoslup', name: 'Kręgosłup' },
  { id: 'klatka', name: 'Klatka piersiowa' },
  { id: 'konczyna-gorna', name: 'Obręcz barkowa i kończyna górna' },
  { id: 'konczyna-dolna', name: 'Obręcz miedniczna i kończyna dolna' },
  { id: 'polaczenia', name: 'Połączenia kości' },
  { id: 'stawy', name: 'Budowa i rodzaje stawów' },
  { id: 'wzrost', name: 'Rozwój, wzrost i gojenie kości' },
  { id: 'zdrowie', name: 'Urazy, choroby i profilaktyka' },
];
export const catName = (c: Category) => CATEGORIES.find((x) => x.id === c)?.name ?? c;

export const GAME_TYPES: { id: GameType; name: string }[] = [
  { id: 'reflex', name: 'Zręcznościowe' },
  { id: 'logic', name: 'Logiczne' },
  { id: 'memory', name: 'Pamięciowe' },
  { id: 'observation', name: 'Obserwacyjne' },
  { id: 'classification', name: 'Klasyfikacyjne' },
  { id: 'math', name: 'Matematyczno-analityczne' },
  { id: 'spatial', name: 'Przestrzenne i manipulacyjne' },
];

export const DIFFICULTIES: { id: Difficulty; name: string; time: number }[] = [
  { id: 'veryEasy', name: 'Bardzo łatwe', time: 5 },
  { id: 'easy', name: 'Łatwe', time: 7 },
  { id: 'medium', name: 'Średnie', time: 10 },
  { id: 'hard', name: 'Trudne', time: 12 },
  { id: 'veryHard', name: 'Bardzo trudne', time: 15 },
];
export const DIFF_ORDER: Difficulty[] = DIFFICULTIES.map((d) => d.id);
