import { useMemo, useState } from 'react';
import { fmtMoney } from '../utils.js';
import { pick, t } from '../i18n.js';
import { cn } from '../lib/utils.js';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';

const icons = {
  money: <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM8 9h8M8 15h8M12 8v8" /></svg>,
  route: <svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="2" /><circle cx="18" cy="7" r="2" /><path d="M8 17h3a3 3 0 0 0 3-3v-4a3 3 0 0 1 3-3" /></svg>,
  alert: <svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Zm0 6v5m0 3v.1" /></svg>,
};

const statusMeta = (status, cfg, lang) => {
  if (status === 'pending') return { variant: 'warning', label: t(lang, 'tagPending'), dot: 'bg-warning' };
  if (status === 'active') return { variant: 'success', label: pick(lang, cfg.stageLabels.active), dot: 'bg-success' };
  if (status === 'problem') return { variant: 'destructive', label: t(lang, 'tagProblem'), dot: 'bg-destructive' };
  return { variant: 'muted', label: pick(lang, cfg.stageLabels.done), dot: 'bg-slate-400' };
};

function KpiCard({ icon, value, label, tone, onClick, active }) {
  const long = String(value).length > 7;
  return (
    <button onClick={onClick} className={cn('kpi-card text-left', `kpi-${tone}`, active && 'kpi-selected')}>
      <span className="kpi-icon">{typeof icon === 'string' ? <span className="text-lg leading-none">{icon}</span> : icon}</span>
      <span className={cn('kpi-value', long && '!text-lg md:!text-xl')}>{value}</span>
      <span className="kpi-label">{label}</span>
    </button>
  );
}

function DeliveryRow({ order, cfg, lang, onOpen, onDispatch }) {
  const meta = statusMeta(order.status, cfg, lang);
  const staffLabel = pick(lang, cfg.staffLabel);
  return (
    <article className="delivery-row">
      <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(order.id)}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[.09em] text-muted-foreground">
            {cfg.orderCode} #{order.id.replace(/\D/g, '').padStart(4, '0')}
          </span>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <div className="mt-2 truncate text-sm font-extrabold text-foreground">{order.customer}</div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {order.route && <span>{order.route}</span>}
          <span>{pick(lang, order.content)}</span>
        </div>
      </button>
      <div className="flex flex-none flex-col items-end gap-2">
        <strong className="text-sm">{fmtMoney(order.amount)}</strong>
        {order.status === 'pending' ? (
          <Button size="sm" onClick={() => onDispatch(order.id)}>{t(lang, 'assignShort', staffLabel)}</Button>
        ) : (
          <button className="text-xs font-extrabold text-primary" onClick={() => onOpen(order.id)}>{t(lang, 'viewShort')} →</button>
        )}
      </div>
    </article>
  );
}

