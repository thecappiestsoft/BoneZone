/* Testy logiki gry: npm test */
import { scoreRound } from '../src/engine/scoring';
import { DEFAULT_SETTINGS } from '../src/engine/settings';
import { LIMBS, possibleInjuries, toImmobilize } from '../src/engine/firstAid';
import { buildRounds, eligibleGames } from '../src/engine/sequence';
import { DEFAULT_BANK, SORT_SETS, PAIR_GROUPS } from '../src/data/questions';
import { CATEGORIES } from '../src/data/catalog';
import { SKELETON_PARTS, LONGBONE_PARTS, JOINT_PARTS, REGION_PARTS, CHAINS, ORDER_CRITERIA, FRACTURE_TASKS } from '../src/data/content';
import { BOSS_ID, MINIGAMES } from '../src/minigames/registry';
import { validateBank, DEFAULT_BANK_EN } from '../src/engine/bank';
import { hasEn, setLang, L } from '../src/i18n';
import { REGISTRY_EN } from '../src/i18n/registryEn';
import { LIMBS as LIMBS2 } from '../src/engine/firstAid';
import { ART_NAMES } from '../src/minigames/common/Art';
import { HABITS, ART_DESCRIPTIONS as AD, INJURY_BONES, JOINT_MARKS } from '../src/data/content';
import { LEVELS, GAME_TYPES, DIFFICULTIES } from '../src/data/catalog';

let fails = 0;
const ok = (cond: boolean, msg: string) => { if (!cond) { fails++; console.log('✗', msg); } else console.log('✓', msg); };
const S = DEFAULT_SETTINGS;
const base = { timeout: false, elapsedMs: 6000, limitMs: 10000, mistakes: 0, streakBefore: 0, learn: false };

// punktacja
ok(scoreRound(S, { ...base, success: true }).total === 100, 'poprawne = 100 pkt');
ok(scoreRound(S, { ...base, success: true, elapsedMs: 3000 }).total === 125, 'szybko i bez błędu = +25');
ok(scoreRound(S, { ...base, success: true, elapsedMs: 3000, mistakes: 1 }).speed === 0, 'brak premii za szybkość przy pomyłce');
ok(scoreRound(S, { ...base, success: true, streakBefore: 2 }).combo === 50, 'COMBO ×3 = +50');
ok(scoreRound(S, { ...base, success: true, streakBefore: 4 }).combo === 100, 'COMBO ×5 = +100');
ok(scoreRound(S, { ...base, success: true, streakBefore: 9 }).combo === 250, 'COMBO ×10 = +250');
ok(scoreRound(S, { ...base, success: true, streakBefore: 5 }).combo === 0, 'COMBO ×6 = 0');
ok(scoreRound(S, { ...base, success: false, streakBefore: 7 }).streak === 0, 'błąd przerywa serię');
ok(scoreRound(S, { ...base, success: false, timeout: true }).total === 0, 'czas minął = 0 pkt');
ok(scoreRound({ ...S, comboEnabled: false }, { ...base, success: true, streakBefore: 2 }).combo === 0, 'COMBO można wyłączyć');
ok(scoreRound({ ...S, wrongPenalty: 30 }, { ...base, success: false }).total === -30, 'kara za błędne zadanie');
ok(scoreRound({ ...S, penaltiesEnabled: false, wrongPenalty: 30 }, { ...base, success: false, mistakes: 2 }).total === 0, 'kary można wyłączyć');

// pierwsza pomoc – zasada unieruchamiania
const names = (inj: ReturnType<typeof possibleInjuries>[number]) => toImmobilize(inj).map((s) => s.id).sort().join('+');
const find = (limb: string, seg: string) => possibleInjuries().find((i) => i.limb.id === limb && i.limb.segments[i.at].id === seg)!;
ok(names(find('upper', 'przedramie')) === 'lokiec+nadgarstek', 'złamanie przedramienia → łokieć + nadgarstek');
ok(names(find('upper', 'ramie')) === 'bark+lokiec', 'złamanie kości ramiennej → bark + łokieć');
ok(names(find('lower', 'udo')) === 'biodro+kolano', 'złamanie kości udowej → biodro + kolano');
ok(names(find('lower', 'podudzie')) === 'kolano+skokowy', 'złamanie podudzia → kolano + staw skokowy');
ok(names(find('lower', 'kolano')) === 'podudzie+udo', 'zwichnięcie kolana → udo + podudzie');
ok(names(find('lower', 'skokowy')) === 'podudzie+stopa', 'zwichnięcie stawu skokowego → podudzie + stopa');
ok(possibleInjuries().every((i) => toImmobilize(i).every((s) => s.kind !== i.limb.segments[i.at].kind)), 'złamanie → stawy, zwichnięcie → kości');
ok(LIMBS.every((l) => l.segments.every((s, i) => s.kind === (i % 2 ? 'bone' : 'joint'))), 'kończyny: naprzemiennie staw – kość');

