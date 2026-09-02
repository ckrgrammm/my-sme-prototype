import { fmtMoney } from '../utils.js';
import { pick, t } from '../i18n.js';
import Card from './ui/Card.jsx';

export default function MonthlyScreen({ cfg, lang }) {
  const rows = cfg.monthly;
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const maxRevenue = Math.max(...rows.map((r) => r.revenue));
  const resourceLabel = pick(lang, cfg.resourceLabel);
  const staffLabel = pick(lang, cfg.staffLabel);

  return (
    <>
      <Card className="mb-4 p-4.5">
        <h4 className="mb-3.5 text-sm font-extrabold text-foreground">{t(lang, 'monthlyChartTitle', resourceLabel)}</h4>
        <div className="flex h-[150px] items-end gap-2">
          {rows.map((r) => {
            const h = Math.max(6, Math.round((r.revenue / maxRevenue) * 130));
            return (
              <div key={r.code} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <div className="mb-1 whitespace-nowrap text-[10px] font-bold text-muted-foreground">{(r.revenue / 1000).toFixed(1)}k</div>
                <div className="w-full rounded-t-md bg-primary" style={{ height: h + 'px' }} />
                <div className="mt-1.5 w-full truncate text-center text-[9px] text-muted-foreground">{r.code}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="relative mb-1 overflow-x-auto rounded-2xl border border-border bg-card shadow-card md:overflow-visible">
        <table className="w-full min-w-[440px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-secondary px-1.5 py-2.5 text-left text-[11px] font-semibold text-secondary-foreground first:rounded-tl-2xl last:rounded-tr-2xl">{resourceLabel}</th>
              <th className="bg-secondary px-1.5 py-2.5 text-left text-[11px] font-semibold text-secondary-foreground">{t(lang, 'thCount')}</th>
              <th className="bg-secondary px-1.5 py-2.5 text-left text-[11px] font-semibold text-secondary-foreground">{t(lang, 'thRevenue')}</th>
              <th className="bg-secondary px-1.5 py-2.5 text-left text-[11px] font-semibold text-secondary-foreground">{t(lang, 'thCost')}</th>
              <th className="bg-secondary px-1.5 py-2.5 text-left text-[11px] font-semibold text-secondary-foreground">{t(lang, 'thNet')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-border last:border-0">
                <td className="px-1.5 py-2 text-foreground">{r.code}<br /><span className="text-[11px] text-muted-foreground">{staffLabel} {r.staff}</span></td>
                <td className="px-1.5 py-2 text-right font-bold text-foreground">{r.count}</td>
                <td className="px-1.5 py-2 text-right font-bold text-foreground">{fmtMoney(r.revenue)}</td>
                <td className="px-1.5 py-2 text-right font-bold text-foreground">{fmtMoney(r.cost)}</td>
                <td className="px-1.5 py-2 text-right font-bold text-foreground">{fmtMoney(r.revenue - r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-4 mr-0.5 text-right text-[11px] text-muted-foreground md:hidden">{t(lang, 'tableHint')}</div>

      <Card className="bg-secondary p-4.5 text-secondary-foreground">
        <div className="flex items-center justify-between border-b border-white/10 py-2">
          <div className="text-[13px] text-white/60">{t(lang, 'totalRevenue')}</div>
          <div className="text-lg font-extrabold">{fmtMoney(totalRevenue)}</div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="text-[13px] text-white/60">{t(lang, 'totalUnpaid')}</div>
          <div className="text-lg font-extrabold text-[#FF8A80]">{fmtMoney(cfg.unpaid)}</div>
        </div>
      </Card>
    </>
  );
}
