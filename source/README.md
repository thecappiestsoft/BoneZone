# BONE ZONE: Misja Szkielet

Dynamiczna gra edukacyjna w stylu „mikrogier” (seria bardzo krótkich zadań na czas) o **układzie kostnym człowieka**: budowie i funkcjach szkieletu, kościach, tkance kostnej i chrzęstnej, połączeniach kości i stawach, wzroście i gojeniu kości, urazach i profilaktyce. Przeznaczona do pracy na lekcji biologii – w szkole podstawowej (kl. 7–8), liceum i technikum.

Działa w przeglądarce, **bez logowania, bez serwera i bez internetu** (po zbudowaniu). Ustawienia, baza zadań, wyniki i odznaki zapisują się lokalnie na urządzeniu.

© 2026 CappySoft.pl

**Motyw jasny i ciemny** – przełącznik z ikonami ☀️ / 🌙 obok przełącznika języka (menu główne i panel nauczyciela). Przy pierwszym uruchomieniu gra przyjmuje motyw systemu, potem zapamiętuje wybór. Plansza minigier jest jasna w obu motywach, zmienia się „rama” aplikacji (tło, karty, pasek gry, panel nauczyciela).

**Dwie wersje językowe: polska i angielska (PL / EN).** Przełącznik jest w prawym górnym rogu menu głównego oraz w panelu nauczyciela. Przy pierwszym uruchomieniu gra wybiera język przeglądarki (polski → PL, każdy inny → EN), a potem zapamiętuje wybór.

---

## Uruchomienie

> Ten folder (`source/`) zawiera kod źródłowy. Gotowa gra do publikacji leży w katalogu głównym repozytorium – zob. [`../README.md`](../README.md).

Wymagany Node.js 18+. Polecenia uruchamiaj w folderze `source/`.

```bash
npm install
```

```bash
npm run dev
```

