import type { Level } from '../types';
/** Wybór wartości zależnej od poziomu: podstawówka / liceum / technikum. */
export const lv = <T,>(l: Level, primary: T, highschool: T, technical: T): T =>
  l === 'primary' ? primary : l === 'highschool' ? highschool : technical;
