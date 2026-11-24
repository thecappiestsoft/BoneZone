import type { Lang } from '../i18n';

/** Przełącznik języka PL / EN. */
export function LangSwitch({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  return (
    <div className="lang-switch" role="radiogroup" aria-label="Język / Language">
      {(['pl', 'en'] as Lang[]).map((l) => (
        <button key={l} role="radio" aria-checked={lang === l} className={lang === l ? 'active' : ''} onClick={() => onLang(l)} lang={l}
          title={l === 'pl' ? 'Polski' : 'English'}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
