import { t } from '../i18n.js';
import { pick } from '../i18n.js';
import { cn } from '../lib/utils.js';

export default function BottomNav({ cfg, branding = {}, view, onTab, lang, side = 'left' }) {
  const tabs = [
    { key: 'home', icon: '⌂', label: t(lang, 'navHome'), group: lang === 'zh' ? '营运' : 'OPERATIONS' },
    { key: 'workflow', icon: '⚡', label: lang === 'zh' ? '自动化' : 'Automation' },
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
        <div className="brand-mark">{branding.logo ? <img src={branding.logo} alt="" className="h-full w-full rounded-xl object-cover" /> : cfg.emoji}</div>
        <div>
          <strong>{branding.name || cfg.productName}</strong>
          <span>{branding.subtitle || pick(lang, cfg.name)}</span>
        </div>
      </div>
      {tabs.map((tab) => (
        <div key={tab.key} className="contents md:block">
          {tab.group && <div className="nav-group">{tab.group}</div>}
          <button
            onClick={() => onTab(tab.key)}
            className={cn('nav-item', view === tab.key && 'active')}
            aria-current={view === tab.key ? 'page' : undefined}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
            {view === tab.key && <i />}
          </button>
        </div>
      ))}
      <button className="nav-help text-left" aria-label={lang === 'zh' ? '通过 WhatsApp 获取帮助' : 'Get help on WhatsApp'} onClick={() => {
        const phone = (branding.whatsapp || '').replace(/[^0-9]/g, '');
        if (phone) window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
        else onTab('more');
      }}>
        <span>?</span>
        <div>
          <strong>{lang === 'zh' ? '需要帮忙？' : 'Need help?'}</strong>
          <small>{lang === 'zh' ? 'WhatsApp 我们' : 'WhatsApp support'}</small>
        </div>
      </button>
    </nav>
  );
}
