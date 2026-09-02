import { fmtMoney } from '../utils.js';
import { pick, t } from '../i18n.js';
import { cn } from '../lib/utils.js';
import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';

export default function DetailScreen({ cfg, orderId, lang }) {
  const o = cfg.orders.find((x) => x.id === orderId);
  if (!o) return <div className="py-4.5 text-center text-sm text-muted-foreground">{t(lang, 'orderNotFound')}</div>;
  const res = o.resourceId ? cfg.resources.find((r) => r.id === o.resourceId) : null;
  const staffLabel = pick(lang, cfg.staffLabel);

  const STEPS = [
    { key: 'received', label: t(lang, 'tlReceived') },
    { key: 'assigned', label: t(lang, 'tlAssigned') },
    { key: 'started', label: t(lang, 'tlStarted') },
    { key: 'completed', label: t(lang, 'tlCompleted') },
    { key: 'signed', label: t(lang, 'tlSigned') },
  ];

  const badgeVariant =
    o.status === 'pending' ? 'warning'
    : o.status === 'active' ? 'success'
    : o.status === 'problem' ? 'destructive'
    : 'muted';
  const badgeText =
    o.status === 'pending' ? t(lang, 'tagPending')
    : o.status === 'active' ? pick(lang, cfg.stageLabels.active)
    : o.status === 'problem' ? t(lang, 'tagProblem')
    : pick(lang, cfg.stageLabels.done);

  const showSign = o.status === 'done';

  return (
    <>
      <Card className="mb-4 p-4.5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg font-extrabold text-foreground">{o.customer}</div>
          <div className="whitespace-nowrap text-lg font-extrabold text-primary">{fmtMoney(o.amount)}</div>
        </div>
        {o.route && <div className="mt-1.5 text-[13px] text-muted-foreground">{o.route}</div>}
        <div className="mt-2.5 rounded-lg bg-muted p-3 text-sm text-foreground">
          {pick(lang, o.content)}
          {res && ` · ${res.code}（${staffLabel} ${res.staff}）`}
        </div>
        <Badge variant={badgeVariant} className="mt-3 px-2.5 py-1 text-xs">{badgeText}</Badge>
        {o.problemNote && (
          <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-[13px] font-semibold text-destructive">
            ⚠ {pick(lang, o.problemNote)}
          </div>
        )}
        {o.status === 'done' && (
          <div className={cn('mt-3 rounded-lg p-3 text-[13px] font-semibold', o.paid ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
            {o.paid ? t(lang, 'paid') : t(lang, 'unpaid')}
          </div>
        )}
      </Card>

      <Card className="mb-4 p-4.5">
        <h4 className="mb-3.5 text-sm font-extrabold text-foreground">{t(lang, 'timelineTitle')}</h4>
        {STEPS.map((s, i) => {
          const on = !!o.timeline[s.key];
          const isLast = i === STEPS.length - 1;
          const nextOn = !isLast && !!o.timeline[STEPS[i + 1].key];
          return (
            <div className="flex gap-3" key={s.key}>
              <div className="flex flex-col items-center">
                <div className={cn('h-3.5 w-3.5 flex-none rounded-full border-2', on ? 'border-success bg-success' : 'border-muted-foreground/40 bg-muted')} />
                {!isLast && <div className={cn('min-h-[22px] w-0.5 flex-1', on && nextOn ? 'bg-success' : 'bg-muted')} />}
              </div>
              <div className="flex-1 pb-4.5">
                <div className={cn('text-sm font-bold', on ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{o.timeline[s.key] || t(lang, 'notYet')}</div>
              </div>
            </div>
          );
        })}
      </Card>

      {showSign && (
        <Card className="mb-2.5 p-4.5">
          <h4 className="mb-3 text-sm font-extrabold text-foreground">{t(lang, 'signTitle')}</h4>
          <div className="flex gap-3">
            <div className="flex h-[76px] flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted font-serif text-2xl italic text-muted-foreground">✍️</div>
            <div className="flex h-[76px] w-[76px] flex-none items-center justify-center rounded-lg bg-muted text-2xl">📷</div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">{t(lang, 'signMeta', o.timeline.signed || '', res ? res.staff : '—')}</div>
          <div className="mt-2.5 border-t border-dashed border-border pt-2.5 text-xs text-muted-foreground">
            {t(lang, 'compareBefore')}<b className="text-destructive">{t(lang, 'compareBold')}</b>{t(lang, 'compareAfter')}
          </div>
        </Card>
      )}
    </>
  );
}
