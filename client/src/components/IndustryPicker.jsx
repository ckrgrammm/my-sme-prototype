import { useState } from 'react';
import { pick, t } from '../i18n.js';
import { cn } from '../lib/utils.js';
import Button from './ui/Button.jsx';

export default function IndustryPicker({ industries, onChoose, lang, onToggleLang }) {
  const [selected, setSelected] = useState(null);

  const confirm = () => {
    if (selected) onChoose(selected);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-8" style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}>
      <div className="flex min-h-9 items-center justify-end py-4">
        <button
          className="min-h-9 rounded-lg border border-border bg-card px-3.5 text-[13px] font-extrabold text-foreground"
          onClick={onToggleLang}
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
        <div className="mb-7 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-foreground">{t(lang, 'pickerTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t(lang, 'pickerSub')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {industries.map((c) => {
            const on = c.key === selected;
            const isOrphan = industries.length % 2 === 1 && industries[industries.length - 1].key === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelected(c.key)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 pb-4.5 pt-5.5 shadow-card transition-colors',
                  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  on ? 'border-primary bg-primary/5' : 'border-border bg-card',
                  isOrphan && 'col-span-2 flex-row justify-center gap-4 py-4'
                )}
              >
                <span
                  className={cn(
                    'absolute right-3 top-3 h-[18px] w-[18px] rounded-full border-2',
                    on ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_hsl(var(--card))]' : 'border-border bg-transparent'
                  )}
                />
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-2xl', isOrphan && 'mb-0')}>
                  {c.emoji}
                </div>
                <div>
                  <div className="text-[15px] font-extrabold text-foreground">{pick(lang, c.name)}</div>
                  <div className="mt-0.5 text-center text-[11.5px] text-muted-foreground">{c.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl pt-2">
        <Button size="lg" className="w-full" disabled={!selected} onClick={confirm}>
          {t(lang, 'nextStep')} →
        </Button>
        <div className="mt-4 text-center text-xs text-muted-foreground">{t(lang, 'pickerFooter')}</div>
      </div>
    </div>
  );
}
