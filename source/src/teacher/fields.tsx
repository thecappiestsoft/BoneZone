import type { ReactNode } from 'react';

export function Toggle({ label, checked, onChange, hint }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden />
      <span>{label}{hint && <small className="hint-text">{hint}</small>}</span>
    </label>
  );
}
export function NumberField({ label, value, onChange, min = 0, max = 9999, step = 1, suffix }: { label: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <label className="field-row">
      <span>{label}</span>
      <span className="num-wrap">
        <input type="number" className="input small" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v))); }} />
        {suffix && <span className="muted">{suffix}</span>}
      </span>
    </label>
  );
}
