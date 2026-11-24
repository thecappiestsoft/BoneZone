# 🦴 BONE ZONE: Misja Szkielet

Alarm w pracowni anatomii – szkielet się rozsypał i tylko Ty możesz go złożyć z powrotem!

**Bone Zone** to dynamiczna gra edukacyjna o układzie kostnym człowieka: seria krótkich minigier na czas (38 + finał „Wielki Szkielet”) dla szkoły podstawowej (kl. 7–8), liceum i technikum. Wersja polska i angielska, motyw jasny i ciemny, panel nauczyciela z edytowalną bazą zadań. Działa w przeglądarce – bez logowania, serwera i instalacji.

© 2026 CappySoft.pl

---

## Struktura repozytorium

```
bone-zone/
├── index.html              ← GOTOWA GRA – tę stronę serwuje GitHub Pages
├── assets/                 ← skrypt i style gry (wygenerowane – nie edytuj ręcznie)
│   ├── bone-zone.js
│   └── bone-zone.css
├── offline/
│   └── bone-zone-offline.html   ← cała gra w jednym pliku (dwuklik, bez internetu)
├── .nojekyll               ← GitHub Pages serwuje pliki bez przetwarzania
├── README.md               ← ten plik
└── source/                 ← KOD ŹRÓDŁOWY – tu wprowadzasz zmiany
    ├── index.html          ← szablon strony (punkt wejścia Vite)
    ├── package.json        ← skrypty: dev, build, deploy, test
    ├── vite.config.ts
    ├── scripts/deploy.mjs  ← kopiuje zbudowaną grę do katalogu głównego
    ├── tests/logic.test.ts ← testy logiki i kompletności tłumaczeń
    └── src/
        ├── App.tsx               nawigacja między ekranami, język, motyw
        ├── main.tsx              start aplikacji
        ├── types.ts              typy wspólne
        ├── components/           menu, podsumowanie, odznaki, wyzwanie klasowe,
        │                         przełączniki języka (LangSwitch) i motywu (ThemeSwitch)
        ├── engine/               silnik: GameRunner, punktacja, losowanie rund, ustawienia,
        │                         baza zadań, dźwięki, odznaki, pierwsza pomoc (firstAid.ts)
        ├── minigames/            każda minigra w osobnym pliku + registry.ts (lista minigier)
        │   └── common/           grafiki SVG (Art.tsx), schematy (Diagrams.tsx),
        │                         przeciągnij/kliknij, sortownik, łączenie par…
        ├── data/
        │   ├── questions.ts      domyślna baza zadań (PL)
        │   ├── content.ts        schematy, łańcuchy kości, kryteria, nawyki…
        │   └── catalog.ts        poziomy, kategorie, typy minigier
        ├── i18n/                 wersja angielska
        │   ├── index.ts          L(pl, en) i t(pl) – mechanizm tłumaczeń
        │   ├── dict.ts           słownik treści PL → EN
        │   ├── bankDict.ts       tłumaczenie bazy zadań
        │   └── registryEn.ts     angielskie nazwy i opisy minigier
        ├── teacher/              panel nauczyciela i edytor bazy zadań
        └── styles/app.css        cała oprawa graficzna (motyw ciemny i jasny – zmienne CSS na górze pliku)
```

## Publikacja na GitHub Pages

1. Wgraj całą zawartość tego folderu do repozytorium na GitHubie (np. `bone-zone`).
2. W repozytorium: **Settings → Pages → Build and deployment**
   - *Source*: **Deploy from a branch**
   - *Branch*: **main**, folder **/ (root)** → **Save**
3. Po chwili gra będzie dostępna pod adresem `https://<twoja-nazwa>.github.io/bone-zone/`.

Gra używa ścieżek względnych, więc działa w podkatalogu, na własnej domenie i na każdym innym hostingu statycznym (Netlify, serwer szkoły). Nic nie trzeba konfigurować.

## Edycja gry (dla deweloperów)

Wymagany **Node.js 18+**. Wszystkie polecenia uruchamiasz w folderze `source/`:

```bash
cd source
```

```bash
npm install
```

Tryb deweloperski z podglądem na żywo (http://localhost:5173):

```bash
npm run dev
```

Testy logiki (punktacja, zasady pierwszej pomocy, losowanie, kompletność tłumaczeń PL/EN):

```bash
npm test
```

Zbudowanie gry i skopiowanie jej do katalogu głównego (aktualizuje `index.html`, `assets/` i `offline/`):

```bash
npm run deploy
```

Potem wystarczy zatwierdzić zmiany i wypchnąć je na GitHuba – Pages opublikuje nową wersję automatycznie.

> **Ważne:** nie edytuj ręcznie `index.html`, `assets/` ani `offline/` w katalogu głównym – są nadpisywane przy każdym `npm run deploy`. Zmiany wprowadzaj w `source/`.

### Gdzie co zmienić – szybka ściąga

| Chcę zmienić… | Plik |
|---|---|
| pytania i zadania (domyślna baza PL) | `source/src/data/questions.ts` |
| tłumaczenie zadań na angielski | `source/src/i18n/bankDict.ts` |
| podpisy schematów, łańcuchy kości, nawyki, etapy gojenia | `source/src/data/content.ts` (+ `source/src/i18n/dict.ts`) |
| poziomy, kategorie, typy minigier | `source/src/data/catalog.ts` |
| listę minigier, ich polecenia i opisy | `source/src/minigames/registry.ts` (+ `source/src/i18n/registryEn.ts`) |
| konkretną minigrę | `source/src/minigames/<NazwaMinigry>.tsx` |
| rysunki kości i komórek / schematy | `source/src/minigames/common/Art.tsx`, `Diagrams.tsx` |
| kolory, motyw jasny i ciemny | `source/src/styles/app.css` (zmienne na początku pliku) |
| punktację, czas, domyślne ustawienia | `source/src/engine/settings.ts`, `scoring.ts` |
| odznaki | `source/src/engine/achievements.ts` |

`npm test` sprawdza m.in., czy każdy tekst z danych i z bazy zadań ma tłumaczenie angielskie – po dodaniu nowego zadania lub podpisu uzupełnij słownik w `source/src/i18n/`.

Szczegółowy opis gry, minigier, poziomów i założeń merytorycznych: [`source/README.md`](source/README.md).

## Technologie

React 19, TypeScript, Vite, czyste CSS, ikony Lucide. Grafiki i schematy – własne SVG. Dźwięki syntezowane w przeglądarce (Web Audio API). Brak zewnętrznych zasobów – gra działa offline.
