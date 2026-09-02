/* =====================================================================
   SME 运营平台 — 行业配置与假数据
   数据全部写死在内存中，不使用数据库；服务器重启后状态会还原。
   文案支持中 / 英双语：需要翻译的字段用 bi(zh, en) 包成 {zh, en} 对象，
   人名、车牌、路线、金额等专有名词保持原样，两种语言下不变。
   ===================================================================== */

function pad(n){ return String(n).padStart(2,'0'); }
function bi(zh, en){ return { zh, en }; }

export function genTimeline(status, startH, startM){
  let t = startH * 60 + (startM || 0);
  const fmt = m => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
  const tl = { received: fmt(t) };
  if (status === 'pending') return tl;
  t += 18; tl.assigned = fmt(t);
  if (status === 'problem') { t += 35; tl.started = fmt(t); return tl; }
  t += 22; tl.started = fmt(t);
  if (status === 'active') return tl;
  t += 95; tl.completed = fmt(t);
  t += 6; tl.signed = fmt(t);
  return tl;
}

export const CONFIG = {};

/* =====================================================================
   1. 罗里运输 LORRY — 深度模板（重点打磨）
   ===================================================================== */
CONFIG.lorry = {
  key: 'lorry', name: bi('罗里运输', 'Lorry Transport'), emoji: '🚚',
  tagline: 'Lorry Dispatch System',
  productName: 'LorryOps', orderCode: 'DO',
  resourceLabel: bi('车辆', 'Vehicle'), staffLabel: bi('司机', 'Driver'), orderLabel: bi('送货单 DO', 'Delivery Order (DO)'),
  stageLabels: { pending: bi('待派车', 'Pending Dispatch'), active: bi('运送中', 'In Transit'), done: bi('已送达', 'Delivered') },
  fieldRole: bi('司机', 'Driver'),
  resources: [
    { id: 'LR1', code: 'JHR 1234', staff: 'Ah Seng', status: 'active', skill: bi('长途经验 8 年', 'Long-haul, 8 yrs'), skillLevel: 4, restHours: 2 },
    { id: 'LR2', code: 'JHR 5678', staff: 'Muthu', status: 'active', skill: bi('长途经验 5 年', 'Long-haul, 5 yrs'), skillLevel: 3, restHours: 3 },
    { id: 'LR3', code: 'JQR 2210', staff: 'Azman', status: 'idle', skill: bi('本地路线 3 年', 'Local routes, 3 yrs'), skillLevel: 2, restHours: 10 },
    { id: 'LR4', code: 'JHR 8899', staff: 'Lim', status: 'problem', skill: bi('长途经验 6 年', 'Long-haul, 6 yrs'), skillLevel: 4, restHours: 1 },
    { id: 'LR5', code: 'JQR 4471', staff: 'Rajesh', status: 'active', skill: bi('长途经验 4 年', 'Long-haul, 4 yrs'), skillLevel: 3, restHours: 2 },
    { id: 'LR6', code: 'JHR 3302', staff: 'Faizal', status: 'idle', skill: bi('长途经验 9 年', 'Long-haul, 9 yrs'), skillLevel: 5, restHours: 11 },
    { id: 'LR7', code: 'JHR 7765', staff: 'Tan', status: 'active', skill: bi('本地路线 6 年', 'Local routes, 6 yrs'), skillLevel: 3, restHours: 3 },
    { id: 'LR8', code: 'JQR 9081', staff: 'Kumar', status: 'idle', skill: bi('长途经验 2 年', 'Long-haul, 2 yrs'), skillLevel: 2, restHours: 6 },
  ],
  orders: [
    { id: 'L01', customer: 'Teck Heng 五金 Sdn Bhd', route: 'Pasir Gudang → Senai', content: bi('钢材 20 包', 'Steel bars, 20 bundles'), amount: 850, status: 'problem', resourceId: 'LR4', problemNote: bi('车辆在 Senai 收费站附近抛锚，已联络拖车，预计延误 2 小时', 'Vehicle broke down near Senai toll, tow truck contacted, ETA delay ~2 hours'), timeline: genTimeline('problem', 8, 10) },
    { id: 'L02', customer: 'Kulai Timber Sdn Bhd', route: 'Skudai → Kulai', content: bi('木材 15 捆', 'Timber, 15 bundles'), amount: 620, status: 'pending', timeline: genTimeline('pending', 9, 0) },
    { id: 'L03', customer: 'Ban Guan Industries', route: 'JB → Batu Pahat', content: bi('包装原料 30 箱', 'Packaging materials, 30 boxes'), amount: 980, status: 'active', resourceId: 'LR1', timeline: genTimeline('active', 8, 30) },
    { id: 'L04', customer: 'Hup Seng 五金', route: 'JB → Singapore', content: bi('五金配件 一批（过关）', 'Hardware parts, mixed lot (customs clearance)'), amount: 1450, status: 'active', resourceId: 'LR2', timeline: genTimeline('active', 7, 45) },
    { id: 'L05', customer: 'Evergreen 工业', route: 'Pasir Gudang → Senai', content: bi('塑料原料 25 包', 'Plastic raw material, 25 bags'), amount: 760, status: 'active', resourceId: 'LR5', timeline: genTimeline('active', 9, 15) },
    { id: 'L06', customer: 'Kim Huat Sdn Bhd', route: 'Skudai → Kulai', content: bi('建材 一批', 'Building materials, mixed lot'), amount: 890, status: 'active', resourceId: 'LR7', timeline: genTimeline('active', 10, 0) },
    { id: 'L07', customer: 'Soon Lee 五金', route: 'JB → Batu Pahat', content: bi('钢管 40 支', 'Steel pipes, 40 units'), amount: 1100, status: 'done', paid: true, resourceId: 'LR3', timeline: genTimeline('done', 7, 0) },
    { id: 'L08', customer: 'Chong Wah Industries', route: 'Pasir Gudang → Senai', content: bi('纸箱 一批', 'Cartons, mixed lot'), amount: 430, status: 'done', paid: true, resourceId: 'LR6', timeline: genTimeline('done', 7, 20) },
    { id: 'L09', customer: 'Teo Brothers Sdn Bhd', route: 'JB → Singapore', content: bi('电子零件（过关）', 'Electronic parts (customs clearance)'), amount: 2100, status: 'done', paid: false, resourceId: 'LR8', timeline: genTimeline('done', 6, 50) },
    { id: 'L10', customer: 'Ah Hock 五金', route: 'Skudai → Kulai', content: bi('水管配件', 'Plumbing fittings'), amount: 540, status: 'done', paid: true, resourceId: 'LR1', timeline: genTimeline('done', 6, 30) },
    { id: 'L11', customer: 'Guan Chong Sdn Bhd', route: 'JB → Batu Pahat', content: bi('五金 一批', 'Hardware, mixed lot'), amount: 675, status: 'done', paid: false, resourceId: 'LR2', timeline: genTimeline('done', 7, 40) },
    { id: 'L12', customer: 'Lim Trading 五金', route: 'Pasir Gudang → Senai', content: bi('包装材料', 'Packaging materials'), amount: 510, status: 'pending', timeline: genTimeline('pending', 10, 20) },
  ],
  monthly: [
    { code: 'JHR 1234', staff: 'Ah Seng', count: 18, revenue: 6400, cost: 1850 },
    { code: 'JHR 5678', staff: 'Muthu', count: 22, revenue: 7900, cost: 2100 },
    { code: 'JQR 2210', staff: 'Azman', count: 15, revenue: 5200, cost: 1400 },
    { code: 'JHR 8899', staff: 'Lim', count: 12, revenue: 4100, cost: 1600 },
    { code: 'JQR 4471', staff: 'Rajesh', count: 20, revenue: 7100, cost: 1950 },
    { code: 'JHR 3302', staff: 'Faizal', count: 16, revenue: 5600, cost: 1500 },
    { code: 'JHR 7765', staff: 'Tan', count: 19, revenue: 6800, cost: 1800 },
    { code: 'JQR 9081', staff: 'Kumar', count: 14, revenue: 4850, cost: 1350 },
  ],
  unpaid: 4320,
  fieldTasks: [
    { id: 'FT1', title: 'Ban Guan Industries — JB → Batu Pahat', loc: bi('钢材原料 30 箱', 'Steel raw material, 30 boxes'), step: 1 },
    { id: 'FT2', title: 'Hup Seng 五金 — JB → Singapore', loc: bi('五金配件（过关文件已备）', 'Hardware parts (customs docs ready)'), step: 0 },
    { id: 'FT3', title: 'Soon Lee 五金 — JB → Batu Pahat', loc: bi('钢管 40 支', 'Steel pipes, 40 units'), step: 3 },
  ],
  automations: [
    { title: bi('单据自动生成', 'Auto-generate documents'), pain: bi('省掉每天重复抄写路线、客户、运费 2 小时', 'Saves 2 hours/day of re-typing routes, customers, fees'), preview: 'doc', previewData: { title: bi('送货单 DO-2026091', 'Delivery Order DO-2026091'), lines: [bi('客户：Ban Guan Industries', 'Customer: Ban Guan Industries'), bi('路线：JB → Batu Pahat', 'Route: JB → Batu Pahat'), bi('运费：RM 980  已自动生成发票 INV-2026091', 'Fee: RM 980 — Invoice INV-2026091 auto-generated')] } },
    { title: bi('状态变更自动 WhatsApp 通知客户', 'Auto WhatsApp update on status change'), pain: bi('不用再接十几通「到了没」的电话', "No more answering a dozen 'has it arrived?' calls"), preview: 'wa', previewData: { text: bi('Lorry JHR 1234 已 Delivered ✅\n签收时间 14:32\n谢谢惠顾 Ban Guan Industries', 'Lorry JHR 1234 has been Delivered ✅\nSigned at 14:32\nThank you Ban Guan Industries') } },
    { title: bi('月结 / 应收账款自动汇总', 'Auto monthly closing / receivables summary'), pain: bi('月底 3 天对账变成自动列表，压 60 天账期自动标红', '3-day month-end reconciliation becomes an automatic list; accounts 60+ days overdue auto-flagged red'), preview: 'text', previewData: bi('⚠ Teo Brothers Sdn Bhd 已欠款 RM 2,100，超过账期 63 天', '⚠ Teo Brothers Sdn Bhd owes RM 2,100, 63 days overdue') },
    { title: bi('罗厘牌照 / 保险 / Puspakom 检验到期提醒', 'Road tax / insurance / Puspakom inspection expiry alerts'), pain: bi('避免罚款、车被扣，油卡对账不再靠人工核', 'Avoid fines and vehicle seizure; fuel card reconciliation no longer manual'), preview: 'text', previewData: bi('⚠ JHR 8899 Road Tax 还有 5 天到期 · Puspakom 检验还有 12 天', '⚠ JHR 8899 Road Tax expires in 5 days · Puspakom inspection in 12 days') },
  ],
};