// treści
const uniq = (arr: string[]) => new Set(arr).size === arr.length;
ok(uniq(SKELETON_PARTS.map((p) => p.id)) && uniq(LONGBONE_PARTS.map((p) => p.id)) && uniq(JOINT_PARTS.map((p) => p.id)) && uniq(REGION_PARTS.map((p) => p.id)), 'unikalne id części schematów');
for (const l of ['primary', 'highschool', 'technical'] as const) {
  ok(SKELETON_PARTS.filter((p) => p.levels.includes(l)).length >= 8, `${l}: min. 8 kości na schemacie szkieletu`);
  ok(CHAINS.some((c) => c.levels.includes(l)) && ORDER_CRITERIA.some((c) => c.levels.includes(l)), `${l}: łańcuchy kości i kryteria porządkowania`);
  ok(FRACTURE_TASKS[l].steps.length >= 3, `${l}: zadanie „Ratuj złamanie”`);
}
const cats = CATEGORIES.map((c) => c.id);
ok(DEFAULT_BANK.every((b) => cats.includes(b.category)), 'wszystkie zadania mają poprawną kategorię');
ok(DEFAULT_BANK.filter((b) => b.type === 'sort').every((b) => b.type === 'sort' && SORT_SETS[b.set]?.bins.includes(b.bin)), 'sortowanie: poprawne zestawy i pojemniki');
ok(DEFAULT_BANK.filter((b) => b.type === 'pair').every((b) => b.type === 'pair' && !!PAIR_GROUPS[b.group]), 'pary: poprawne grupy');
ok(MINIGAMES.every((g) => g.categories.every((c) => cats.includes(c))), 'minigry mają poprawne kategorie');

// rejestr i losowanie
const regular = MINIGAMES.filter((g) => !g.bossOnly);
ok(regular.length >= 33, `min. 33 minigry (jest ${regular.length})`);
ok(uniq(MINIGAMES.map((g) => g.id)), 'unikalne id minigier');
for (const l of ['primary', 'highschool', 'technical'] as const) {
  const el = eligibleGames(S, l, DEFAULT_BANK);
  ok(el.length >= 33, `${l}: ${el.length} dostępnych minigier`);
  const r = buildRounds(S, 'quick', l, 50, DEFAULT_BANK, 1234);
  let adj = 0;
  for (let i = 1; i < r.length; i++) if (r[i].gameId === r[i - 1].gameId) adj++;
  ok(adj === 0, `${l}: brak powtórzeń z rzędu w 50 rundach`);
  const counts: Record<string, number> = {};
  r.forEach((x) => (counts[x.gameId] = (counts[x.gameId] ?? 0) + 1));
  ok(Math.max(...Object.values(counts)) <= 2, `${l}: limit powtórzeń (maks. ${Math.max(...Object.values(counts))})`);
  const r10 = buildRounds(S, 'quick', l, 10, DEFAULT_BANK, 99);
  ok(new Set(r10.map((x) => x.gameId)).size === 10, `${l}: 10 różnych minigier w szybkiej grze`);
  const boss = buildRounds(S, 'boss', l, 8, DEFAULT_BANK, 5);
  ok(boss.length === 9 && boss[8].gameId === BOSS_ID, `${l}: Boss Rush kończy się finałem`);
  ok(boss[0].intensity <= boss[7].intensity, `${l}: Boss Rush – rosnąca trudność`);
  // każda kategoria osobno daje przynajmniej jedną minigrę
  const empty = cats.filter((c) => eligibleGames({ ...S, categories: [c] }, l, DEFAULT_BANK).length === 0);
  ok(empty.length === 0, `${l}: każda kategoria ma minigry${empty.length ? ` (brak: ${empty.join(', ')})` : ''}`);
}
ok(buildRounds({ ...S, timeMode: 'fixed', fixedTime: 8 }, 'quick', 'primary', 5, DEFAULT_BANK).every((r) => r.time === 8), 'stały czas zadań');
ok(buildRounds(S, 'learn', 'primary', 5, DEFAULT_BANK).every((r) => r.time === null), 'tryb nauki bez limitu');
ok(buildRounds({ ...S, timeLimitEnabled: false }, 'quick', 'primary', 5, DEFAULT_BANK).every((r) => r.time === null), 'limit czasu można wyłączyć');
const onlySpine = eligibleGames({ ...S, categories: ['kregoslup'] }, 'primary', DEFAULT_BANK);
ok(onlySpine.every((g) => g.categories.includes('kregoslup')), `filtr kategorii (kręgosłup: ${onlySpine.length})`);
const noMemory = eligibleGames({ ...S, gameTypes: S.gameTypes.filter((t) => t !== 'memory') }, 'primary', DEFAULT_BANK);
ok(noMemory.every((g) => g.type !== 'memory'), 'wyłączenie typu minigier');
ok(eligibleGames({ ...S, disabledGames: ['catch-bones'] }, 'primary', DEFAULT_BANK).every((g) => g.id !== 'catch-bones'), 'wyłączenie pojedynczej minigry');

