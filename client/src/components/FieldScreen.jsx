import { pick, t } from '../i18n.js';
import { cn } from '../lib/utils.js';
import Card from './ui/Card.jsx';

export default function FieldScreen({ cfg, onAdvance, lang }) {
  const staffName = cfg.resources.find((r) => r.status !== 'idle')?.staff || cfg.resources[0].staff;
  const LABELS = [t(lang, 'stepStart'), t(lang, 'stepComplete'), t(lang, 'stepPhoto'), t(lang, 'stepDone')];

  const btnClass = {
    0: 'bg-primary text-primary-foreground',
    1: 'bg-secondary text-secondary-foreground',
    2: 'bg-warning text-warning-foreground',
    3: 'bg-success/15 text-success',
  };

  return (
    <>
      <div className="mt-1 rounded-[36px] border border-border bg-[#0e0e14] p-3 shadow-popover md:mx-auto md:max-w-[380px]">
        <div className="min-h-[520px] overflow-hidden rounded-3xl bg-background">
          <div className="bg-secondary px-4 pb-3.5 pt-4 text-center text-secondary-foreground">
            <div className="text-[15px] font-extrabold">{t(lang, 'fieldPhoneOf', pick(lang, cfg.fieldRole), staffName)}</div>
            <div className="mt-0.5 text-[11px] text-white/60">{t(lang, 'fieldTaskCount', cfg.fieldTasks.length)}</div>
          </div>
          <div className="p-3.5">
            {cfg.fieldTasks.map((task) => {
              const btnLabel = task.step < 3 ? LABELS[task.step] : LABELS[3];
              return (
                <Card key={task.id} className="mb-3 p-3.5">
                  <div className="text-[15px] font-extrabold text-foreground">{task.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{pick(lang, task.loc)}</div>
                  <div className="my-2.5 flex gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className={cn('h-1.5 flex-1 rounded-full', task.step >= n ? 'bg-success' : 'bg-muted')} />
                    ))}
                  </div>
                  <button
                    className={cn('min-h-[52px] w-full rounded-xl text-[15px] font-extrabold disabled:opacity-100', btnClass[task.step])}
                    disabled={task.step >= 3}
                    onClick={() => onAdvance(task.id)}
                  >
                    {btnLabel}
                  </button>
                  {task.step >= 3 && (
                    <div className="mt-2.5 flex gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xl">📷</div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xl">📷</div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3.5 rounded-xl bg-secondary px-3.5 py-3 text-center text-xs text-secondary-foreground">
        {t(lang, 'fieldCallout')}
      </div>
    </>
  );
}
