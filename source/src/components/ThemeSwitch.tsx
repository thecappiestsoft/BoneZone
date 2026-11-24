import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../engine/settings';
import { L } from '../i18n';

/** Przełącznik motywu: jasny / ciemny – dwie ikony. */
export function ThemeSwitch({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
  const opts: { id: Theme; label: string; Icon: typeof Sun }[] = [
    { id: 'light', label: L('Motyw jasny', 'Light theme'), Icon: Sun },
    { id: 'dark', label: L('Motyw ciemny', 'Dark theme'), Icon: Moon },
  ];
  return (
    <div className="theme-switch" role="radiogroup" aria-label={L('Motyw', 'Theme')}>
      {opts.map(({ id, label, Icon }) => (
        <button key={id} role="radio" aria-checked={theme === id} aria-label={label} title={label}
          className={theme === id ? 'active' : ''} onClick={() => onTheme(id)}>
          <Icon size={20} aria-hidden />
        </button>
      ))}
    </div>
  );
}