Otwórz adres podany w terminalu (domyślnie http://localhost:5173).

### Publikacja (GitHub Pages i inne hostingi)

```bash
npm run deploy
```

Buduje grę i kopiuje ją do katalogu głównego repozytorium: `index.html`, `assets/bone-zone.js`, `assets/bone-zone.css`, `offline/bone-zone-offline.html` oraz `.nojekyll`. Pliki mają stałe nazwy, więc zmiany w repozytorium są czytelne. Ścieżki są względne – gra działa też w podkatalogu.

Pojedyncze kroki: `npm run build` (→ `source/dist/`), `npm run build:single` (→ `source/dist-single/index.html`, cała gra w jednym pliku do otwarcia dwuklikiem).

### Testy logiki

```bash
npm test
```

Sprawdza m.in. punktację i COMBO, zasadę unieruchamiania (złamanie → 2 sąsiednie stawy, zwichnięcie → 2 sąsiednie kości), poprawność bazy zadań i schematów, kompletność tłumaczeń PL/EN, losowanie bez powtórzeń, limity powtórzeń, filtry kategorii/typów, tryb Boss Rush i import/eksport bazy zadań.

---

## Tryby gry

| Tryb | Opis |
|---|---|
| **Szybka gra** | 10 losowych minigier (liczba konfigurowalna). |
| **Maraton** | 20, 30 lub 50 minigier – walka o rekord. |
| **Boss Rush** | Coraz trudniejsze zadania, na końcu finał **„Wielki Szkielet”** (4 etapy łączące różne mechaniki). |
| **Nauka** | Bez limitu czasu; po każdym zadaniu dłuższe wyjaśnienie i przycisk „Dalej”. |
| **Wyzwanie klasowe** | Gracze kolejno przy jednym stanowisku, **te same zadania dla wszystkich**, ranking na końcu. |

## Minigry (38 + finał)

| Typ | Minigry |
|---|---|
| Zręcznościowe | Złap kości · Budulec kości · Przebudowa kości · Ratuj złamanie · Chroń kręgosłup · Transport wapnia · Mineralizacja · Goniometr · Skaner RTG |
| Logiczne | Kości po kolei · Połącz w pary · Kto tu nie pasuje? · Podpisz szkielet · Prawda czy fałsz? · Ruchome czy ścisłe? · Szybki wybór |
| Pamięciowe | Zapamiętaj kości · Izba przyjęć · Znikające podpisy |
| Obserwacyjne | Znajdź błąd · Znajdź właściwy element · Co się zmieniło? |
| Klasyfikacyjne | Kształty kości · Osiowy czy kończyn? · Sole czy osseina? · Połączenia kości · Komórki kostne · Ogień czy kwas? |
| Matematyczno-analityczne | Oblicz skład kości · Badania obrazowe · Policz kręgi · Unieruchom! |
| Przestrzenne | Złóż szkielet · Wnętrze kości · Budowa stawu · Popraw opis · Połącz kości · Ułóż według kryterium |
| Finał Boss Rush | Wielki Szkielet |

Poziomy różnią się mechaniką i zakresem wiedzy, np.:

- *Ratuj złamanie*: SP – pierwsza pomoc (wybierz właściwe działania); LO – etapy gojenia złamania po kolei; T – leczenie (repozycja, unieruchomienie) i gojenie z udziałem osteoklastów i osteoblastów.
- *Unieruchom!*: SP – wybór pary stawów przy złamaniu; LO/T – złamania i zwichnięcia, samodzielne zaznaczenie odcinków kończyny.
- *Goniometr*: SP – kąt prosty w łokciu; LO – odczyt zadanego kąta; T – obliczenie zakresu ruchu (zgięcie − wyprost).
- *Transport wapnia*: SP – dostarcz wapń z jelita do kości; LO/T – najpierw witamina D (wchłanianie wapnia).
- *Policz kręgi*: SP – policz kręgi; LO/T – rozpoznaj odcinek kręgosłupa po liczbie kręgów (szybciej).
- *Skaner RTG*: SP – znajdź złamanie; LO – nasada bliższa / trzon / nasada dalsza; T – bez podpowiedzi położenia stawów.

Każda runda losuje minigrę (unikając powtórzeń), treść, kolejność odpowiedzi, położenie elementów i wariant trudności.

## Schematy

Własne rysunki SVG: **szkielet** (widok od przodu, prawa strona ciała po lewej stronie rysunku – zaznaczone podpisem), **przekrój kości długiej** (nasady, trzon, okostna, istota zbita i gąbczasta, jama szpikowa, szpik, chrząstka stawowa i nasadowa) oraz **staw** (główka, panewka, chrząstka stawowa, torebka, jama stawowa z mazią, więzadła). Podpisy z liniami odniesienia, jak w podręczniku.

## Punktacja

- poprawne wykonanie: **100 pkt**, bez błędu w pierwszej połowie czasu: **+25 pkt**
- COMBO: 3 z rzędu **+50**, 5 z rzędu **+100**, 10 (i każde kolejne 10) **+250**
- pomyłka w trakcie zadania: **−10 pkt** (konfigurowalne); błędne zadanie / czas minął: 0 pkt

## Panel nauczyciela

- poziom, liczba minigier w każdym trybie, limit powtórzeń,
- czas: jeden dla wszystkich lub zależny od trudności (domyślnie 5/7/10/12/15 s),
- punkty, COMBO, kary,
- **kategorie tematyczne** (14) i **typy minigier**, wyłączanie pojedynczych minigier, **test dowolnej minigry** na wybranym poziomie,
- dźwięk, animacje, pauza, rozmiar interfejsu,
- **edycja bazy zadań** (prawda/fałsz, szybki wybór, kto nie pasuje, pary, sortowanie), **eksport i import JSON**,
- wyniki z eksportem do CSV.

## Poprawność merytoryczna – założenia

- Szkielet osiowy: czaszka, kręgosłup, klatka piersiowa; obręcze należą do szkieletu kończyn.
- Kręgosłup: 7 kręgów szyjnych, 12 piersiowych, 5 lędźwiowych, kość krzyżowa (5 zrośniętych), kość ogonowa.
- Pierwsza pomoc: złamanie – unieruchomienie dwóch sąsiednich stawów; zwichnięcie – dwóch sąsiednich kości; nigdy nie nastawiamy kości.
- Wartości liczbowe (skład kości, kąty w stawach) są **przykładowe/szkoleniowe**; minigra „Badania obrazowe” dotyczy wyłącznie znaczenia nazw badań – bez diagnozowania.

## Architektura

```
src/
  types.ts              typy wspólne
  App.tsx               nawigacja między ekranami
  engine/               GameRunner, punktacja, losowanie rund, ustawienia, baza zadań,
                        dźwięki (Web Audio), odznaki i wyniki, zasady unieruchamiania (firstAid.ts)
  minigames/            każda minigra = osobny komponent + registry.ts (metadane)
    common/             grafiki (Art.tsx), schematy (Diagrams.tsx), przeciągnij/kliknij,
                        sortownik, łączenie par, podpisywanie schematów, plansza ruchu
  data/                 baza zadań, schematy, łańcuchy kości, kryteria, katalogi
  teacher/              panel nauczyciela i edytor bazy zadań
  components/           menu, podsumowanie, odznaki, wyzwanie klasowe
```

### Jak dodać nową minigrę

1. Utwórz komponent w `src/minigames/MojaGra.tsx`, przyjmujący `MiniGameProps`. Po zakończeniu wywołaj `p.onDone({ success, info })`, przy pomyłce `p.onMistake()`. Losuj treść przez `p.rng`.
2. Dopisz wpis do tablicy `MINIGAMES` w `src/minigames/registry.ts`.

### Format bazy zadań (JSON)

```json
{
  "app": "bone-zone",
  "version": 1,
  "items": [
    { "id": "moje-1", "type": "tf", "levels": ["primary"], "category": "kregoslup",
      "statement": "Kręgosłup ma 5 kręgów lędźwiowych.", "answer": true,
      "explanation": "Szyjnych 7, piersiowych 12, lędźwiowych 5." }
  ]
}
```

Typy: `tf`, `quiz`, `odd` (`odd`, `others[]`), `pair` (`group`: `parts` | `functions` | `location` | `joint` | `jointtypes` | `cells` | `disease` | `imaging`), `sort` (`set`: `shape` | `axial` | `chem` | `joints` | `cells`, `item`, `bin`).
Poziomy: `primary`, `highschool`, `technical`. Kategorie: `funkcje`, `tkanka`, `budowa-kosci`, `ksztalt`, `sklad-chem`, `czaszka`, `kregoslup`, `klatka`, `konczyna-gorna`, `konczyna-dolna`, `polaczenia`, `stawy`, `wzrost`, `zdrowie`.

## Wersja angielska (i18n)

- `src/i18n/index.ts` – lekki moduł bez bibliotek: `L(pl, en)` dla tekstów interfejsu (także JSX) i `t(pl)` dla tekstów z danych (słownik PL → EN).
- `src/i18n/dict.ts` – tłumaczenia schematów, łańcuchów kości, kategorii, poziomów, kryteriów itp.
- `src/i18n/bankDict.ts` – tłumaczenia domyślnej bazy zadań; angielska baza (`DEFAULT_BANK_EN`) powstaje automatycznie z polskiej, więc obie mają te same zadania, poziomy i kategorie.
- `src/i18n/registryEn.ts` – angielskie nazwy, polecenia i wyjaśnienia minigier.
- **Każdy język ma własną, osobno edytowalną bazę zadań** (własne zadania nauczyciela po polsku nie mieszają się z angielskimi). Eksport JSON zawiera pole `lang`.
- `npm test` sprawdza, że każdy tekst z danych i z bazy zadań ma tłumaczenie.

Poziomy w wersji angielskiej: *Primary school (Years 7–8, ages 13–15)*, *High school*, *Vocational school*. Numer alarmowy podano jako „112 / 999”.

## Technologie

React 19, TypeScript, Vite, czyste CSS, ikony Lucide. Grafiki i schematy – własne SVG. Dźwięki syntezowane w przeglądarce (Web Audio API).
