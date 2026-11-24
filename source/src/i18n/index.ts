/**
 * Lekki moduł wielojęzyczności (PL / EN) – bez zewnętrznych bibliotek.
 *  - L(pl, en) – tekst interfejsu zapisany obok kodu (działa też dla JSX),
 *  - t(pl)     – tłumaczenie tekstów z danych (schematy, łańcuchy kości, baza zadań…) przez słownik.
 * Język ustawia App przy każdym renderze (setLang), więc komponenty zawsze widzą bieżący.
 */
import { DICT } from './dict';
import { BANK_DICT } from './bankDict';

export type Lang = 'pl' | 'en';
let cur: Lang = 'pl';
export const setLang = (l: Lang) => { cur = l; };
export const getLang = () => cur;
export const isEn = () => cur === 'en';
export function L<T>(pl: T, en: T): T { return cur === 'en' ? en : pl; }
export function t(s: string): string { return cur === 'en' ? (DICT[s] ?? BANK_DICT[s] ?? s) : s; }
/** Tłumaczenie niezależne od bieżącego języka (np. do budowy angielskiej bazy zadań). */
export const toEn = (s: string) => DICT[s] ?? BANK_DICT[s] ?? s;
export const hasEn = (s: string) => s in DICT || s in BANK_DICT;
export const locale = () => (cur === 'en' ? 'en-GB' : 'pl-PL');
export const detectLang = (): Lang => (typeof navigator !== 'undefined' && !/^pl/i.test(navigator.language || 'pl') ? 'en' : 'pl');
