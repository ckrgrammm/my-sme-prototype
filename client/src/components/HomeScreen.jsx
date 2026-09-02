import { useMemo, useState } from 'react';
import { fmtMoney, fmtMoneyShort } from '../utils.js';
import { pick } from '../i18n.js';
import Badge from './ui/Badge.jsx';

const words = {
  en: { eyebrow:'TODAY OVERVIEW', title:'Here is how the business is moving today.', sub:'A live summary across operations, automation and money.', live:'Live', jobs:'Jobs today', completion:'Completion rate', value:'Job value', attention:'Need attention', inbox:'Needs attention', inboxSub:'Only items that require a decision or follow-up.', progress:"Today's progress", health:'Operations health', healthSub:'Current workload and available capacity.', money:'Money today', automation:'Automation impact', active:'Active', pending:'Awaiting assignment', done:'Completed', issue:'With issue', inUse:'in use', available:'available', unavailable:'unavailable', total:'Total job value', collected:'Collected', outstanding:'Outstanding', running:'automations running', saved:'estimated hours saved', messages:'customer updates prepared', openAutomation:'Open Automation', openDeliveries:'View Deliveries', openMoney:'Open Money', investigate:'Investigate', assign:'unassigned jobs require planning', overdue:'outstanding payments require follow-up', clear:'No operational exceptions need attention.', recent:'Important activity' },
  zh: { eyebrow:'今日总览', title:'今天的生意运行情况，一眼掌握。', sub:'营运、自动化与收款的实时摘要。', live:'实时', jobs:'今日工作', completion:'完成率', value:'工作总值', attention:'需要处理', inbox:'需要处理', inboxSub:'这里只显示需要决定或跟进的事项。', progress:'今日进度', health:'营运健康度', healthSub:'当前工作量与可用资源。', money:'今日资金', automation:'自动化成效', active:'进行中', pending:'等待分派', done:'已完成', issue:'有问题', inUse:'使用中', available:'可用', unavailable:'不可用', total:'工作总值', collected:'已收款', outstanding:'待收款', running:'项自动化运行中', saved:'预估节省工时', messages:'则客户通知已准备', openAutomation:'打开自动化', openDeliveries:'查看工作', openMoney:'查看资金', investigate:'查看问题', assign:'项未分派工作需要规划', overdue:'未收款项需要跟进', clear:'目前没有需要处理的营运例外。', recent:'重要动态' },
};

const densityWords = {
  en: { label: 'View density', full: 'Comprehensive', focused: 'Focused' },
  zh: { label: '显示模式', full: '完整', focused: '精简' },
};

