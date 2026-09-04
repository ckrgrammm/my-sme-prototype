import { bi, genTimeline } from './shared.js';

export const config = {
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
  // 马来西亚补习市场的真实收费模式：绝大多数常规学生是「按月」收费（不管当月实际上几堂，
  // 固定月费，到期续费）；只有考前冲刺班 / 短期密集班常见「按堂」预购套餐（买 N 堂，按剩余堂数续费）。
  // 两种模式的「续费」信号完全不同，所以每个 package 都标注 billingType，分别驱动不同的提醒文案。
  packages: [
    { id: 'P01', student: 'Wei Jie · SPM Form 5', subject: bi('SPM 附加数学冲刺班', 'SPM Add Math crash course'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), billingType: 'per-class', totalSessions: 8, sessionsUsed: 7, fee: 480 },
    { id: 'P02', student: 'Aisyah · UPSR Std 6', subject: bi('UPSR 国文', 'UPSR Bahasa Malaysia'), schedule: bi('每周一 / 三 17:00–18:00', 'Mon & Wed, 17:00–18:00'), billingType: 'monthly', monthlyFee: 360, sessionsThisMonth: 5, expectedSessionsPerMonth: 8, nextDueDate: '10月1日' },
    { id: 'P03', student: 'Kavya · SPM Form 5', subject: bi('SPM 附加数学', 'SPM Additional Mathematics'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), billingType: 'monthly', monthlyFee: 480, sessionsThisMonth: 6, expectedSessionsPerMonth: 8, nextDueDate: '10月1日' },
    { id: 'P04', student: 'Danial · PT3 Form 3', subject: bi('PT3 科学', 'PT3 Science'), schedule: bi('每周一 / 三 18:00–19:30', 'Mon & Wed, 18:00–19:30'), billingType: 'monthly', monthlyFee: 400, sessionsThisMonth: 3, expectedSessionsPerMonth: 8, nextDueDate: '10月3日' },
    { id: 'P05', student: 'Mei Ling · IGCSE Year 10', subject: bi('IGCSE 英文考前冲刺班', 'IGCSE English crash course'), schedule: bi('每周五 20:00–21:30', 'Fri, 20:00–21:30'), billingType: 'per-class', totalSessions: 10, sessionsUsed: 9, fee: 700 },
    { id: 'P06', student: 'Farah · UPSR Std 6', subject: bi('UPSR 全科精读', 'UPSR all-subjects revision'), schedule: bi('每周六 10:00–12:00', 'Sat, 10:00–12:00'), billingType: 'monthly', monthlyFee: 220, sessionsThisMonth: 2, expectedSessionsPerMonth: 4, nextDueDate: '9月30日' },
    { id: 'P07', student: 'Justin · PT3 Form 3', subject: bi('PT3 国文冲刺班', 'PT3 Bahasa Malaysia crash course'), schedule: bi('每周一 / 三 18:00–19:30', 'Mon & Wed, 18:00–19:30'), billingType: 'per-class', totalSessions: 8, sessionsUsed: 8, fee: 400 },
    { id: 'P08', student: 'Nur Hidayah · SPM Form 5', subject: bi('SPM 化学', 'SPM Chemistry'), schedule: bi('每周二 20:00–21:30', 'Tue, 20:00–21:30'), billingType: 'monthly', monthlyFee: 260, sessionsThisMonth: 3, expectedSessionsPerMonth: 4, nextDueDate: '9月5日' },
    { id: 'P09', student: 'Chen Wei · PT3 Form 3', subject: bi('PT3 科学', 'PT3 Science'), schedule: bi('每周四 18:00–19:30', 'Thu, 18:00–19:30'), billingType: 'monthly', monthlyFee: 200, sessionsThisMonth: 3, expectedSessionsPerMonth: 4, nextDueDate: '10月2日' },
    { id: 'P10', student: 'Siti Nur · SPM Form 5', subject: bi('SPM 附加数学', 'SPM Additional Mathematics'), schedule: bi('每周二 / 四 19:00–21:00', 'Tue & Thu, 19:00–21:00'), billingType: 'monthly', monthlyFee: 480, sessionsThisMonth: 4, expectedSessionsPerMonth: 8, nextDueDate: '10月1日' },
    { id: 'P11', student: 'Ravin · PT3 Form 3', subject: bi('PT3 科学冲刺班', 'PT3 Science crash course'), schedule: bi('每周二 18:00–19:30', 'Tue, 18:00–19:30'), billingType: 'per-class', totalSessions: 8, sessionsUsed: 8, fee: 400 },
    { id: 'P12', student: 'Hafiz · UPSR Std 6', subject: bi('UPSR 数学', 'UPSR Mathematics'), schedule: bi('每周五 17:00–18:00', 'Fri, 17:00–18:00'), billingType: 'monthly', monthlyFee: 180, sessionsThisMonth: 0, expectedSessionsPerMonth: 4, nextDueDate: '10月1日' },
    // 英文原本只有一名 IGCSE 学生（P05），导致 WhatsApp 报名助手把「非 IGCSE 学生
    // 想报英文」一律判定成「本学制未开班」——这在数据上说得通但业务上不现实，
    // 真实补习中心不可能只教 IGCSE 学制的英文。补三个不同学制的真实历史学生，
    // 让科目目录（server/assistant/tuitionIntake.js）如实反映「英文其实各学制都有开班」。
    { id: 'P13', student: 'Amirul · SPM Form 5', subject: bi('SPM 英文', 'SPM English'), schedule: bi('每周三 20:00–21:30', 'Wed, 20:00–21:30'), billingType: 'monthly', monthlyFee: 440, sessionsThisMonth: 4, expectedSessionsPerMonth: 8, nextDueDate: '10月1日' },
    { id: 'P14', student: 'Grace · PT3 Form 2', subject: bi('PT3 英文', 'PT3 English'), schedule: bi('每周四 17:00–18:30', 'Thu, 17:00–18:30'), billingType: 'monthly', monthlyFee: 200, sessionsThisMonth: 2, expectedSessionsPerMonth: 4, nextDueDate: '10月4日' },
    { id: 'P15', student: 'Danish · UPSR Std 5', subject: bi('UPSR 英文', 'UPSR English'), schedule: bi('每周六 09:00–10:00', 'Sat, 09:00–10:00'), billingType: 'monthly', monthlyFee: 160, sessionsThisMonth: 1, expectedSessionsPerMonth: 4, nextDueDate: '10月1日' },
    // 应老板要求，全科精读不再只限 UPSR——SPM／PT3 也各开一个全科复习班。
    { id: 'P16', student: 'Aidil · SPM Form 5', subject: bi('SPM 全科精读', 'SPM all-subjects revision'), schedule: bi('每周六 14:00–17:00', 'Sat, 14:00–17:00'), billingType: 'monthly', monthlyFee: 320, sessionsThisMonth: 3, expectedSessionsPerMonth: 4, nextDueDate: '10月1日' },
    { id: 'P17', student: 'Wong Kai · PT3 Form 2', subject: bi('PT3 全科精读', 'PT3 all-subjects revision'), schedule: bi('每周日 10:00–12:30', 'Sun, 10:00–12:30'), billingType: 'monthly', monthlyFee: 260, sessionsThisMonth: 2, expectedSessionsPerMonth: 4, nextDueDate: '10月1日' },
  ],
  orders: [
    { id: 'T01', customer: 'Wei Jie · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学冲刺班 · 第 7/8 堂 · 剩 1 堂', 'SPM Add Math crash course · Session 7/8 · 1 left'), amount: 60, status: 'problem', resourceId: 'TC4', packageId: 'P01', problemNote: bi('网络连线中断，老师正在重新连线，学生在线等待', 'Connection dropped mid-class, tutor reconnecting, student waiting online'), timeline: genTimeline('problem', 19, 5) },
    { id: 'T02', customer: 'Aisyah · UPSR Std 6', route: '17:00–18:00', content: bi('UPSR 国文 · 月费学生 · 本月已上 5 堂', 'UPSR Bahasa Malaysia · Monthly billing · 5 sessions this month'), amount: 45, status: 'pending', packageId: 'P02', timeline: genTimeline('pending', 17, 0) },
    { id: 'T03', customer: 'Kavya · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学 · 月费学生 · 本月已上 6 堂', 'SPM Additional Mathematics · Monthly billing · 6 sessions this month'), amount: 60, status: 'active', resourceId: 'TC1', packageId: 'P03', timeline: genTimeline('active', 19, 0) },
    { id: 'T04', customer: 'Danial · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学 · 月费学生 · 本月已上 3 堂', 'PT3 Science · Monthly billing · 3 sessions this month'), amount: 50, status: 'active', resourceId: 'TC2', packageId: 'P04', timeline: genTimeline('active', 18, 0) },
    { id: 'T05', customer: 'Mei Ling · IGCSE Year 10', route: '20:00–21:30', content: bi('IGCSE 英文考前冲刺班 · 第 10/10 堂 · 剩 1 堂', 'IGCSE English crash course · Session 10/10 · 1 left'), amount: 70, status: 'active', resourceId: 'TC5', packageId: 'P05', timeline: genTimeline('active', 20, 0) },
    { id: 'T06', customer: 'Farah · UPSR Std 6', route: '10:00–12:00', content: bi('UPSR 全科精读 · 月费学生 · 本月已上 2 堂', 'UPSR all-subjects revision · Monthly billing · 2 sessions this month'), amount: 55, status: 'active', resourceId: 'TC7', packageId: 'P06', timeline: genTimeline('active', 10, 0) },
    { id: 'T07', customer: 'Justin · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 国文冲刺班 · 第 8/8 堂 · 套餐已用完', 'PT3 BM crash course · Session 8/8 · package complete'), amount: 50, status: 'done', paid: true, resourceId: 'TC3', packageId: 'P07', timeline: genTimeline('done', 18, 0) },
    { id: 'T08', customer: 'Nur Hidayah · SPM Form 5', route: '20:00–21:30', content: bi('SPM 化学 · 月费学生 · 本月已上 3 堂 · 月费 9月5日到期', 'SPM Chemistry · Monthly billing · 3 sessions this month · fee due 5 Sep'), amount: 65, status: 'done', paid: true, resourceId: 'TC6', packageId: 'P08', timeline: genTimeline('done', 20, 0) },
    { id: 'T09', customer: 'Chen Wei · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学 · 月费学生 · 本月已上 3 堂', 'PT3 Science · Monthly billing · 3 sessions this month'), amount: 50, status: 'done', paid: false, resourceId: 'TC8', packageId: 'P09', timeline: genTimeline('done', 18, 0) },
    { id: 'T10', customer: 'Siti Nur · SPM Form 5', route: '19:00–21:00', content: bi('SPM 附加数学 · 月费学生 · 本月已上 4 堂', 'SPM Additional Mathematics · Monthly billing · 4 sessions this month'), amount: 60, status: 'done', paid: true, resourceId: 'TC1', packageId: 'P10', timeline: genTimeline('done', 19, 0) },
    { id: 'T11', customer: 'Ravin · PT3 Form 3', route: '18:00–19:30', content: bi('PT3 科学冲刺班 · 第 8/8 堂 · 套餐已用完', 'PT3 Science crash course · Session 8/8 · package complete'), amount: 50, status: 'done', paid: false, resourceId: 'TC2', packageId: 'P11', timeline: genTimeline('done', 18, 0) },
    { id: 'T12', customer: 'Hafiz · UPSR Std 6', route: '17:00–18:00', content: bi('UPSR 数学 · 月费学生 · 首堂课', 'UPSR Mathematics · Monthly billing · First session'), amount: 45, status: 'pending', packageId: 'P12', timeline: genTimeline('pending', 17, 0) },
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
    { title: bi('按月 / 按堂两种收费模式自动追踪续费', 'Auto-tracks renewals for both monthly and per-class billing'), pain: bi('月费学生快到期、冲刺班学生堂数快用完，两种情况都自动提醒，不再靠人工翻 Excel', "Whether a student pays monthly or by a class package, both renewal signals are tracked automatically — no more manually checking a spreadsheet"), preview: 'text', previewData: bi('⚠ Wei Jie（SPM 附加数学冲刺班）仅剩 1 堂课，需提醒续费', '⚠ Wei Jie (SPM Add Math crash course) has 1 session left — renewal reminder needed') },
    { title: bi('Zoom 链接与上课提醒自动发送', 'Auto Zoom link + class reminders'), pain: bi('省掉每天手动传送几十个上课连结给家长', 'Saves manually sending dozens of class links to parents every day'), preview: 'wa', previewData: { text: bi('Wei Jie 您好，今晚 19:00 SPM 附加数学课节即将开始 🎓\nZoom 链接：meet.classops.my/r1\n老师：Ah Seng', "Hi Wei Jie, tonight's 19:00 SPM Add Math session starts soon 🎓\nZoom link: meet.classops.my/r1\nTutor: Ah Seng") } },
    { title: bi('缺席自动通知家长', 'Auto absence notification to parents'), pain: bi('学生没上线，家长立刻收到通知，不必等月底才发现', 'Parents are notified the moment a student misses class, not discovered at month-end'), preview: 'wa', previewData: { text: bi('提醒：Aisyah（月费学生）今晚 UPSR 国文课节未出席', "Notice: Aisyah (monthly billing) missed tonight's UPSR BM session") } },
    { title: bi('月费到期日自动汇总提醒', 'Auto monthly-fee due-date summary'), pain: bi('月费学生一多，谁的月费快到期全靠记性；现在到期日自动排序，逾期自动标红', "With many monthly students, tracking whose fee is due next used to rely on memory — now due dates are auto-sorted and overdue ones auto-flagged"), preview: 'text', previewData: bi('⚠ Nur Hidayah（SPM 化学）月费 RM 260 于 9月5日到期', '⚠ Nur Hidayah (SPM Chemistry) monthly fee RM 260 due 5 Sep') },
  ],
};


