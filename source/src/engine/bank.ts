import type { BankItem, BankType, Category, Level } from '../types';
import { DEFAULT_BANK } from '../data/questions';
import { load, remove, save } from './storage';
import { toEn, type Lang } from '../i18n';

/** Angielska wersja domyślnej bazy – te same zadania, teksty ze słownika. */
function translateItem(b: BankItem): BankItem {
  const e = { ...b, explanation: toEn(b.explanation) } as BankItem;
  switch (e.type) {
    case 'tf': return { ...e, statement: toEn(e.statement) };
    case 'quiz': return { ...e, question: toEn(e.question), correct: toEn(e.correct), wrong: e.wrong.map(toEn) };
    case 'odd': return { ...e, odd: toEn(e.odd), others: e.others.map(toEn) };
    case 'pair': return { ...e, left: toEn(e.left), right: toEn(e.right) };
    case 'sort': return { ...e, item: toEn(e.item), bin: toEn(e.bin) };
  }
}
export const DEFAULT_BANK_EN: BankItem[] = DEFAULT_BANK.map(translateItem);
export const defaultBank = (lang: Lang) => (lang === 'en' ? DEFAULT_BANK_EN : DEFAULT_BANK);

/** Każdy język ma własną (edytowalną) bazę zadań. */
const keyFor = (lang: Lang) => (lang === 'en' ? 'bank.en.v1' : 'bank.v1');
export function loadBank(lang: Lang = 'pl'): BankItem[] {
  return load<BankItem[] | null>(keyFor(lang), null) ?? defaultBank(lang);
}
export function saveBank(bank: BankItem[], lang: Lang = 'pl') {
  save(keyFor(lang), bank);
}
export function resetBank(lang: Lang = 'pl') {
  remove(keyFor(lang));
  return defaultBank(lang);
}

/** Pozycje bazy danego typu pasujące do poziomu i wybranych kategorii. */
export function bankFor<T extends BankType>(bank: BankItem[], type: T, level: Level, cats: Category[]) {
  return bank.filter((b) => b.type === type && b.levels.includes(level) && cats.includes(b.category)) as Extract<BankItem, { type: T }>[];
}

/** Walidacja importowanego pliku JSON. Zwraca poprawne pozycje i liczbę odrzuconych. */
export function validateBank(data: unknown): { items: BankItem[]; rejected: number } {
  const arr = Array.isArray(data) ? data : (data as { items?: unknown })?.items;
  if (!Array.isArray(arr)) throw new Error('Plik nie zawiera listy zadań.');
  const levels = ['primary', 'highschool', 'technical'];
  const items: BankItem[] = [];
  let rejected = 0;
  const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
  for (const raw of arr) {
    const r = raw as Record<string, unknown>;
    const okBase = str(r.id) && str(r.category) && Array.isArray(r.levels) && (r.levels as unknown[]).every((l) => levels.includes(l as string));
    let ok = false;
    switch (r.type) {
      case 'tf': ok = str(r.statement) && typeof r.answer === 'boolean'; break;
      case 'odd': ok = str(r.odd) && Array.isArray(r.others) && (r.others as unknown[]).length >= 2; break;
      case 'pair': ok = str(r.group) && str(r.left) && str(r.right); break;
      case 'sort': ok = str(r.set) && str(r.item) && str(r.bin); break;
      case 'quiz': ok = str(r.question) && str(r.correct) && Array.isArray(r.wrong) && (r.wrong as unknown[]).length >= 1; break;
    }
    if (okBase && ok) items.push({ explanation: '', ...(r as object) } as BankItem);
    else rejected++;
  }
  return { items, rejected };
}