function SummaryCard({ icon, value, label, detail, tone='blue', onClick }) {
  const tones = { blue:'bg-blue-50 text-blue-700 border-blue-100', green:'bg-green-50 text-green-700 border-green-100', indigo:'bg-indigo-50 text-indigo-700 border-indigo-100', red:'bg-red-50 text-red-700 border-red-100' };
  return <button onClick={onClick} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tones[tone]}`}><div className="flex items-start justify-between gap-3"><span className="text-lg">{icon}</span><strong className="text-2xl font-black tracking-tight">{value}</strong></div><span className="mt-4 block text-xs font-extrabold">{label}</span><span className="mt-1 block text-[10px] font-semibold opacity-70">{detail}</span></button>;
}

function MetricRow({ label, value, total, tone='bg-primary' }) {
  const width = total ? Math.max(value ? 4 : 0, Math.round(value / total * 100)) : 0;
  return <div><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-muted-foreground">{label}</span><strong>{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{width:`${width}%`}} /></div></div>;
}

export default function HomeScreen({ cfg, onOpen, onNavigate, lang }) {
  const w = words[lang];
  const density = densityWords[lang];
  const [mode, setMode] = useState(() => localStorage.getItem('sme_today_density') || 'full');
  const changeMode = (next) => {
    localStorage.setItem('sme_today_density', next);
    setMode(next);
  };
  const orders = cfg.orders;
  const counts = useMemo(() => ({ active:orders.filter(o=>o.status==='active').length, done:orders.filter(o=>o.status==='done').length, problem:orders.filter(o=>o.status==='problem').length, pending:orders.filter(o=>o.status==='pending').length }), [orders]);
  const resources = { active:cfg.resources.filter(r=>r.status==='active').length, idle:cfg.resources.filter(r=>r.status==='idle').length, problem:cfg.resources.filter(r=>r.status==='problem').length };
  const total = orders.reduce((sum,o)=>sum+o.amount,0);
  const collected = orders.filter(o=>o.status==='done'&&o.paid).reduce((sum,o)=>sum+o.amount,0);
  const completion = Math.round(counts.done / Math.max(orders.length,1) * 100);
  const attention = counts.problem + (counts.pending?1:0) + (cfg.unpaid?1:0);
  const problems = orders.filter(o=>o.status==='problem').slice(0,2);
  const date = new Intl.DateTimeFormat(lang==='zh'?'zh-MY':'en-MY',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  const activities = lang==='zh' ? [`${counts.done} 项工作已完成，签收与开票状态已更新`,`${counts.active} 项工作进行中，系统持续监控`,`${cfg.automations.length} 项自动化正常运行`] : [`${counts.done} jobs completed · POD and billing checks updated`,`${counts.active} jobs active · live monitoring in progress`,`${cfg.automations.length} automations running normally`];

  return <div className="dashboard-shell">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="section-eyebrow">{w.eyebrow}</div><h1 className="mt-1 max-w-3xl text-[26px] font-extrabold tracking-[-.035em] md:text-[32px]">{w.title}</h1><p className="mt-2 text-sm text-muted-foreground">{w.sub}</p></div><div className="space-y-2 sm:text-right"><div className="flex items-center gap-2 text-xs font-bold text-muted-foreground sm:justify-end"><span className="h-2 w-2 animate-pulse rounded-full bg-success" />{w.live} · {date}</div><div className="inline-flex items-center rounded-xl border bg-white p-1" aria-label={density.label}><span className="hidden px-2 text-[10px] font-bold text-muted-foreground md:inline">{density.label}</span>{[['full',density.full],['focused',density.focused]].map(([key,label])=><button key={key} onClick={()=>changeMode(key)} className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${mode===key?'bg-slate-900 text-white':'text-muted-foreground hover:bg-muted'}`}>{label}</button>)}</div></div></section>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><SummaryCard icon={cfg.emoji} value={orders.length} label={w.jobs} detail={`${counts.active} ${w.active.toLowerCase()}`} onClick={()=>onNavigate('field')} /><SummaryCard icon="✓" value={`${completion}%`} label={w.completion} detail={`${counts.done} / ${orders.length}`} tone="green" onClick={()=>onNavigate('field')} /><SummaryCard icon="RM" value={fmtMoneyShort(total)} label={w.value} detail={pick(lang,cfg.orderLabel)} tone="indigo" onClick={()=>onNavigate('monthly')} /><SummaryCard icon="!" value={attention} label={w.attention} detail={`${counts.problem} ${w.issue.toLowerCase()}`} tone="red" onClick={()=>onNavigate('workflow')} /></section>

    {mode === 'full' ? <>
    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div><div className="section-eyebrow !text-amber-700">ACTION FIRST</div><h2 className="mt-1 text-lg font-extrabold">{w.inbox}</h2><p className="mt-1 text-xs text-muted-foreground">{w.inboxSub}</p></div><Badge variant={attention?'warning':'success'}>{attention}</Badge></div><div className="mt-4 space-y-2">
        {problems.map(order=><button key={order.id} onClick={()=>onOpen(order.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-red-100 bg-white p-3.5 text-left"><div className="min-w-0"><strong className="block truncate text-sm">{order.customer}</strong><span className="mt-1 block truncate text-xs text-red-700">{pick(lang,order.problemNote)}</span></div><span className="flex-none text-xs font-extrabold text-primary">{w.investigate} →</span></button>)}
        {counts.pending>0&&<button onClick={()=>onNavigate('workflow')} className="flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-3.5 text-left"><span className="text-sm font-semibold">{counts.pending} {w.assign}</span><span className="flex-none text-xs font-extrabold text-primary">{w.openAutomation} →</span></button>}
        {cfg.unpaid>0&&<button onClick={()=>onNavigate('monthly')} className="flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-3.5 text-left"><span className="text-sm font-semibold">{fmtMoney(cfg.unpaid)} · {w.overdue}</span><span className="flex-none text-xs font-extrabold text-primary">{w.openMoney} →</span></button>}
        {!attention&&<p className="rounded-xl bg-white p-4 text-sm font-semibold text-green-700">✓ {w.clear}</p>}
      </div></div>
      <div className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">OPERATIONS</div><h2 className="mt-1 text-lg font-extrabold">{w.progress}</h2><div className="mt-5 space-y-4"><MetricRow label={w.active} value={counts.active} total={orders.length} tone="bg-green-500"/><MetricRow label={w.pending} value={counts.pending} total={orders.length} tone="bg-amber-500"/><MetricRow label={w.done} value={counts.done} total={orders.length}/><MetricRow label={w.issue} value={counts.problem} total={orders.length} tone="bg-red-500"/></div><button onClick={()=>onNavigate('field')} className="mt-5 text-xs font-extrabold text-primary">{w.openDeliveries} →</button></div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">CAPACITY</div><h2 className="mt-1 text-lg font-extrabold">{w.health}</h2><p className="mt-1 text-xs text-muted-foreground">{w.healthSub}</p><div className="mt-5 grid grid-cols-3 gap-2 text-center">{[[resources.active,w.inUse,'text-blue-700 bg-blue-50'],[resources.idle,w.available,'text-green-700 bg-green-50'],[resources.problem,w.unavailable,'text-red-700 bg-red-50']].map(([v,l,t])=><div key={l} className={`rounded-xl p-3 ${t}`}><strong className="block text-xl">{v}</strong><span className="mt-1 block text-[9px] font-bold">{l}</span></div>)}</div></div>
      <div className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">FINANCE</div><h2 className="mt-1 text-lg font-extrabold">{w.money}</h2><div className="mt-5 space-y-3 text-xs">{[[w.total,total],[w.collected,collected],[w.outstanding,cfg.unpaid]].map(([l,v])=><div key={l} className="flex justify-between border-b pb-3 last:border-0"><span className="font-semibold text-muted-foreground">{l}</span><strong>{fmtMoney(v)}</strong></div>)}</div><button onClick={()=>onNavigate('monthly')} className="mt-3 text-xs font-extrabold text-primary">{w.openMoney} →</button></div>
      <div className="rounded-2xl bg-slate-900 p-4 text-white md:p-5"><div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300">AUTOMATION</div><h2 className="mt-1 text-lg font-extrabold">{w.automation}</h2><strong className="mt-5 block text-3xl">{cfg.automations.length}</strong><span className="text-xs text-slate-300">{w.running}</span><div className="my-4 h-px bg-white/10"/><p className="text-xs text-slate-300">6.4h {w.saved} · {orders.length*2} {w.messages}</p><button onClick={()=>onNavigate('workflow')} className="mt-5 text-xs font-extrabold text-blue-300">{w.openAutomation} →</button></div>
    </section>

    <section className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">LIVE SUMMARY</div><h2 className="mt-1 text-lg font-extrabold">{w.recent}</h2><div className="mt-4 divide-y">{activities.map((event,i)=><div key={event} className="flex items-center gap-3 py-3 text-xs"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500">{i+1}</span><span className="font-semibold">{event}</span></div>)}</div></section>
    </> : <>
      <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div><div className="section-eyebrow !text-amber-700">ACTION FIRST</div><h2 className="mt-1 text-lg font-extrabold">{w.inbox}</h2><p className="mt-1 text-xs text-muted-foreground">{w.inboxSub}</p></div><Badge variant={attention?'warning':'success'}>{attention}</Badge></div><div className="mt-4 grid gap-2 lg:grid-cols-3">
        {problems.slice(0,1).map(order=><button key={order.id} onClick={()=>onOpen(order.id)} className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-white p-3.5 text-left"><div className="min-w-0"><strong className="block truncate text-sm">{order.customer}</strong><span className="mt-1 block truncate text-xs text-red-700">{pick(lang,order.problemNote)}</span></div><span className="flex-none text-xs font-extrabold text-primary">{w.investigate} →</span></button>)}
        {counts.pending>0&&<button onClick={()=>onNavigate('workflow')} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3.5 text-left"><span className="text-sm font-semibold">{counts.pending} {w.assign}</span><span className="flex-none text-xs font-extrabold text-primary">→</span></button>}
        {cfg.unpaid>0&&<button onClick={()=>onNavigate('monthly')} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3.5 text-left"><span className="text-sm font-semibold">{fmtMoney(cfg.unpaid)} · {w.overdue}</span><span className="flex-none text-xs font-extrabold text-primary">→</span></button>}
      </div></section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">OPERATIONS</div><h2 className="mt-1 text-lg font-extrabold">{w.health}</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{[[counts.active,w.active,'text-green-700 bg-green-50'],[counts.pending,w.pending,'text-amber-700 bg-amber-50'],[counts.done,w.done,'text-blue-700 bg-blue-50'],[resources.active,w.inUse,'text-indigo-700 bg-indigo-50'],[resources.idle,w.available,'text-green-700 bg-green-50'],[resources.problem,w.unavailable,'text-red-700 bg-red-50']].map(([value,label,tone])=><div key={label} className={`rounded-xl p-3 ${tone}`}><strong className="block text-xl">{value}</strong><span className="mt-1 block text-[10px] font-bold">{label}</span></div>)}</div><button onClick={()=>onNavigate('field')} className="mt-5 text-xs font-extrabold text-primary">{w.openDeliveries} →</button></div>
        <div className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">FINANCE</div><h2 className="mt-1 text-lg font-extrabold">{w.money}</h2><div className="mt-5 space-y-4">{[[w.total,total],[w.collected,collected],[w.outstanding,cfg.unpaid]].map(([label,value])=><div key={label} className="flex items-center justify-between border-b pb-4 last:border-0"><span className="text-sm font-semibold text-muted-foreground">{label}</span><strong className="text-base">{fmtMoney(value)}</strong></div>)}</div><button onClick={()=>onNavigate('monthly')} className="mt-3 text-xs font-extrabold text-primary">{w.openMoney} →</button></div>
      </section>
    </>}
  </div>;
}
