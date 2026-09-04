import { bi, genTimeline } from './shared.js';

export const config = {
  key: 'workshop', name: bi('汽修厂', 'Auto Workshop'), emoji: '🔧',
  tagline: 'Workshop Job Tracker',
  productName: 'BayOps', orderCode: 'WO',
  resourceLabel: bi('维修位', 'Bay'), staffLabel: bi('师傅', 'Mechanic'), orderLabel: bi('维修工单', 'Repair Job Order'),
  stageLabels: { pending: bi('待接车', 'Awaiting Drop-off'), active: bi('维修中', 'In Repair'), done: bi('待取车', 'Ready for Pickup') },
  fieldRole: bi('师傅', 'Mechanic'),
  resources: [
    { id: 'WB1', code: 'Bay 1', staff: 'Ah Seng', status: 'active', skill: bi('刹车 / 悬挂专长', 'Brakes & suspension specialist'), skillLevel: 4, restHours: 2 },
    { id: 'WB2', code: 'Bay 2', staff: 'Muthu', status: 'active', skill: bi('冷气专长', 'AC specialist'), skillLevel: 3, restHours: 3 },
    { id: 'WB3', code: 'Bay 3', staff: 'Azman', status: 'idle', skill: bi('一般保养', 'General servicing'), skillLevel: 2, restHours: 9 },
    { id: 'WB4', code: 'Bay 4', staff: 'Lim', status: 'problem', skill: bi('冷气专长', 'AC specialist'), skillLevel: 4, restHours: 1 },
    { id: 'WB5', code: 'Bay 5', staff: 'Rajesh', status: 'active', skill: bi('引擎专长', 'Engine specialist'), skillLevel: 3, restHours: 2 },
    { id: 'WB6', code: 'Bay 6', staff: 'Faizal', status: 'idle', skill: bi('变速箱专长', 'Transmission specialist'), skillLevel: 5, restHours: 12 },
    { id: 'WB7', code: 'Bay 7', staff: 'Tan', status: 'active', skill: bi('一般保养', 'General servicing'), skillLevel: 3, restHours: 4 },
    { id: 'WB8', code: 'Bay 8', staff: 'Kumar', status: 'idle', skill: bi('引擎专长', 'Engine specialist'), skillLevel: 2, restHours: 5 },
  ],
  orders: [
    { id: 'W01', customer: 'Ahmad · Myvi JBX 1123', route: '', content: bi('冷气不冷检查', 'AC not cooling — inspection'), amount: 180, status: 'problem', resourceId: 'WB4', problemNote: bi('拆开发现冷气压缩机损坏，等零件到货，预计延迟一天', 'Compressor found damaged after inspection, waiting on parts, ~1 day delay'), timeline: genTimeline('problem', 9, 0) },
    { id: 'W02', customer: 'Siti · Axia JBU 4456', route: '', content: bi('换机油', 'Oil change'), amount: 90, status: 'pending', timeline: genTimeline('pending', 9, 30) },
    { id: 'W03', customer: 'Tan · Hilux JBV 7789', route: '', content: bi('刹车片更换', 'Brake pad replacement'), amount: 320, status: 'active', resourceId: 'WB1', timeline: genTimeline('active', 8, 40) },
    { id: 'W04', customer: 'Kumar · Alza JBW 2234', route: '', content: bi('冷气服务', 'AC service'), amount: 250, status: 'active', resourceId: 'WB2', timeline: genTimeline('active', 9, 10) },
    { id: 'W05', customer: 'Faizal · Myvi JBX 5567', route: '', content: bi('换机油 + 四轮定位', 'Oil change + wheel alignment'), amount: 180, status: 'active', resourceId: 'WB5', timeline: genTimeline('active', 9, 50) },
    { id: 'W06', customer: 'Wong · Axia JBU 8890', route: '', content: bi('刹车片 + 机油', 'Brake pads + oil change'), amount: 260, status: 'active', resourceId: 'WB7', timeline: genTimeline('active', 10, 20) },
    { id: 'W07', customer: 'Rajesh · Hilux JBV 1111', route: '', content: bi('换机油', 'Oil change'), amount: 120, status: 'done', paid: true, resourceId: 'WB3', timeline: genTimeline('done', 7, 30) },
    { id: 'W08', customer: 'Lim · Alza JBW 2222', route: '', content: bi('刹车片更换', 'Brake pad replacement'), amount: 300, status: 'done', paid: true, resourceId: 'WB6', timeline: genTimeline('done', 7, 50) },
    { id: 'W09', customer: 'Muthu 车队 · Myvi x1', route: '', content: bi('冷气服务', 'AC service'), amount: 280, status: 'done', paid: false, resourceId: 'WB8', timeline: genTimeline('done', 8, 0) },
    { id: 'W10', customer: 'Azman · Axia JBU 3333', route: '', content: bi('换机油', 'Oil change'), amount: 95, status: 'done', paid: true, resourceId: 'WB1', timeline: genTimeline('done', 6, 40) },
    { id: 'W11', customer: 'Chong · Hilux JBV 4444', route: '', content: bi('刹车片 + 冷气', 'Brake pads + AC service'), amount: 480, status: 'done', paid: false, resourceId: 'WB2', timeline: genTimeline('done', 7, 10) },
    { id: 'W12', customer: 'Nur · Myvi JBX 5555', route: '', content: bi('换机油', 'Oil change'), amount: 90, status: 'pending', timeline: genTimeline('pending', 10, 40) },
  ],
  monthly: [
    { code: 'Bay 1', staff: 'Ah Seng', count: 34, revenue: 5200, cost: 1400 },
    { code: 'Bay 2', staff: 'Muthu', count: 29, revenue: 4600, cost: 1250 },
    { code: 'Bay 3', staff: 'Azman', count: 22, revenue: 3400, cost: 900 },
    { code: 'Bay 4', staff: 'Lim', count: 18, revenue: 2800, cost: 1100 },
    { code: 'Bay 5', staff: 'Rajesh', count: 31, revenue: 4900, cost: 1300 },
    { code: 'Bay 6', staff: 'Faizal', count: 26, revenue: 4100, cost: 1050 },
    { code: 'Bay 7', staff: 'Tan', count: 28, revenue: 4400, cost: 1150 },
    { code: 'Bay 8', staff: 'Kumar', count: 20, revenue: 3200, cost: 850 },
  ],
  unpaid: 1860,
  fieldTasks: [
    { id: 'FT1', title: 'Tan · Hilux JBV 7789', loc: bi('刹车片更换', 'Brake pad replacement'), step: 1 },
    { id: 'FT2', title: 'Kumar · Alza JBW 2234', loc: bi('冷气服务', 'AC service'), step: 0 },
    { id: 'FT3', title: 'Rajesh · Hilux JBV 1111', loc: bi('换机油', 'Oil change'), step: 3 },
  ],
  automations: [
    { title: bi('工单 / 发票自动生成', 'Auto-generate job orders / invoices'), pain: bi('省掉每张工单重复抄车牌、项目、价钱', 'Saves re-writing plate number, job, price on every ticket'), preview: 'doc', previewData: { title: bi('维修工单 WO-0512', 'Repair Job Order WO-0512'), lines: [bi('车辆：Hilux JBV 7789', 'Vehicle: Hilux JBV 7789'), bi('项目：刹车片更换', 'Job: Brake pad replacement'), bi('金额：RM 320  已自动生成收据 RCP-0512', 'Amount: RM 320 — Receipt RCP-0512 auto-generated')] } },
    { title: bi('完成后自动 WhatsApp 通知车主取车', 'Auto WhatsApp pickup notice when done'), pain: bi('不用再打电话「你的车弄好了」', "No more calling to say 'your car is ready'"), preview: 'wa', previewData: { text: bi('您好 Rajesh，Hilux JBV 1111 已完成换机油 ✅\n可随时来取车，谢谢！', 'Hi Rajesh, your Hilux JBV 1111 oil change is done ✅\nCome pick it up anytime, thanks!') } },
    { title: bi('月结 / 应收账款自动汇总', 'Auto monthly closing / receivables summary'), pain: bi('月底对账从翻纸本变成一张表', 'Month-end reconciliation goes from flipping paper to one table'), preview: 'text', previewData: bi('⚠ Chong（Hilux JBV 4444）欠款 RM 480，未收', '⚠ Chong (Hilux JBV 4444) owes RM 480, unpaid') },
    { title: bi('保养提醒 / 保险到期提醒', 'Service due / insurance expiry reminders'), pain: bi('帮熟客追踪下次保养日期，增加回头率', "Track regulars' next service date, boost repeat visits"), preview: 'text', previewData: bi('🔔 Ahmad（Myvi JBX 1123）距离下次保养还有 6 天', '🔔 Ahmad (Myvi JBX 1123) — next service due in 6 days') },
  ],
};


export const workflow = null;