// baza zadań
const v = validateBank(JSON.parse(JSON.stringify({ items: DEFAULT_BANK })));
ok(v.items.length === DEFAULT_BANK.length && v.rejected === 0, `eksport/import bazy (${v.items.length} zadań)`);
ok(validateBank([{ id: 'x', type: 'tf', levels: ['primary'], category: 'funkcje' }]).rejected === 1, 'odrzucenie niepoprawnego zadania');
ok(uniq(DEFAULT_BANK.map((b) => b.id)), 'unikalne id zadań');

// wersja angielska – każdy tekst z danych ma tłumaczenie
const texts: string[] = [];
const push = (...a: (string | undefined)[]) => a.forEach((x) => x && texts.push(x));
[...SKELETON_PARTS, ...LONGBONE_PARTS, ...JOINT_PARTS, ...REGION_PARTS].forEach((p) => push(p.name));
JOINT_MARKS.forEach((m) => push(m.name, m.kind));
CHAINS.forEach((c) => push(c.name, ...c.items));
ORDER_CRITERIA.forEach((c) => push(c.prompt, c.fact, ...c.items));
AD.forEach((d) => push(d.text, d.fact));
Object.values(FRACTURE_TASKS).forEach((f) => { push(f.prompt, f.info, f.target); [...f.steps, ...f.wrong].forEach((x) => push(x.label, x.why)); });
HABITS.forEach((h) => push(h.label));
Object.values(INJURY_BONES).flat().forEach((b) => push(b));
LEVELS.forEach((l) => push(l.name, l.short, l.desc));
CATEGORIES.forEach((c) => push(c.name));
GAME_TYPES.forEach((c) => push(c.name));
DIFFICULTIES.forEach((c) => push(c.name));
LIMBS2.forEach((l) => push(l.name, ...l.segments.map((x) => x.name)));
Object.values(SORT_SETS).forEach((x) => push(x.name, ...x.bins));
Object.values(PAIR_GROUPS).forEach((x) => push(x));
Object.values(ART_NAMES).forEach((x) => push(x));
const missing = [...new Set(texts)].filter((x) => !hasEn(x));
ok(missing.length === 0, `EN: tłumaczenia treści (${texts.length} tekstów)${missing.length ? ` – brak: ${missing.slice(0, 5).join(' | ')}` : ''}`);
const plOnly = (x: string) => /[ąęłśżźćńó]/i.test(x);
const enItems = DEFAULT_BANK_EN.flatMap((b) => {
  const f: string[] = [b.explanation];
  if (b.type === 'tf') f.push(b.statement);
  if (b.type === 'quiz') f.push(b.question, b.correct, ...b.wrong);
  if (b.type === 'odd') f.push(b.odd, ...b.others);
  if (b.type === 'pair') f.push(b.left, b.right);
  if (b.type === 'sort') f.push(b.item, b.bin);
  return f;
});
ok(DEFAULT_BANK_EN.length === DEFAULT_BANK.length && enItems.every((x) => !plOnly(x)), `EN: baza zadań przetłumaczona (${DEFAULT_BANK_EN.length} zadań)`);
setLang('en');
ok(DEFAULT_BANK_EN.filter((b) => b.type === 'sort').every((b) => b.type === 'sort' && SORT_SETS[b.set].bins.map((x) => hasEn(x)).every(Boolean)), 'EN: pojemniki sortowania');
for (const l of ['primary', 'highschool', 'technical'] as const) {
  ok(eligibleGames(S, l, DEFAULT_BANK_EN).length === eligibleGames(S, l, DEFAULT_BANK).length, `EN ${l}: tyle samo dostępnych minigier`);
}
ok(MINIGAMES.every((g) => !!REGISTRY_EN[g.id]), 'EN: opisy wszystkich minigier');
ok(L('a', 'b') === 'b', 'przełączanie języka');
setLang('pl');
ok(L('a', 'b') === 'a', 'powrót do polskiego');

console.log(fails ? `\n${fails} BŁĘDÓW` : '\nWSZYSTKIE TESTY ZALICZONE');
process.exit(fails ? 1 : 0);
