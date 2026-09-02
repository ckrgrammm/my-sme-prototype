import { fmtMoney } from '../utils.js';
import { pick, t } from '../i18n.js';
import { cn } from '../lib/utils.js';
import { Dialog, DialogClose } from './ui/Dialog.jsx';
import Button from './ui/Button.jsx';

const REST_THRESHOLD = 8; // 小时；低于此视为休息不足，标黄提醒，不列入推荐首选

function rankBySafetyAndSkill(idle) {
  return [...idle].sort((a, b) => {
    const aOk = a.restHours >= REST_THRESHOLD ? 1 : 0;
    const bOk = b.restHours >= REST_THRESHOLD ? 1 : 0;
    if (aOk !== bOk) return bOk - aOk;
    if (b.skillLevel !== a.skillLevel) return b.skillLevel - a.skillLevel;
    return b.restHours - a.restHours;
  });
}

function RestBadge({ r, lang }) {
  const ok = r.restHours >= REST_THRESHOLD;
  return (
    <span className={cn('mt-1.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold', ok ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>
      {ok ? t(lang, 'restOk', r.restHours) : t(lang, 'restWarn', r.restHours)}
    </span>
  );
}

export function DispatchModal({ cfg, orderId, onAssign, onClose, lang }) {
  const order = cfg.orders.find((o) => o.id === orderId);
  const idle = cfg.resources.filter((r) => r.status === 'idle');
  const ranked = rankBySafetyAndSkill(idle);
  const top = ranked[0];
  const orderLabel = pick(lang, cfg.orderLabel);
  const staffLabel = pick(lang, cfg.staffLabel);
  const resourceLabel = pick(lang, cfg.resourceLabel);

  return (
    <Dialog open onClose={onClose}>
      <DialogClose onClose={onClose} />
      <h3 className="mb-1 text-[17px] font-extrabold text-foreground">{t(lang, 'dispatchModalTitle', orderLabel)}</h3>
      <div className="mb-3.5 text-[13px] text-muted-foreground">{order ? `${order.customer} · ${fmtMoney(order.amount)}` : ''}</div>

      {top && (
        <div className="mb-1.5 rounded-xl bg-muted p-3.5">
          <Button className="h-auto w-full whitespace-normal py-3 text-center leading-snug" onClick={() => onAssign(top.id)}>
            {t(lang, 'autoAssignBtn', top.code, top.staff)}
          </Button>
          <div className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{t(lang, 'smartAssignNote')}</div>
        </div>
      )}

      {ranked.length > 0 && <div className="mb-2 mt-4 text-xs font-bold text-muted-foreground">{t(lang, 'orManual')}</div>}
      {ranked.length ? ranked.map((r) => (
        <div key={r.id} className={cn('mb-2 flex items-center justify-between gap-2 rounded-xl border-2 bg-card p-3.5', r.id === top.id ? 'border-primary bg-primary/5' : 'border-transparent')}>
          <div>
            <div className="text-sm font-extrabold text-foreground">
              {r.code}
              {r.id === top.id && <span className="ml-2 text-[10px] font-extrabold text-primary">★ {t(lang, 'recommendedTag')}</span>}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{staffLabel} {r.staff} · {pick(lang, r.skill)}</div>
            <RestBadge r={r} lang={lang} />
          </div>
          <Button variant="outline" size="sm" onClick={() => onAssign(r.id)}>{t(lang, 'dispatchSelect')}</Button>
        </div>
      )) : <div className="py-4.5 text-center text-sm text-muted-foreground">{t(lang, 'noIdle', resourceLabel)}</div>}
    </Dialog>
  );
}

export function SwitcherModal({ industries, current, onChoose, onReset, onClose, lang }) {
  return (
    <Dialog open onClose={onClose}>
      <DialogClose onClose={onClose} />
      <h3 className="mb-1 text-[17px] font-extrabold text-foreground">{t(lang, 'switcherTitle')}</h3>
      <div className="mb-3.5 text-[13px] text-muted-foreground">{t(lang, 'switcherSub')}</div>
      {industries.map((c) => {
        const on = c.key === current;
        return (
          <div key={c.key} className={cn('mb-2 flex items-center justify-between gap-2 rounded-xl border-2 bg-card p-3.5', on ? 'border-primary' : 'border-transparent')}>
            <div>
              <div className="text-sm font-extrabold text-foreground">{c.emoji} {pick(lang, c.name)}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{c.tagline}</div>
            </div>
            {on ? (
              <span className="text-sm font-extrabold text-primary">{t(lang, 'switcherCurrent')}</span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onChoose(c.key)}>{t(lang, 'switcherSwitch')}</Button>
            )}
          </div>
        );
      })}
      <Button variant="outline" className="mt-2.5 w-full" onClick={onReset}>{t(lang, 'switcherReset')}</Button>
    </Dialog>
  );
}