export default function HomeScreen({ cfg, onOpen, onDispatch, lang }) {
  const orders = cfg.orders;
  const resourceLabel = pick(lang, cfg.resourceLabel);
  const staffLabel = pick(lang, cfg.staffLabel);
  const orderLabel = pick(lang, cfg.orderLabel);

  const counts = useMemo(() => ({
    active: orders.filter((o) => o.status === 'active').length,
    done: orders.filter((o) => o.status === 'done').length,
    problem: orders.filter((o) => o.status === 'problem').length,
    pending: orders.filter((o) => o.status === 'pending').length,
  }), [orders]);

  const [filter, setFilter] = useState('all');
  const [showAllResources, setShowAllResources] = useState(false);
  const problemOrder = orders.find((o) => o.status === 'problem');
  const resourceCounts = {
    active: cfg.resources.filter((r) => r.status === 'active').length,
    idle: cfg.resources.filter((r) => r.status === 'idle').length,
    problem: cfg.resources.filter((r) => r.status === 'problem').length,
  };
  const rank = { problem: 0, active: 1, idle: 2 };
  const sortedResources = [...cfg.resources].sort((a, b) => rank[a.status] - rank[b.status]);
  const resources = showAllResources ? sortedResources : sortedResources.slice(0, 4);

  const tabs = [
    ['all', t(lang, 'tabAll'), orders.length],
    ['pending', t(lang, 'tagPending'), counts.pending],
    ['active', pick(lang, cfg.stageLabels.active), counts.active],
    ['done', pick(lang, cfg.stageLabels.done), counts.done],
    ['problem', t(lang, 'tagProblem'), counts.problem],
  ];
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="dashboard-shell">
      <section className="dashboard-intro">
        <div>
          <div className="section-eyebrow">{t(lang, 'eyebrowToday')}</div>
          <h1>{t(lang, 'greeting', new Date().getHours())} <span>👋</span></h1>
          <p>{new Intl.DateTimeFormat(lang === 'zh' ? 'zh-MY' : 'en-MY', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p>
        </div>
        <button className="new-delivery" onClick={() => setFilter('pending')}>
          <span>＋</span>{t(lang, 'assignShort', staffLabel)}
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard icon={cfg.emoji} value={orders.length} label={orderLabel} tone="blue" active={filter === 'all'} onClick={() => setFilter('all')} />
        <KpiCard icon={icons.money} value={fmtMoney(orders.reduce((s, o) => s + o.amount, 0))} label={t(lang, 'kpiRevenue')} tone="indigo" />
        <KpiCard icon={icons.route} value={counts.active} label={pick(lang, cfg.stageLabels.active)} tone="green" active={filter === 'active'} onClick={() => setFilter('active')} />
        <KpiCard icon={icons.alert} value={counts.problem} label={t(lang, 'statProblem')} tone="red" active={filter === 'problem'} onClick={() => setFilter('problem')} />
      </section>

      {problemOrder && (
        <section className="attention-panel">
          <div className="attention-heading">
            <div className="attention-symbol">!</div>
            <div>
              <h2>{t(lang, 'attentionTitle')}</h2>
              <p>{t(lang, 'attentionSub')}</p>
            </div>
          </div>
          <button className="attention-item" onClick={() => onOpen(problemOrder.id)}>
            <div className="attention-vehicle">
              <span>{cfg.resources.find((r) => r.id === problemOrder.resourceId)?.code}</span>
              <small>{t(lang, 'tagProblem')}</small>
            </div>
            <div className="attention-copy">
              <strong>{problemOrder.customer}</strong>
              <span>{problemOrder.route || pick(lang, problemOrder.content)}</span>
            </div>
            <div className="attention-action">
              <strong>{fmtMoney(problemOrder.amount)}</strong>
              <span>{t(lang, 'viewIssueBtn')} →</span>
            </div>
          </button>
        </section>
      )}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">{resourceLabel}</div>
            <h2>{t(lang, 'todayResourceTitle', resourceLabel)}</h2>
            <p>{t(lang, 'resourceSummary', pick(lang, cfg.stageLabels.active), resourceCounts.active, resourceCounts.idle, resourceCounts.problem)}</p>
          </div>
          <button onClick={() => setShowAllResources((v) => !v)}>
            {showAllResources ? t(lang, 'collapseShort') : t(lang, 'viewAllShort')} →
          </button>
        </div>
        <div className="fleet-grid">
          {resources.map((r) => {
            const meta = statusMeta(r.status, cfg, lang);
            const job = orders.find((o) => o.resourceId === r.id && ['active', 'problem'].includes(o.status));
            return (
              <article className="fleet-card" key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="fleet-truck-icon"><span className="text-lg leading-none">{cfg.emoji}</span></div>
                  <Badge variant={meta.variant}><span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', meta.dot)} />{meta.label}</Badge>
                </div>
                <h3>{r.code}</h3>
                <p>{staffLabel} · {r.staff}</p>
                <div className="fleet-route">{job?.route || pick(lang, job?.content) || t(lang, 'unassignedJob')}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section deliveries-section">
        <div className="section-heading">
          <div>
            <div className="section-eyebrow">{orderLabel}</div>
            <h2>{t(lang, 'allOrders', orderLabel)}</h2>
            <p>{t(lang, 'ordersSummary', orders.length, orderLabel, counts.pending, t(lang, 'tagPending'))}</p>
          </div>
        </div>
        <div className="delivery-tabs">
          {tabs.map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)} className={cn(filter === key && 'active')}>
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="delivery-list">
          {filtered.map((o) => <DeliveryRow key={o.id} order={o} cfg={cfg} lang={lang} onOpen={onOpen} onDispatch={onDispatch} />)}
        </div>
      </section>
    </div>
  );
}
