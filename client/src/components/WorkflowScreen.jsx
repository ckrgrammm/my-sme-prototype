import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { fmtMoney } from '../utils.js';
import { pick } from '../i18n.js';
import Button from './ui/Button.jsx';
import Badge from './ui/Badge.jsx';
import WhatsAppTester from './WhatsAppTester.jsx';

const copy = {
  en: {
    eyebrow: 'AUTOMATION CONTROL TOWER', title: 'Work moves itself. You handle exceptions.',
    subtitle: 'From customer request to payment, every routine step is tracked and automated.',
    newRequest: 'Capture request', attention: 'Needs attention', automated: 'Running automatically',
    rate: 'Automation rate', saved: 'Hours saved today', pipeline: 'Live business flow',
    exceptions: 'Exception & approval inbox', activity: 'Automation activity', empty: 'No items at this stage',
    advance: 'Run next step', approve: 'Review & approve', fix: 'Resolve issue', cancel: 'Cancel',
    create: 'Create request', customer: 'Customer/company', phone: 'WhatsApp number', route: 'Delivery destination',
    cargo: 'Order details', amount: 'Estimated amount', source: 'Request source', close: 'Close', allClear: 'Everything is moving normally.',
  },
  zh: {
    eyebrow: '自动化控制台', title: '系统处理日常工作，您只需处理例外。',
    subtitle: '从客户询价到收款，每个步骤自动推进并留下记录。',
    newRequest: '录入客户需求', attention: '需要处理', automated: '自动运行中', rate: '自动化率', saved: '今日节省工时',
    pipeline: '实时业务流程', exceptions: '例外与审批', activity: '自动化记录', empty: '此阶段暂无项目',
    advance: '执行下一步', approve: '审核并批准', fix: '解决问题', cancel: '取消', create: '建立需求',
    customer: '客户／公司', phone: 'WhatsApp 电话', route: '送货地点', cargo: '订单明细', amount: '预估金额',
    source: '需求来源', close: '关闭', allClear: '所有工作均正常推进。',
  },
};

// 这几个阶段的工单是「WhatsApp 对话还没收集完整资料」——职员点通用的
// 「执行下一步」会直接跳到下一阶段，等于跳过了还没问完的问题，把不完整的
// collected 数据当成已确认的报名，这是真实的数据错误，不能让它可点。
const PRE_CONFIRM_STAGES = ['inquiry', 'details_collection', 'options_presented'];
const PAYMENT_CONTROLLED_STAGES = ['slot_reserved', 'payment_pending'];

const stageIcons = {
  request: '💬', quotation: '🧾', confirmed: '✓',
  planning: '◫', assigned: '🚚', pickup: '↗', delivery: '➜',
  picking: '📦', packed: '✔', dispatched: '🚛', delivered: '➜',
  pod: '✍', invoicing: '▤', payment: 'RM', reported: '▥',
  trial: '🎧', scheduled: '📅', active: '🎓', completed: '🏁',
  // 补习中心 WhatsApp 报名对话的专属阶段（OPERATIONS_ASSISTANT.md 第 6 节）
  inquiry: '💬', details_collection: '📝', options_presented: '📋', customer_confirmed: '✅',
  slot_reserved: '🔒', payment_pending: '💳', enrolled: '🎓', class_scheduled: '📅',
  attendance_tracking: '📊', class_completed: '🏁', invoiced: '▤', paid: 'RM',
  cancelled: '×',
};

