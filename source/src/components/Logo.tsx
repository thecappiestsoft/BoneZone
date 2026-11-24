import { L } from '../i18n';

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? 'small' : ''}`} aria-label={L('Bone Zone: Misja Szkielet', 'Bone Zone: Mission Skeleton')}>
      <svg viewBox="0 0 100 100" className="logo-drop" aria-hidden>
        <g transform="rotate(-40 50 50)" fill="#f5ecd7" stroke="#fff" strokeWidth="5">
          <circle cx="18" cy="40" r="13" /><circle cx="18" cy="60" r="13" />
          <circle cx="82" cy="40" r="13" /><circle cx="82" cy="60" r="13" />
          <rect x="18" y="38" width="64" height="24" rx="6" />
        </g>
        <g transform="rotate(-40 50 50)" fill="#f5ecd7">
          <rect x="16" y="41" width="68" height="18" />
        </g>
        <path d="M22 54 h12 l6 -12 l8 22 l6 -10 h24" transform="rotate(-40 50 50)" stroke="#c2410c" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <div className="logo-title">BONE <span>ZONE</span></div>
        {!small && <div className="logo-sub">{L('MISJA SZKIELET', 'MISSION: SKELETON')}</div>}
      </div>
    </div>
  );
}
export function Footer() {
  return <footer className="footer">© 2026 CappySoft.pl</footer>;
}
