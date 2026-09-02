import { useRef } from 'react';
import { pick, t } from '../i18n.js';

export default function TopBar({ cfg, showBack, onBack, onLongPress, lang, onToggleLang, role, onToggleRole }) {
  const timer = useRef(null);
  const start = () => { timer.current = setTimeout(onLongPress, 700); };
  const end = () => clearTimeout(timer.current);
  return (
    <header className="app-header" style={{ paddingTop: 'calc(.75rem + env(safe-area-inset-top,0px))' }}>
      <div className="header-inner">
        <div className="flex min-w-0 items-center gap-3">
          {showBack ? (
            <button className="header-icon" onClick={onBack}>‹</button>
          ) : (
            <div className="brand-mark">{cfg.emoji}</div>
          )}
          <div
            className="min-w-0 select-none"
            onTouchStart={start}
            onTouchEnd={end}
            onMouseDown={start}
            onMouseUp={end}
            onMouseLeave={end}
          >
            <div className="truncate text-base font-extrabold tracking-tight text-foreground md:text-lg">
              {showBack ? t(lang, 'detailTitle', pick(lang, cfg.orderLabel)) : cfg.productName}
            </div>
            {!showBack && (
              <div className="truncate text-[11px] font-medium text-muted-foreground">{pick(lang, cfg.name)} · Johor Bahru</div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="language-toggle" onClick={onToggleLang}>{lang === 'zh' ? 'EN' : '中'}</button>
          <button className="notification-button" aria-label="Notifications">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" strokeLinejoin="round" /><path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" /></svg>
            <span>●</span>
          </button>
          <button className="profile-button" onClick={onToggleRole}>
            <span>{role === 'admin' ? 'B' : 'S'}</span>
            <small>{role === 'admin' ? (lang === 'zh' ? '老板' : 'Boss') : (lang === 'zh' ? '员工' : 'Staff')}</small>
          </button>
        </div>
      </div>
    </header>
  );
}