function RequestForm({ lang, industry, fieldLabels, onClose, onCreated }) {
  const c = copy[lang];
  const routeLabel = fieldLabels?.route ? pick(lang, fieldLabels.route) : c.route;
  const cargoLabel = fieldLabels?.cargo ? pick(lang, fieldLabels.cargo) : c.cargo;
  const [form, setForm] = useState({ customer: '', phone: '', route: '', cargo: '', amount: '', source: 'WhatsApp' });
  const [saving, setSaving] = useState(false);
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const result = await api.createWorkflowRequest(industry, form); onCreated(result.workflow); onClose(); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <form onSubmit={submit} className="w-full max-w-xl rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="mb-5 flex items-start justify-between"><div><div className="section-eyebrow">WHATSAPP → REQUEST</div><h2 className="mt-1 text-xl font-extrabold">{c.newRequest}</h2></div><button type="button" onClick={onClose} className="rounded-lg bg-muted px-3 py-2 text-sm font-bold">×</button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.customer} onChange={set('customer')} placeholder={c.customer} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <input required value={form.phone} onChange={set('phone')} placeholder={c.phone} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <input required value={form.route} onChange={set('route')} placeholder={routeLabel} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2" />
          <input required value={form.cargo} onChange={set('cargo')} placeholder={cargoLabel} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <input type="number" min="0" value={form.amount} onChange={set('amount')} placeholder={c.amount} className="rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={form.source} onChange={set('source')} className="rounded-xl border bg-white px-4 py-3 text-sm sm:col-span-2"><option>WhatsApp</option><option>Phone</option><option>Web form</option><option>Recurring</option></select>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={onClose}>{c.cancel}</Button><Button disabled={saving} size="sm">{c.create}</Button></div>
      </form>
    </div>
  );
}

