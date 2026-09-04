import { bi, genTimeline } from './shared.js';

export const config = {
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

export const workflow = null;