// 阶段列表改为客服端 WhatsApp 报名对话的真实生命周期（对齐
// OPERATIONS_ASSISTANT.md 第 6 节权威定义），不再是内部职员操作台自造的九段式。
// inquiry/details_collection/options_presented/customer_confirmed 这四段由
// server/assistant/conversationEngine.js 全自动推进（家长在 WhatsApp 里对话即可）；
// slot_reserved 之后靠职员在自动化面板手动「执行下一步」，或未来接真实收款/排课事件自动推进。
export const workflow = {
    fieldLabels: { route: bi('上课时间', 'Preferred class time'), cargo: bi('科目与套餐', 'Subject & package') },
    stages: [
      ['inquiry', bi('咨询进线', 'Inquiry')],
      ['details_collection', bi('收集资料中', 'Collecting details')],
      ['options_presented', bi('已提供选项', 'Options presented')],
      ['cancelled', bi('已取消', 'Cancelled')],
      ['customer_confirmed', bi('家长已确认', 'Customer confirmed')],
      ['slot_reserved', bi('名额已预留', 'Slot reserved')],
      ['payment_pending', bi('待付款', 'Payment pending')],
      ['enrolled', bi('已报名', 'Enrolled')],
      ['class_scheduled', bi('已排课', 'Class scheduled')],
      ['attendance_tracking', bi('出席追踪中', 'Attendance tracking')],
      ['class_completed', bi('课程已完成', 'Class completed')],
      ['invoiced', bi('已开票', 'Invoiced')],
      ['paid', bi('已收款', 'Paid')],
      ['reported', bi('已入账', 'Reported')],
    ],
    idPrefix: 'ENQ',
    sequence: 330,
    items: [
      { id: 'ENQ-3301', customer: 'Puan Zaleha（Aiman 家长）', phone: '+60 12-334 5567', route: '想找晚上 19:00–21:00 时段', cargo: 'PT3 数学', amount: 0, stage: 'inquiry', source: 'WhatsApp', automation: bi('已进线，等待助手询问详情', 'Just came in — assistant will start collecting details'), needsAttention: true, age: '5 min' },
      { id: 'ENQ-3302', customer: 'Mr. Tan（Chloe 家长）', phone: '+60 17-660 2281', route: '周六 10:00–12:00', cargo: 'IGCSE 数学', amount: 650, stage: 'options_presented', source: 'WhatsApp', automation: bi('已提供两个时段选项，等待家长选择', 'Two time-slot options presented, awaiting parent’s choice'), needsApproval: true, age: '18 min' },
      { id: 'ENR-3303', customer: 'Mrs. Wong（Ethan 家长）', phone: '+60 19-223 4410', route: '周三 20:00–21:30', cargo: 'SPM 物理 · 8 堂套餐', amount: 520, stage: 'customer_confirmed', source: 'WhatsApp', automation: bi('家长已在 WhatsApp 回复确认，报名记录已自动建立', 'Parent replied CONFIRM on WhatsApp · enrolment auto-created'), age: '30 min' },
      { id: 'ENR-3304', customer: 'En. Rashid（Iman 家长）', phone: '+60 13-882 7754', route: '周一 / 三 17:00–18:00', cargo: 'UPSR 科学 · 12 堂套餐', amount: 540, stage: 'slot_reserved', source: 'WhatsApp', automation: bi('名额已预留，等待付款', 'Slot reserved · awaiting payment'), needsAttention: true, age: '45 min' },
      { id: 'ENR-3305', customer: 'Mdm Lee（Xin Yi 家长）', phone: '+60 16-773 1120', route: '周二 / 四 18:00–19:30', cargo: 'PT3 国文 · 8 堂套餐', amount: 400, stage: 'attendance_tracking', source: 'WhatsApp', automation: bi('已上课 3/8 堂，进度正常', '3 of 8 sessions completed · on track'), age: '1 hr' },
      { id: 'ENR-3306', customer: 'Mr. Kumar（Aditya 家长）', phone: '+60 12-556 8890', route: '周五 20:00–21:30', cargo: 'SPM 生物 · 8 堂套餐', amount: 480, stage: 'class_completed', source: 'WhatsApp', automation: bi('8 堂课程已完成，等待家长续费决定', 'All 8 sessions completed · awaiting renewal decision'), needsAttention: true, age: '2 hr' },
      { id: 'INV-3307', customer: 'Puan Farida（Nabil 家长）', phone: '+60 11-990 3345', route: '周六 14:00–15:30', cargo: 'SPM 化学 · 8 堂套餐', amount: 520, stage: 'invoiced', source: 'WhatsApp', automation: bi('课程已完成，发票已生成', 'Package completed · invoice generated'), age: '3 hr' },
      { id: 'INV-3308', customer: 'Mr. Ong（Kai Xuan 家长）', phone: '+60 17-224 6690', route: '周三 19:00–20:30', cargo: 'IGCSE 英文 · 10 堂套餐', amount: 700, stage: 'paid', source: 'WhatsApp', automation: bi('学费已收，等待入账', 'Tuition fee received · awaiting reconciliation'), age: '2 days' },
    ],
    events: [
      { id: 1, time: '10:18', text: bi('已发送出席提醒 ENR-3305', 'Attendance reminder sent for ENR-3305'), type: 'message' },
      { id: 2, time: '10:12', text: bi('ENR-3304 名额已预留', 'Slot reserved for ENR-3304'), type: 'assignment' },
      { id: 3, time: '09:58', text: bi('ENR-3303 家长已在 WhatsApp 确认报名', 'Parent confirmed enrolment via WhatsApp for ENR-3303'), type: 'request' },
      { id: 4, time: '09:42', text: bi('ENQ-3302 已提供课程选项', 'Class options presented for ENQ-3302'), type: 'request' },
    ],
    messages: {
      details_collection: bi('助手正在 WhatsApp 上收集报名资料', 'Assistant collecting enrolment details on WhatsApp'),
      options_presented: bi('已提供课程选项，等待家长选择', 'Class options presented · awaiting parent’s choice'),
      cancelled: bi('家长已取消此次报名', 'Parent cancelled this enrolment'),
      customer_confirmed: bi('家长已确认，报名记录已自动建立', 'Parent confirmed · enrolment record auto-created'),
      slot_reserved: bi('名额已预留，等待付款', 'Slot reserved · awaiting payment'),
      payment_pending: bi('等待家长付款', 'Awaiting payment from parent'),
      enrolled: bi('已收款，报名生效', 'Payment received · enrolment active'),
      class_scheduled: bi('已排入正式课表', 'Added to the regular class schedule'),
      attendance_tracking: bi('已开始上课，出席追踪中', 'Lessons underway · attendance being tracked'),
      class_completed: bi('课程套餐已用完，等待续费决定', 'Package sessions used up · awaiting renewal decision'),
      invoiced: bi('课程已完成，发票已生成', 'Package completed · invoice generated'),
      paid: bi('发票已寄出，账期追踪中', 'Invoice sent · monitoring due date'),
      reported: bi('款项已核对，报表已更新', 'Payment matched · reports updated'),
    },
};
