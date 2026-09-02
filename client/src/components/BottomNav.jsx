import { t } from '../i18n.js';
import { pick } from '../i18n.js';
import { cn } from '../lib/utils.js';

export default function BottomNav({ cfg, view, onTab, lang, side = 'left' }) {
  const tabs = [
    { key: 'home', icon: '⌂', label: t(lang, 'navHome'), group: lang === 'zh' ? '营运' : 'OPERATIONS' },
    { key: 'field', icon: '▤', label: lang === 'zh' ? '送货' : 'Deliveries' },
    { key: 'monthly', icon: '▥', label: lang === 'zh' ? '收入' : 'Money', group: lang === 'zh' ? '财务' : 'FINANCE' },
    { key: 'more', icon: '•••', label: t(lang, 'navMore'), group: lang === 'zh' ? '其他' : 'OTHER' },
  ];
  return (
    <nav
      className={cn('app-nav', side === 'right' ? 'md:right-0 md:left-auto md:border-l' : 'md:left-0 md:right-auto md:border-r')}
      style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }}
    >
      <div className="nav-brand">
        <div className="brand-mark">{cfg.emoji}</div>
        <div>
          <strong>{cfg.productName}</strong>
          <span>{pick(lang, cfg.name)}</span>
        </div>
      </div>
      {tabs.map((tab) => (
        <div key={tab.key} className="contents md:block">
          {tab.group && <div className="nav-group">{tab.group}</div>}
          <button onClick={() => onTab(tab.key)} className={cn('nav-item', view === tab.key && 'active')}>
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
            {view === tab.key && <i />}
          </button>
        </div>
      ))}
      <div className="nav-help">
        <span>?</span>
        <div>
          <strong>{lang === 'zh' ? '需要帮忙？' : 'Need help?'}</strong>
          <small>{lang === 'zh' ? 'WhatsApp 我们' : 'WhatsApp support'}</small>
        </div>
      </div>
    </nav>
  );
}