export default function WorkflowScreen({ lang = 'en', industry, onToast }) {
  const c = copy[lang];
  const [workflow, setWorkflow] = useState(null);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingItem, setTestingItem] = useState(null);
  const [busy, setBusy] = useState(null);
  const refresh = () => api.getWorkflow(industry).then(setWorkflow).catch((error) => onToast(error.message));
  useEffect(() => { refresh(); }, [industry]);
  const exceptions = useMemo(() => workflow?.items.filter((item) => item.needsAttention || item.needsApproval) || [], [workflow]);
  const advance = async (item) => {
    setBusy(item.id);
    try { const result = await api.advanceWorkflow(industry, item.id); setWorkflow(result.workflow); onToast(pick(lang, result.item.automation)); }
    catch (error) { onToast(error.message); }
    finally { setBusy(null); }
  };
  if (!workflow) return <div className="py-16 text-center text-sm text-muted-foreground">{lang === 'zh' ? '自动化流程加载中…' : 'Loading automation workflow…'}</div>;
  return (
    <div className="dashboard-shell">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="section-eyebrow">{c.eyebrow}</div><h1 className="mt-1 max-w-3xl text-[26px] font-extrabold tracking-[-.035em] md:text-[32px]">{c.title}</h1><p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p></div>
        <div className="flex flex-none gap-2">
          {industry === 'tuition' && <Button size="sm" variant="outline" onClick={() => setTesting(true)}>🧪 {lang === 'zh' ? 'WhatsApp 模拟测试' : 'WhatsApp Tester'}</Button>}
          <Button size="sm" onClick={() => setCreating(true)}>＋ {c.newRequest}</Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[[workflow.metrics.attention, c.attention, 'text-red-600 bg-red-50'], [workflow.metrics.automated, c.automated, 'text-green-700 bg-green-50'], [`${workflow.metrics.automationRate}%`, c.rate, 'text-blue-700 bg-blue-50'], [`${workflow.metrics.hoursSaved}h`, c.saved, 'text-indigo-700 bg-indigo-50']].map(([value, label, tone]) => <div key={label} className={`rounded-2xl border p-4 ${tone}`}><strong className="block text-2xl font-black">{value}</strong><span className="mt-1 block text-xs font-bold opacity-80">{label}</span></div>)}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-extrabold uppercase tracking-wider text-amber-700">{c.attention}</div><h2 className="mt-1 text-lg font-extrabold">{c.exceptions}</h2></div><Badge variant={exceptions.length ? 'warning' : 'success'}>{exceptions.length}</Badge></div>
        {exceptions.length ? <div className="grid gap-3 lg:grid-cols-3">{exceptions.map((item) => {
          const isStuckConversation = item.transcript && PRE_CONFIRM_STAGES.includes(item.stage);
          return <article key={item.id} className="rounded-xl border border-amber-200 bg-white p-4"><div className="flex items-center justify-between"><strong className="text-xs text-primary">{item.id}</strong><span className="text-[10px] font-bold text-muted-foreground">{item.age}</span></div><h3 className="mt-2 text-sm font-extrabold">{item.customer}</h3><p className="mt-1 text-xs text-muted-foreground">{pick(lang, item.automation)}</p>
            {isStuckConversation
              ? <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => { setTestingItem(item); setTesting(true); }}>💬 {lang === 'zh' ? '查看 WhatsApp 对话' : 'Open WhatsApp conversation'}</Button>
              : PAYMENT_CONTROLLED_STAGES.includes(item.stage)
                ? <Button className="mt-3 w-full" size="sm" variant="outline" disabled>{lang === 'zh' ? '等待付款处理' : 'Awaiting payment handling'}</Button>
                : <Button className="mt-3 w-full" size="sm" onClick={() => advance(item)} disabled={busy === item.id}>{item.needsApproval ? c.approve : c.fix}</Button>}
          </article>;
        })}</div> : <p className="text-sm text-green-700">{c.allClear}</p>}
      </section>

      <section>
        <div className="mb-4"><div className="section-eyebrow">END-TO-END</div><h2 className="mt-1 text-xl font-extrabold">{c.pipeline}</h2></div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
          {workflow.stages.map((stage, index) => {
            const stageItems = workflow.items.filter((item) => item.stage === stage.key);
            return <div key={stage.key} className="w-[245px] flex-none snap-start"><div className="mb-2 flex items-center gap-2 px-1"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-white">{stageIcons[stage.key]}</span><div><span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{String(index + 1).padStart(2, '0')}</span><strong className="block text-xs">{pick(lang, stage.label)}</strong></div></div><div className="min-h-[190px] space-y-2 rounded-2xl bg-slate-100/80 p-2">{stageItems.length ? stageItems.map((item) => <article key={item.id} className="rounded-xl border bg-white p-3 shadow-sm"><div className="flex items-center justify-between"><span className="text-[10px] font-black text-primary">{item.id}</span><span className="text-[9px] font-bold text-muted-foreground">{item.source}</span></div><h3 className="mt-2 truncate text-xs font-extrabold">{item.customer}</h3><p className="mt-1 truncate text-[10px] text-muted-foreground">{item.route}</p>{item.amount > 0 && <strong className="mt-2 block text-xs">{fmtMoney(item.amount)}</strong>}<div className={`mt-2 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${item.needsAttention || item.needsApproval ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-700'}`}>{pick(lang, item.automation)}</div>{stage.key !== 'reported' && !PRE_CONFIRM_STAGES.includes(stage.key) && !PAYMENT_CONTROLLED_STAGES.includes(stage.key) && stage.key !== 'cancelled' && <button onClick={() => advance(item)} disabled={busy === item.id} className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-[10px] font-extrabold text-white disabled:opacity-40">{c.advance} →</button>}</article>) : <div className="px-2 py-8 text-center text-[10px] text-slate-400">{c.empty}</div>}</div></div>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 md:p-5"><div className="section-eyebrow">LIVE LOG</div><h2 className="mt-1 text-lg font-extrabold">{c.activity}</h2><div className="mt-4 divide-y">{workflow.events.slice(0, 6).map((event) => <div key={event.id} className="flex gap-3 py-3 text-xs"><span className="font-bold text-muted-foreground">{event.time}</span><span className="font-semibold">{pick(lang, event.text)}</span></div>)}</div></section>
      {creating && <RequestForm lang={lang} industry={industry} fieldLabels={workflow.fieldLabels} onClose={() => setCreating(false)} onCreated={setWorkflow} />}
      {testing && <WhatsAppTester lang={lang} industry={industry} initialItem={testingItem} onClose={() => { setTesting(false); setTestingItem(null); }} onItemChanged={refresh} />}
    </div>
  );
}