/* =====================================================================
   2. 汽修厂 WORKSHOP — Demo 深度
   ===================================================================== */
CONFIG.workshop = {
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

/* =====================================================================
   3. 装修承包 RENOVATION — Demo 深度
   ===================================================================== */
CONFIG.renovation = {
  key: 'renovation', name: bi('装修承包', 'Renovation Contractor'), emoji: '🏗️',
  tagline: 'Reno Site Tracker',
  productName: 'SiteOps', orderCode: 'QT',
  resourceLabel: bi('工地', 'Site'), staffLabel: bi('工头', 'Foreman'), orderLabel: bi('工程报价单', 'Project Quotation'),
  stageLabels: { pending: bi('未开工', 'Not Started'), active: bi('施工中', 'In Progress'), done: bi('待验收', 'Pending Inspection') },
  fieldRole: bi('工头', 'Foreman'),
  resources: [
    { id: 'RS1', code: '工地 A', staff: 'Ah Seng', status: 'active', skill: bi('厨房翻新专长', 'Kitchen reno specialist'), skillLevel: 4, restHours: 3 },
    { id: 'RS2', code: '工地 B', staff: 'Muthu', status: 'active', skill: bi('铝料工程专长', 'Aluminium works specialist'), skillLevel: 3, restHours: 2 },
    { id: 'RS3', code: '工地 C', staff: 'Azman', status: 'idle', skill: bi('油漆工程', 'Painting'), skillLevel: 2, restHours: 10 },
    { id: 'RS4', code: '工地 D', staff: 'Lim', status: 'problem', skill: bi('防水工程专长', 'Waterproofing specialist'), skillLevel: 4, restHours: 1 },
    { id: 'RS5', code: '工地 E', staff: 'Rajesh', status: 'active', skill: bi('油漆工程', 'Painting'), skillLevel: 3, restHours: 3 },
    { id: 'RS6', code: '工地 F', staff: 'Faizal', status: 'idle', skill: bi('防水工程专长', 'Waterproofing specialist'), skillLevel: 5, restHours: 11 },
    { id: 'RS7', code: '工地 G', staff: 'Tan', status: 'active', skill: bi('厨房翻新专长', 'Kitchen reno specialist'), skillLevel: 3, restHours: 4 },
    { id: 'RS8', code: '工地 H', staff: 'Kumar', status: 'idle', skill: bi('铝料工程专长', 'Aluminium works specialist'), skillLevel: 2, restHours: 6 },
  ],
  orders: [
    { id: 'R01', customer: 'Encik Hafiz · Taman Pelangi', route: '', content: bi('洗手间防水工程', 'Bathroom waterproofing'), amount: 8500, status: 'problem', resourceId: 'RS4', problemNote: bi('防水层验漏未过，需重做，业主已知悉延期 3 天', 'Waterproof layer failed leak test, needs redo, owner informed of 3-day delay'), timeline: genTimeline('problem', 9, 0) },
    { id: 'R02', customer: 'Mrs. Chong · Bukit Indah', route: '', content: bi('厨房翻新', 'Kitchen renovation'), amount: 24000, status: 'pending', timeline: genTimeline('pending', 9, 30) },
    { id: 'R03', customer: 'Mr. Lim · Taman Sutera', route: '', content: bi('厨房翻新', 'Kitchen renovation'), amount: 32000, status: 'active', resourceId: 'RS1', timeline: genTimeline('active', 8, 20) },
    { id: 'R04', customer: 'Mr. Kumar · Horizon Hills', route: '', content: bi('铝门窗更换', 'Aluminium door & window replacement'), amount: 14500, status: 'active', resourceId: 'RS2', timeline: genTimeline('active', 9, 0) },
    { id: 'R05', customer: 'Puan Aina · Skudai', route: '', content: bi('全屋油漆', 'Whole-house painting'), amount: 6800, status: 'active', resourceId: 'RS5', timeline: genTimeline('active', 9, 30) },
    { id: 'R06', customer: 'Mr. Wong · Taman Pelangi', route: '', content: bi('洗手间防水 + 翻新', 'Bathroom waterproofing + renovation'), amount: 15200, status: 'active', resourceId: 'RS7', timeline: genTimeline('active', 10, 0) },
    { id: 'R07', customer: 'Mr. Tan · Adda Heights', route: '', content: bi('厨房翻新', 'Kitchen renovation'), amount: 28500, status: 'done', paid: true, resourceId: 'RS3', timeline: genTimeline('done', 7, 0) },
    { id: 'R08', customer: 'Encik Faizal · Ulu Tiram', route: '', content: bi('全屋油漆', 'Whole-house painting'), amount: 5200, status: 'done', paid: true, resourceId: 'RS6', timeline: genTimeline('done', 7, 20) },
    { id: 'R09', customer: 'Mrs. Rajesh · Austin Heights', route: '', content: bi('铝门窗更换', 'Aluminium door & window replacement'), amount: 18900, status: 'done', paid: false, resourceId: 'RS8', timeline: genTimeline('done', 6, 50) },
    { id: 'R10', customer: 'Mr. Azman · Taman Sutera', route: '', content: bi('洗手间防水', 'Bathroom waterproofing'), amount: 7600, status: 'done', paid: true, resourceId: 'RS1', timeline: genTimeline('done', 6, 30) },
    { id: 'R11', customer: 'Mrs. Lee · Bukit Indah', route: '', content: bi('厨房翻新 + 油漆', 'Kitchen renovation + painting'), amount: 41000, status: 'done', paid: false, resourceId: 'RS2', timeline: genTimeline('done', 7, 40) },
    { id: 'R12', customer: 'Encik Zul · Horizon Hills', route: '', content: bi('全屋油漆', 'Whole-house painting'), amount: 6100, status: 'pending', timeline: genTimeline('pending', 10, 10) },
  ],
  monthly: [
    { code: '工地 A', staff: 'Ah Seng', count: 3, revenue: 64000, cost: 41000 },
    { code: '工地 B', staff: 'Muthu', count: 2, revenue: 48000, cost: 31000 },
    { code: '工地 C', staff: 'Azman', count: 4, revenue: 52000, cost: 33000 },
    { code: '工地 D', staff: 'Lim', count: 2, revenue: 29000, cost: 19500 },
    { code: '工地 E', staff: 'Rajesh', count: 3, revenue: 38000, cost: 24500 },
    { code: '工地 F', staff: 'Faizal', count: 3, revenue: 31000, cost: 20000 },
    { code: '工地 G', staff: 'Tan', count: 2, revenue: 44000, cost: 28000 },
    { code: '工地 H', staff: 'Kumar', count: 2, revenue: 35000, cost: 22500 },
  ],
  unpaid: 59900,
  fieldTasks: [
    { id: 'FT1', title: 'Mr. Lim · Taman Sutera', loc: bi('厨房翻新 · 拆除阶段', 'Kitchen renovation · Demolition stage'), step: 1 },
    { id: 'FT2', title: 'Mr. Kumar · Horizon Hills', loc: bi('铝门窗更换', 'Aluminium door & window replacement'), step: 0 },
    { id: 'FT3', title: 'Mr. Tan · Adda Heights', loc: bi('厨房翻新 · 验收', 'Kitchen renovation · Final inspection'), step: 3 },
  ],
  automations: [
    { title: bi('报价单 / 收据自动生成', 'Auto-generate quotations / receipts'), pain: bi('省掉每张报价单重复打字、算分期', 'Saves re-typing every quotation and calculating installments'), preview: 'doc', previewData: { title: bi('工程报价单 QT-0093', 'Project Quotation QT-0093'), lines: [bi('业主：Mr. Lim · Taman Sutera', 'Owner: Mr. Lim · Taman Sutera'), bi('项目：厨房翻新', 'Project: Kitchen renovation'), bi('金额：RM 32,000  分期已自动生成收款单', 'Amount: RM 32,000 — Installment schedule auto-generated')] } },
    { title: bi('进度更新自动 WhatsApp 通知业主', 'Auto WhatsApp progress update to owner'), pain: bi('业主不用一直问「做到哪里了」', "Owner doesn't need to keep asking 'how far along is it?'"), preview: 'wa', previewData: { text: bi('Taman Sutera 厨房翻新进度更新 📸\n今日完成：橱柜安装\n附现场照片 3 张', 'Taman Sutera kitchen reno progress update 📸\nToday completed: cabinet installation\n3 site photos attached') } },
    { title: bi('工程款分期自动汇总提醒', 'Auto installment payment summary reminders'), pain: bi('月结从翻合同变成一张应收表', 'Month-end goes from flipping through contracts to one receivables table'), preview: 'text', previewData: bi('⚠ Mrs. Lee（Bukit Indah）尾款 RM 41,000 未收，已完工 12 天', '⚠ Mrs. Lee (Bukit Indah) final payment RM 41,000 unpaid, 12 days since completion') },
    { title: bi('保险 / 执照到期提醒', 'Insurance / license expiry reminders'), pain: bi('避免工地保险过期导致的赔偿风险', 'Avoid liability risk from expired site insurance'), preview: 'text', previewData: bi('⚠ 工地保险（Public Liability）还有 20 天到期', '⚠ Site insurance (Public Liability) expires in 20 days') },
  ],
};

/* =====================================================================
   4. 五金批发 SUPPLIER — Demo 深度
   供应商视角：客户是本 app 其他三个行业里那些「XX 五金 / XX 汽修 / XX 运输」的老板，
   凸显批发生意最核心的痛点——账期和库存，而不是重复罗里那一套派车逻辑。
   ===================================================================== */
CONFIG.supplier = {
  key: 'supplier', name: bi('五金批发', 'Hardware Wholesale'), emoji: '📦',
  tagline: 'Supplier Order Tracker',
  productName: 'StockOps', orderCode: 'SO',
  resourceLabel: bi('打包台', 'Packing Station'), staffLabel: bi('理货员', 'Picker'), orderLabel: bi('销售单 SO', 'Sales Order (SO)'),
  stageLabels: { pending: bi('待处理', 'Pending'), active: bi('备货中', 'Picking'), done: bi('已交货', 'Delivered') },
  fieldRole: bi('理货员', 'Picker'),
  resources: [
    { id: 'SB1', code: '打包台 1', staff: 'Ah Seng', status: 'active', skill: bi('五金分类熟练', 'Hardware SKU expert'), skillLevel: 4, restHours: 2 },
    { id: 'SB2', code: '打包台 2', staff: 'Muthu', status: 'active', skill: bi('建材分类熟练', 'Building materials expert'), skillLevel: 3, restHours: 3 },
    { id: 'SB3', code: '打包台 3', staff: 'Azman', status: 'idle', skill: bi('一般理货', 'General picking'), skillLevel: 2, restHours: 9 },
    { id: 'SB4', code: '打包台 4', staff: 'Lim', status: 'problem', skill: bi('油品分类熟练', 'Lubricants expert'), skillLevel: 4, restHours: 1 },
    { id: 'SB5', code: '打包台 5', staff: 'Rajesh', status: 'active', skill: bi('五金分类熟练', 'Hardware SKU expert'), skillLevel: 3, restHours: 2 },
    { id: 'SB6', code: '打包台 6', staff: 'Faizal', status: 'idle', skill: bi('建材分类熟练', 'Building materials expert'), skillLevel: 5, restHours: 12 },
    { id: 'SB7', code: '打包台 7', staff: 'Tan', status: 'active', skill: bi('一般理货', 'General picking'), skillLevel: 3, restHours: 4 },
    { id: 'SB8', code: '打包台 8', staff: 'Kumar', status: 'idle', skill: bi('油品分类熟练', 'Lubricants expert'), skillLevel: 2, restHours: 5 },
  ],
  orders: [
    { id: 'S01', customer: 'Kim Huat 汽车维修', route: '', content: bi('刹车皮 + 机油 一批', 'Brake pads + engine oil, mixed lot'), amount: 450, status: 'problem', resourceId: 'SB4', problemNote: bi('刹车皮库存不足，已联络厂商补货，预计延迟 2 天', 'Brake pad stock insufficient, manufacturer restock requested, ~2 day delay'), timeline: genTimeline('problem', 9, 0) },
    { id: 'S02', customer: 'Teck Heng 运输 Sdn Bhd', route: '', content: bi('螺丝五金 一批', 'Screws & fasteners, mixed lot'), amount: 320, status: 'pending', timeline: genTimeline('pending', 9, 20) },
    { id: 'S03', customer: 'Ban Guan 装修工程', route: '', content: bi('铝料配件 一批', 'Aluminium fittings, mixed lot'), amount: 680, status: 'active', resourceId: 'SB1', timeline: genTimeline('active', 8, 30) },
    { id: 'S04', customer: 'Hup Seng 汽修', route: '', content: bi('冷气零件 一批', 'AC parts, mixed lot'), amount: 540, status: 'active', resourceId: 'SB2', timeline: genTimeline('active', 9, 0) },
    { id: 'S05', customer: 'Evergreen Transport', route: '', content: bi('油品耗材 一批', 'Lubricants & consumables, mixed lot'), amount: 890, status: 'active', resourceId: 'SB5', timeline: genTimeline('active', 9, 30) },
    { id: 'S06', customer: 'Kim Huat 建材行', route: '', content: bi('五金工具 一批', 'Hardware tools, mixed lot'), amount: 410, status: 'active', resourceId: 'SB7', timeline: genTimeline('active', 10, 0) },
    { id: 'S07', customer: 'Soon Lee 装修', route: '', content: bi('电线电缆 一批', 'Wiring & cables, mixed lot'), amount: 720, status: 'done', paid: true, resourceId: 'SB3', timeline: genTimeline('done', 7, 0) },
    { id: 'S08', customer: 'Chong Wah 汽修厂', route: '', content: bi('滤芯 + 皮带 一批', 'Filters + belts, mixed lot'), amount: 380, status: 'done', paid: true, resourceId: 'SB6', timeline: genTimeline('done', 7, 20) },
    { id: 'S09', customer: 'Teo Brothers Transport', route: '', content: bi('油品 + 零件 一批', 'Lubricants + parts, mixed lot'), amount: 1250, status: 'done', paid: false, resourceId: 'SB8', timeline: genTimeline('done', 6, 50) },
    { id: 'S10', customer: 'Ah Hock 五金行', route: '', content: bi('螺丝螺帽 一批', 'Nuts & bolts, mixed lot'), amount: 260, status: 'done', paid: true, resourceId: 'SB1', timeline: genTimeline('done', 6, 30) },
    { id: 'S11', customer: 'Guan Chong 装修工程', route: '', content: bi('铝门窗配件 一批', 'Aluminium door/window fittings, mixed lot'), amount: 980, status: 'done', paid: false, resourceId: 'SB2', timeline: genTimeline('done', 7, 40) },
    { id: 'S12', customer: 'Lim Trading 汽修', route: '', content: bi('刹车油 + 冷气水 一批', 'Brake fluid + coolant, mixed lot'), amount: 300, status: 'pending', timeline: genTimeline('pending', 10, 15) },
  ],
  monthly: [
    { code: '打包台 1', staff: 'Ah Seng', count: 26, revenue: 8200, cost: 5400 },
    { code: '打包台 2', staff: 'Muthu', count: 22, revenue: 7100, cost: 4650 },
    { code: '打包台 3', staff: 'Azman', count: 19, revenue: 6000, cost: 3950 },
    { code: '打包台 4', staff: 'Lim', count: 14, revenue: 4400, cost: 2950 },
    { code: '打包台 5', staff: 'Rajesh', count: 24, revenue: 7600, cost: 5000 },
    { code: '打包台 6', staff: 'Faizal', count: 18, revenue: 5700, cost: 3750 },
    { code: '打包台 7', staff: 'Tan', count: 21, revenue: 6650, cost: 4400 },
    { code: '打包台 8', staff: 'Kumar', count: 16, revenue: 5100, cost: 3350 },
  ],
  unpaid: 7580,
  fieldTasks: [
    { id: 'FT1', title: 'Ban Guan 装修工程 — 铝料配件', loc: bi('拣货 + 打包', 'Picking + packing'), step: 1 },
    { id: 'FT2', title: 'Hup Seng 汽修 — 冷气零件', loc: bi('拣货中', 'Picking in progress'), step: 0 },
    { id: 'FT3', title: 'Soon Lee 装修 — 电线电缆', loc: bi('已装车待发', 'Loaded, ready to dispatch'), step: 3 },
  ],
  automations: [
    { title: bi('销售单 / 送货单 / 发票自动生成', 'Auto-generate SO / DO / invoice'), pain: bi('省掉每张单重复抄品项、数量、价钱', 'Saves re-writing items, quantities, prices on every order'), preview: 'doc', previewData: { title: bi('销售单 SO-0847', 'Sales Order SO-0847'), lines: [bi('客户：Ban Guan 装修工程', 'Customer: Ban Guan Renovation'), bi('品项：铝料配件 一批', 'Items: Aluminium fittings, mixed lot'), bi('金额：RM 680  已自动生成发票 INV-0847', 'Amount: RM 680 — Invoice INV-0847 auto-generated')] } },
    { title: bi('备货 / 配送状态自动 WhatsApp 通知客户', 'Auto WhatsApp status update to customer'), pain: bi('不用再接电话「货备好了没」', 'No more calls asking "is my order ready yet"'), preview: 'wa', previewData: { text: bi('Ban Guan 装修工程 您好，订单 SO-0847 已备货完成，今日下午送达 📦', 'Hi Ban Guan Renovation, your order SO-0847 is packed and will be delivered this afternoon 📦') } },
    { title: bi('应收账款自动汇总，压账期自动标红', 'Auto receivables summary, overdue accounts auto-flagged'), pain: bi('批发生意靠账期做生意，谁欠多久一眼看清', 'Wholesale runs on credit terms — see who owes what, for how long, at a glance'), preview: 'text', previewData: bi('⚠ Teo Brothers Transport 欠款 RM 1,250，账期 45 天已超期', '⚠ Teo Brothers Transport owes RM 1,250, 45-day term already overdue') },
    { title: bi('库存低水位自动提醒补货', 'Low-stock auto reorder alerts'), pain: bi('避免缺货流失订单，也不会囤太多压资金', 'Avoid losing orders to stockouts, without overstocking and tying up cash'), preview: 'text', previewData: bi('⚠ 刹车皮（Brake Pad）库存仅剩 8 件，低于安全水位', '⚠ Brake pads down to 8 units, below safety stock level') },
  ],
};

/* =====================================================================
   5. 补习中心 TUITION — Demo 深度
   全线上教学：约束资源不是教室这类物理空间，而是并发的线上教室名额
   （Zoom room license）与老师的可授课时数。订单不是一次性任务，而是
   「今日课节」——每一堂课都挂着一份 package（学生报名的课程套餐），
   剩余堂数与续费提醒是这个行业最独特、最真实的痛点。
   ===================================================================== */
CONFIG.tuition = {
  key: 'tuition', name: bi('补习中心', 'Tuition Centre'), emoji: '🎓',
  tagline: 'Online Class Tracker',
  productName: 'ClassOps', orderCode: 'CL',
  resourceLabel: bi('线上教室', 'Virtual Classroom'), staffLabel: bi('老师', 'Tutor'), orderLabel: bi('课节', 'Class Session'),
  stageLabels: { pending: bi('待上课', 'Upcoming'), active: bi('上课中', 'In Session'), done: bi('已完成', 'Completed') },
  fieldRole: bi('老师', 'Tutor'),
  resources: [
    { id: 'TC1', code: '线上教室 1', staff: 'Ah Seng', status: 'active', skill: bi('SPM 附加数学专长', 'SPM Add Math specialist'), skillLevel: 4, restHours: 2 },
    { id: 'TC2', code: '线上教室 2', staff: 'Muthu', status: 'active', skill: bi('PT3 理科专长', 'PT3 Science specialist'), skillLevel: 3, restHours: 3 },
    { id: 'TC3', code: '线上教室 3', staff: 'Azman', status: 'idle', skill: bi('UPSR 全科', 'UPSR all subjects'), skillLevel: 2, restHours: 9 },
    { id: 'TC4', code: '线上教室 4', staff: 'Lim', status: 'problem', skill: bi('SPM 附加数学专长', 'SPM Add Math specialist'), skillLevel: 4, restHours: 1 },
    { id: 'TC5', code: '线上教室 5', staff: 'Rajesh', status: 'active', skill: bi('IGCSE 英文专长', 'IGCSE English specialist'), skillLevel: 3, restHours: 2 },
    { id: 'TC6', code: '线上教室 6', staff: 'Faizal', status: 'idle', skill: bi('SPM 化学专长', 'SPM Chemistry specialist'), skillLevel: 5, restHours: 11 },
    { id: 'TC7', code: '线上教室 7', staff: 'Tan', status: 'active', skill: bi('UPSR 全科', 'UPSR all subjects'), skillLevel: 3, restHours: 4 },
    { id: 'TC8', code: '线上教室 8', staff: 'Kumar', status: 'idle', skill: bi('PT3 理科专长', 'PT3 Science specialist'), skillLevel: 2, restHours: 5 },
  ],
  packages: [
    { id: 'P01', student: 'Wei Jie · SPM Form 5', subject: bi('SPM 附加数学', 'SPM Additional Mathematics'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), totalSessions: 8, sessionsUsed: 7, fee: 480 },
    { id: 'P02', student: 'Aisyah · UPSR Std 6', subject: bi('UPSR 国文', 'UPSR Bahasa Malaysia'), schedule: bi('每周一 / 三 17:00–18:00', 'Mon & Wed, 17:00–18:00'), totalSessions: 12, sessionsUsed: 4, fee: 540 },
    { id: 'P03', student: 'Kavya · SPM Form 5', subject: bi('SPM 附加数学加强班', 'SPM Add Math intensive'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), totalSessions: 10, sessionsUsed: 5, fee: 600 },
    { id: 'P04', student: 'Danial · PT3 Form 3', subject: bi('PT3 科学', 'PT3 Science'), schedule: bi('每周一 / 三 18:00–19:30', 'Mon & Wed, 18:00–19:30'), totalSessions: 8, sessionsUsed: 3, fee: 400 },
    { id: 'P05', student: 'Mei Ling · IGCSE Year 10', subject: bi('IGCSE 英文', 'IGCSE English'), schedule: bi('每周五 20:00–21:30', 'Fri, 20:00–21:30'), totalSessions: 10, sessionsUsed: 9, fee: 700 },
    { id: 'P06', student: 'Farah · UPSR Std 6', subject: bi('UPSR 全科精读', 'UPSR all-subjects revision'), schedule: bi('每周六 10:00–12:00', 'Sat, 10:00–12:00'), totalSessions: 12, sessionsUsed: 6, fee: 660 },
    { id: 'P07', student: 'Justin · PT3 Form 3', subject: bi('PT3 国文', 'PT3 Bahasa Malaysia'), schedule: bi('每周一 / 三 18:00–19:30', 'Mon & Wed, 18:00–19:30'), totalSessions: 8, sessionsUsed: 8, fee: 400 },
    { id: 'P08', student: 'Nur Hidayah · SPM Form 5', subject: bi('SPM 化学', 'SPM Chemistry'), schedule: bi('每周二 20:00–21:30', 'Tue, 20:00–21:30'), totalSessions: 8, sessionsUsed: 6, fee: 520 },
    { id: 'P09', student: 'Chen Wei · PT3 Form 3', subject: bi('PT3 科学', 'PT3 Science'), schedule: bi('每周四 18:00–19:30', 'Thu, 18:00–19:30'), totalSessions: 10, sessionsUsed: 7, fee: 500 },
    { id: 'P10', student: 'Siti Nur · SPM Form 5', subject: bi('SPM 附加数学', 'SPM Additional Mathematics'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), totalSessions: 8, sessionsUsed: 4, fee: 480 },
    { id: 'P11', student: 'Ravin · PT3 Form 3', subject: bi('PT3 科学', 'PT3 Science'), schedule: bi('每周二 18:00–19:30', 'Tue, 18:00–19:30'), totalSessions: 8, sessionsUsed: 8, fee: 400 },
    { id: 'P12', student: 'Hafiz · UPSR Std 6', subject: bi('UPSR 数学', 'UPSR Mathematics'), schedule: bi('每周五 17:00–18:00', 'Fri, 17:00–18:00'), totalSessions: 12, sessionsUsed: 0, fee: 540 },
  ],
  orders: [
    { id: 'T01', customer: 'Wei Jie · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学 · 第 7/8 堂 · 剩 1 堂', 'SPM Add Math · Session 7/8 · 1 left'), amount: 60, status: 'problem', resourceId: 'TC4', packageId: 'P01', problemNote: bi('网络连线中断，老师正在重新连线，学生在线等待', 'Connection dropped mid-class, tutor reconnecting, student waiting online'), timeline: genTimeline('problem', 19, 5) },
    { id: 'T02', customer: 'Aisyah · UPSR Std 6', route: '17:00–18:00', content: bi('UPSR 国文 · 第 5/12 堂', 'UPSR Bahasa Malaysia · Session 5/12'), amount: 45, status: 'pending', packageId: 'P02', timeline: genTimeline('pending', 17, 0) },
    { id: 'T03', customer: 'Kavya · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学加强班 · 第 6/10 堂', 'SPM Add Math intensive · Session 6/10'), amount: 60, status: 'active', resourceId: 'TC1', packageId: 'P03', timeline: genTimeline('active', 19, 0) },
    { id: 'T04', customer: 'Danial · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学 · 第 4/8 堂', 'PT3 Science · Session 4/8'), amount: 50, status: 'active', resourceId: 'TC2', packageId: 'P04', timeline: genTimeline('active', 18, 0) },
    { id: 'T05', customer: 'Mei Ling · IGCSE Year 10', route: '20:00–21:30', content: bi('IGCSE 英文 · 第 10/10 堂 · 剩 1 堂', 'IGCSE English · Session 10/10 · 1 left'), amount: 70, status: 'active', resourceId: 'TC5', packageId: 'P05', timeline: genTimeline('active', 20, 0) },
    { id: 'T06', customer: 'Farah · UPSR Std 6', route: '10:00–12:00', content: bi('UPSR 全科精读 · 第 7/12 堂', 'UPSR all-subjects revision · Session 7/12'), amount: 55, status: 'active', resourceId: 'TC7', packageId: 'P06', timeline: genTimeline('active', 10, 0) },
    { id: 'T07', customer: 'Justin · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 国文 · 第 8/8 堂 · 套餐已用完', 'PT3 Bahasa Malaysia · Session 8/8 · package complete'), amount: 50, status: 'done', paid: true, resourceId: 'TC3', packageId: 'P07', timeline: genTimeline('done', 18, 0) },
    { id: 'T08', customer: 'Nur Hidayah · SPM Form 5', route: '20:00–21:30', content: bi('SPM 化学 · 第 6/8 堂', 'SPM Chemistry · Session 6/8'), amount: 65, status: 'done', paid: true, resourceId: 'TC6', packageId: 'P08', timeline: genTimeline('done', 20, 0) },
    { id: 'T09', customer: 'Chen Wei · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学 · 第 7/10 堂', 'PT3 Science · Session 7/10'), amount: 50, status: 'done', paid: false, resourceId: 'TC8', packageId: 'P09', timeline: genTimeline('done', 18, 0) },
    { id: 'T10', customer: 'Siti Nur · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学 · 第 4/8 堂', 'SPM Additional Mathematics · Session 4/8'), amount: 60, status: 'done', paid: true, resourceId: 'TC1', packageId: 'P10', timeline: genTimeline('done', 19, 0) },
    { id: 'T11', customer: 'Ravin · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学 · 第 8/8 堂 · 套餐已用完', 'PT3 Science · Session 8/8 · package complete'), amount: 50, status: 'done', paid: false, resourceId: 'TC2', packageId: 'P11', timeline: genTimeline('done', 18, 0) },
    { id: 'T12', customer: 'Hafiz · UPSR Std 6', route: '17:00–18:00', content: bi('UPSR 数学 · 首堂课', 'UPSR Mathematics · First session'), amount: 45, status: 'pending', packageId: 'P12', timeline: genTimeline('pending', 17, 0) },
  ],
  monthly: [
    { code: '线上教室 1', staff: 'Ah Seng', count: 24, revenue: 5100, cost: 2200 },
    { code: '线上教室 2', staff: 'Muthu', count: 20, revenue: 4200, cost: 1900 },
    { code: '线上教室 3', staff: 'Azman', count: 16, revenue: 3100, cost: 1400 },
    { code: '线上教室 4', staff: 'Lim', count: 14, revenue: 2900, cost: 1650 },
    { code: '线上教室 5', staff: 'Rajesh', count: 18, revenue: 4500, cost: 1750 },
    { code: '线上教室 6', staff: 'Faizal', count: 22, revenue: 5600, cost: 2400 },
    { code: '线上教室 7', staff: 'Tan', count: 19, revenue: 3700, cost: 1600 },
    { code: '线上教室 8', staff: 'Kumar', count: 15, revenue: 2800, cost: 1250 },
  ],
  unpaid: 640,
  fieldTasks: [
    { id: 'FT1', title: 'Wei Jie · SPM Form 5', loc: bi('附加数学 · 网络连线中', 'Add Math · reconnecting'), step: 1 },
    { id: 'FT2', title: 'Aisyah · UPSR Std 6', loc: bi('Zoom 链接已发送，等待上课', 'Zoom link sent, awaiting start'), step: 0 },
    { id: 'FT3', title: 'Justin · PT3 Form 3', loc: bi('课节已完成，套餐已用完待续费', 'Session complete, package used up — renewal needed'), step: 3 },
  ],
  automations: [
    { title: bi('课程剩余堂数自动追踪 + 续费提醒', 'Auto session-balance tracking + renewal reminders'), pain: bi('不再靠人工数格子，堂数快用完自动通知家长续费', 'No more manually counting sessions — parents are auto-notified to renew before the package runs out'), preview: 'text', previewData: bi('⚠ Wei Jie（SPM 附加数学）仅剩 1 堂课，需提醒续费', '⚠ Wei Jie (SPM Add Math) has 1 session left — renewal reminder needed') },
    { title: bi('Zoom 链接与上课提醒自动发送', 'Auto Zoom link + class reminders'), pain: bi('省掉每天手动传送几十个上课连结给家长', 'Saves manually sending dozens of class links to parents every day'), preview: 'wa', previewData: { text: bi('Wei Jie 您好，今晚 19:00 SPM 附加数学课节即将开始 🎓\nZoom 链接：meet.classops.my/r1\n老师：Ah Seng', "Hi Wei Jie, tonight's 19:00 SPM Add Math session starts soon 🎓\nZoom link: meet.classops.my/r1\nTutor: Ah Seng") } },
    { title: bi('缺席自动通知家长', 'Auto absence notification to parents'), pain: bi('学生没上线，家长立刻收到通知，不必等月底才发现', 'Parents are notified the moment a student misses class, not discovered at month-end'), preview: 'wa', previewData: { text: bi('提醒：Aisyah 今晚 UPSR 国文课节未出席，已扣 1 堂', "Notice: Aisyah missed tonight's UPSR BM session — 1 session deducted") } },
    { title: bi('月结 / 应收学费自动汇总', 'Auto monthly closing / tuition fee summary'), pain: bi('月底对账从翻 Excel 变成自动列表，欠费自动标红', 'Month-end reconciliation becomes an automatic list; overdue fees auto-flagged'), preview: 'text', previewData: bi('⚠ Chen Wei（PT3 科学）学费 RM 50 已逾期 4 天', '⚠ Chen Wei (PT3 Science) tuition fee RM 50 is 4 days overdue') },
  ],
};

export const INDUSTRY_ORDER = ['lorry', 'workshop', 'renovation', 'supplier', 'tuition'];
