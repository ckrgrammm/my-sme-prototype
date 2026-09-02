/* =====================================================================
   自动化控制台（Automation Control Tower）—— 按行业存放各自的业务流程、
   示例数据与「下一步」自动化文案。每个行业的阶段命名贴合该行业真实的
   作业流程（罗里=取货/送货；五金批发=拣货/打包/出货），不是共用一套
   物流话术改标签。
   ===================================================================== */

function bi(zh, en) { return { zh, en }; }

const WORKFLOWS = {
  lorry: {
    stages: [
      ['request', bi('客户询价', 'Customer request')],
      ['quotation', bi('报价', 'Quotation')],
      ['confirmed', bi('确认下单', 'Confirmed')],
      ['planning', bi('调度规划', 'Planning')],
      ['assigned', bi('已分派', 'Assigned')],
      ['pickup', bi('取货', 'Pickup')],
      ['delivery', bi('送货中', 'Delivery')],
      ['pod', bi('签收凭证', 'Proof of delivery')],
      ['invoicing', bi('开发票', 'Invoicing')],
      ['payment', bi('收款', 'Payment')],
      ['reported', bi('已入账', 'Reported')],
    ],
    idPrefix: 'REQ',
    sequence: 109,
    items: [
      { id: 'REQ-0101', customer: 'Kulai Timber Sdn Bhd', phone: '+60 12-882 1042', route: 'Skudai → Kulai', cargo: 'Timber, 15 bundles', amount: 620, stage: 'request', source: 'WhatsApp', automation: bi('等待货物重量资料', 'Waiting for cargo weight'), needsAttention: true, age: '8 min' },
      { id: 'REQ-0102', customer: 'Lim Trading Hardware', phone: '+60 17-441 8200', route: 'Pasir Gudang → Senai', cargo: 'Packaging materials', amount: 510, stage: 'quotation', source: 'WhatsApp', automation: bi('报价单 QT-0102 已生成', 'Quote QT-0102 prepared'), needsApproval: true, age: '14 min' },
      { id: 'JOB-0103', customer: 'Southern Cable Industries', phone: '+60 16-225 3411', route: 'Tebrau → Tanjung Pelepas', cargo: 'Cable drums, 4 units', amount: 1280, stage: 'confirmed', source: 'Web form', automation: bi('客户已于 09:42 确认', 'Customer accepted at 09:42'), age: '22 min' },
      { id: 'JOB-0104', customer: 'Hup Seng Hardware', phone: '+60 12-771 9002', route: 'JB → Singapore', cargo: 'Hardware parts, customs', amount: 1450, stage: 'planning', source: 'Recurring', automation: bi('正在核实过关证件与车位', 'Checking permit and capacity'), needsAttention: true, age: '31 min' },
      { id: 'JOB-0105', customer: 'Ban Guan Industries', phone: '+60 19-550 7331', route: 'JB → Batu Pahat', cargo: 'Packaging materials, 30 boxes', amount: 980, stage: 'assigned', source: 'WhatsApp', automation: bi('Ah Seng · JHR 1234', 'Ah Seng · JHR 1234'), age: '48 min' },
      { id: 'JOB-0106', customer: 'Evergreen Industrial', phone: '+60 11-209 4432', route: 'Pasir Gudang → Senai', cargo: 'Plastic raw material, 25 bags', amount: 760, stage: 'delivery', source: 'Phone', automation: bi('预计 14:35 送达 · 准时', 'ETA 14:35 · on time'), age: '2 hr' },
      { id: 'JOB-0107', customer: 'Soon Lee Hardware', phone: '+60 13-663 2018', route: 'JB → Batu Pahat', cargo: 'Steel pipes, 40 units', amount: 1100, stage: 'pod', source: 'WhatsApp', automation: bi('已签收 · 缺少照片', 'Signature received · photo missing'), needsAttention: true, age: '3 hr' },
      { id: 'INV-0108', customer: 'Chong Wah Industries', phone: '+60 16-881 0034', route: 'Pasir Gudang → Senai', cargo: 'Cartons, mixed lot', amount: 430, stage: 'payment', source: 'Recurring', automation: bi('发票 7 天后到期', 'Invoice due in 7 days'), age: '2 days' },
    ],
    events: [
      { id: 1, time: '10:18', text: bi('已发送客户进度更新 JOB-0106', 'Customer update sent for JOB-0106'), type: 'message' },
      { id: 2, time: '10:12', text: bi('JOB-0107 签收单已核实', 'POD signature verified for JOB-0107'), type: 'document' },
      { id: 3, time: '09:58', text: bi('Ah Seng 已分派至 JOB-0105', 'Ah Seng assigned to JOB-0105'), type: 'assignment' },
      { id: 4, time: '09:42', text: bi('JOB-0103 报价已被接受', 'Quotation accepted for JOB-0103'), type: 'payment' },
    ],
    messages: {
      quotation: bi('已核算标准价，报价单已生成', 'Standard price calculated · quote ready'),
      confirmed: bi('客户已接受报价，工单已建立', 'Quotation accepted · job created'),
      planning: bi('车位与班次检查已通过', 'Capacity and schedule checks passed'),
      assigned: bi('已分派最合适的司机与车辆', 'Best available driver and vehicle assigned'),
      pickup: bi('司机已出发取货', 'Driver dispatched to pickup'),
      delivery: bi('货物已取货，客户已收到通知', 'Cargo picked up · customer notified'),
      pod: bi('已送达 · 正在收集签收凭证', 'Delivered · collecting proof of delivery'),
      invoicing: bi('签收单已核实，发票已生成', 'POD verified · invoice generated'),
      payment: bi('发票已寄出，账期追踪中', 'Invoice sent · monitoring due date'),
      reported: bi('款项已核对，报表已更新', 'Payment matched · reports updated'),
    },
  },

  supplier: {
    stages: [
      ['request', bi('客户询价', 'Customer inquiry')],
      ['quotation', bi('报价', 'Quotation')],
      ['confirmed', bi('确认下单', 'Confirmed')],
      ['picking', bi('拣货中', 'Picking')],
      ['packed', bi('打包完成', 'Packed')],
      ['dispatched', bi('已出货', 'Dispatched')],
      ['delivered', bi('已送达', 'Delivered')],
      ['pod', bi('签收凭证', 'Proof of delivery')],
      ['invoicing', bi('开发票', 'Invoicing')],
      ['payment', bi('收款', 'Payment')],
      ['reported', bi('已入账', 'Reported')],
    ],
    idPrefix: 'REQ',
    sequence: 220,
    items: [
      { id: 'REQ-2201', customer: 'Kim Huat 汽车维修', phone: '+60 12-345 6789', route: '仓库自取', cargo: '刹车皮 + 机油 一批', amount: 450, stage: 'request', source: 'WhatsApp', automation: bi('正在核对库存与报价', 'Checking stock and preparing quote'), needsAttention: true, age: '6 min' },
      { id: 'REQ-2202', customer: 'Lim Trading 五金', phone: '+60 17-220 3390', route: 'Pasir Gudang 送货', cargo: '五金工具 一批', amount: 410, stage: 'quotation', source: 'WhatsApp', automation: bi('报价单 QT-2202 已生成', 'Quote QT-2202 prepared'), needsApproval: true, age: '12 min' },
      { id: 'SO-2203', customer: 'Ban Guan 装修工程', phone: '+60 19-550 7331', route: 'JB → Batu Pahat', cargo: '铝料配件 一批', amount: 680, stage: 'confirmed', source: 'Web form', automation: bi('客户已确认，销售单已生成', 'Customer confirmed · sales order created'), age: '20 min' },
      { id: 'SO-2204', customer: 'Hup Seng 汽修', phone: '+60 12-771 9002', route: 'JB → Singapore', cargo: '冷气零件 一批', amount: 540, stage: 'picking', source: 'Recurring', automation: bi('打包台 2 · 理货员 Muthu 拣货中', 'Packing Station 2 · Muthu picking'), needsAttention: true, age: '28 min' },
      { id: 'SO-2205', customer: 'Evergreen Transport', phone: '+60 11-209 4432', route: 'Pasir Gudang → Senai', cargo: '油品耗材 一批', amount: 890, stage: 'packed', source: 'Phone', automation: bi('打包完成，等待安排出货', 'Packed · awaiting dispatch slot'), age: '40 min' },
      { id: 'SO-2206', customer: 'Soon Lee 装修', phone: '+60 13-663 2018', route: 'JB → Batu Pahat', cargo: '电线电缆 一批', amount: 720, stage: 'dispatched', source: 'WhatsApp', automation: bi('已出货，预计 2 小时送达', 'Dispatched · ETA 2 hours'), age: '1 hr' },
      { id: 'SO-2207', customer: 'Chong Wah 汽修厂', phone: '+60 16-881 0034', route: 'Pasir Gudang → Senai', cargo: '滤芯 + 皮带 一批', amount: 380, stage: 'pod', source: 'Recurring', automation: bi('客户已签收 · 缺少照片', 'Customer signed · photo missing'), needsAttention: true, age: '2 hr' },
      { id: 'INV-2208', customer: 'Teo Brothers Transport', phone: '+60 12-990 1122', route: 'JB → Singapore', cargo: '油品 + 零件 一批', amount: 1250, stage: 'payment', source: 'Recurring', automation: bi('发票已逾期，账期 45 天', 'Invoice overdue · 45-day term'), needsAttention: true, age: '2 days' },
    ],
    events: [
      { id: 1, time: '10:18', text: bi('已发送出货通知 SO-2206', 'Dispatch notice sent for SO-2206'), type: 'message' },
      { id: 2, time: '10:12', text: bi('SO-2207 签收单已核实', 'POD signature verified for SO-2207'), type: 'document' },
      { id: 3, time: '09:58', text: bi('Muthu 已分派至 SO-2204', 'Muthu assigned to SO-2204'), type: 'assignment' },
      { id: 4, time: '09:42', text: bi('SO-2203 报价已被接受', 'Quotation accepted for SO-2203'), type: 'payment' },
    ],
    messages: {
      quotation: bi('库存已核对，报价单已生成', 'Stock checked · quote ready'),
      confirmed: bi('客户已确认下单，销售单已生成', 'Customer confirmed · sales order created'),
      picking: bi('已分配打包台与理货员拣货', 'Packing station and picker assigned'),
      packed: bi('打包完成，等待安排出货', 'Packed · awaiting dispatch slot'),
      dispatched: bi('已出货，客户已收到 WhatsApp 通知', 'Dispatched · customer notified via WhatsApp'),
      delivered: bi('货物已送达，等待客户签收', 'Delivered · awaiting customer signature'),
      pod: bi('已送达 · 正在收集签收凭证', 'Delivered · collecting proof of delivery'),
      invoicing: bi('签收单已核实，发票已生成', 'POD verified · invoice generated'),
      payment: bi('发票已寄出，账期追踪中', 'Invoice sent · monitoring due date'),
      reported: bi('款项已核对，报表已更新', 'Payment matched · reports updated'),
    },
  },

  tuition: {
    fieldLabels: { route: bi('上课时间', 'Preferred class time'), cargo: bi('科目与套餐', 'Subject & package') },
    stages: [
      ['request', bi('咨询 / 试听申请', 'Inquiry / trial request')],
      ['trial', bi('试听已排', 'Trial scheduled')],
      ['confirmed', bi('确认报名', 'Enrolled')],
      ['scheduled', bi('排班定课', 'Scheduled')],
      ['active', bi('上课中', 'In session')],
      ['completed', bi('课程完成', 'Package complete')],
      ['invoicing', bi('开发票', 'Invoicing')],
      ['payment', bi('收款', 'Payment')],
      ['reported', bi('已入账', 'Reported')],
    ],
    idPrefix: 'REQ',
    sequence: 330,
    items: [
      { id: 'REQ-3301', customer: 'Puan Zaleha（Aiman 家长）', phone: '+60 12-334 5567', route: '想找晚上 19:00–21:00 时段', cargo: 'PT3 数学 8 堂套餐', amount: 0, stage: 'request', source: 'WhatsApp', automation: bi('正在核实老师时段与报价', 'Checking tutor availability and preparing quote'), needsAttention: true, age: '5 min' },
      { id: 'REQ-3302', customer: 'Mr. Tan（Chloe 家长）', phone: '+60 17-660 2281', route: '周六 10:00–12:00', cargo: 'IGCSE 数学 10 堂套餐', amount: 650, stage: 'trial', source: 'WhatsApp', automation: bi('试听课已安排，周六 10:00', 'Trial class scheduled for Saturday 10:00'), needsApproval: true, age: '18 min' },
      { id: 'ENR-3303', customer: 'Mrs. Wong（Ethan 家长）', phone: '+60 19-223 4410', route: '周三 20:00–21:30', cargo: 'SPM 物理 8 堂套餐', amount: 520, stage: 'confirmed', source: 'Web form', automation: bi('家长已确认报名，课程档案建立中', 'Parent confirmed enrollment · profile being set up'), age: '30 min' },
      { id: 'ENR-3304', customer: 'En. Rashid（Iman 家长）', phone: '+60 13-882 7754', route: '周一 / 三 17:00–18:00', cargo: 'UPSR 科学 12 堂套餐', amount: 540, stage: 'scheduled', source: 'Recurring', automation: bi('已分配线上教室与老师，等待首堂课确认', 'Virtual classroom and tutor assigned · awaiting first session confirmation'), needsAttention: true, age: '45 min' },
      { id: 'ENR-3305', customer: 'Mdm Lee（Xin Yi 家长）', phone: '+60 16-773 1120', route: '周二 / 四 18:00–19:30', cargo: 'PT3 国文 8 堂套餐', amount: 400, stage: 'active', source: 'WhatsApp', automation: bi('已上课 3/8 堂，进度正常', '3 of 8 sessions completed · on track'), age: '1 hr' },
      { id: 'ENR-3306', customer: 'Mr. Kumar（Aditya 家长）', phone: '+60 12-556 8890', route: '周五 20:00–21:30', cargo: 'SPM 生物 8 堂套餐', amount: 480, stage: 'completed', source: 'Recurring', automation: bi('8 堂课程已完成，等待家长续费决定', 'All 8 sessions completed · awaiting renewal decision'), needsAttention: true, age: '2 hr' },
      { id: 'INV-3307', customer: 'Puan Farida（Nabil 家长）', phone: '+60 11-990 3345', route: '周六 14:00–15:30', cargo: 'SPM 化学 8 堂套餐', amount: 520, stage: 'invoicing', source: 'WhatsApp', automation: bi('课程已完成，发票已生成', 'Package completed · invoice generated'), age: '3 hr' },
      { id: 'INV-3308', customer: 'Mr. Ong（Kai Xuan 家长）', phone: '+60 17-224 6690', route: '周三 19:00–20:30', cargo: 'IGCSE 英文 10 堂套餐', amount: 700, stage: 'payment', source: 'Recurring', automation: bi('学费已逾期，账期 12 天', 'Tuition fee overdue · 12 days past due'), needsAttention: true, age: '2 days' },
    ],
    events: [
      { id: 1, time: '10:18', text: bi('已发送 Zoom 链接提醒 ENR-3305', 'Zoom link reminder sent for ENR-3305'), type: 'message' },
      { id: 2, time: '10:12', text: bi('ENR-3304 老师与线上教室已确认', 'Tutor and virtual classroom confirmed for ENR-3304'), type: 'assignment' },
      { id: 3, time: '09:58', text: bi('ENR-3303 家长已确认报名', 'Parent confirmed enrollment for ENR-3303'), type: 'payment' },
      { id: 4, time: '09:42', text: bi('REQ-3302 试听课已安排', 'Trial class scheduled for REQ-3302'), type: 'request' },
    ],
    messages: {
      trial: bi('试听课已安排，等待家长确认', 'Trial class scheduled · awaiting parent confirmation'),
      confirmed: bi('家长已确认报名，课程档案建立中', 'Parent confirmed enrollment · profile being set up'),
      scheduled: bi('已分配线上教室与老师，等待首堂课确认', 'Virtual classroom and tutor assigned · awaiting first session confirmation'),
      active: bi('已开始上课，进度追踪中', 'Lessons underway · progress being tracked'),
      completed: bi('课程套餐已用完，等待续费决定', 'Package sessions used up · awaiting renewal decision'),
      invoicing: bi('课程已完成，发票已生成', 'Package completed · invoice generated'),
      payment: bi('发票已寄出，账期追踪中', 'Invoice sent · monitoring due date'),
      reported: bi('款项已核对，报表已更新', 'Payment matched · reports updated'),
    },
  },
};

function snapshot(industry) {
  const data = WORKFLOWS[industry];
  if (!data) return null;
  const attention = data.items.filter((item) => item.needsAttention || item.needsApproval).length;
  const automated = data.items.length - attention;
  return {
    stages: data.stages.map(([key, label]) => ({ key, label })),
    items: data.items,
    events: data.events,
    fieldLabels: data.fieldLabels || null,
    metrics: { attention, automated, automationRate: Math.round((automated / data.items.length) * 100), hoursSaved: 6.4 },
  };
}

export function hasWorkflow(industry) {
  return !!WORKFLOWS[industry];
}

export function getWorkflow(industry) {
  return snapshot(industry);
}

export function createRequest(industry, input = {}) {
  const data = WORKFLOWS[industry];
  if (!data) return { error: 'workflow is not configured for this industry' };
  const required = ['customer', 'phone', 'route', 'cargo'];
  const missing = required.filter((key) => !String(input[key] || '').trim());
  if (missing.length) return { error: `missing ${missing.join(', ')}` };
  data.sequence += 1;
  const item = {
    id: `${data.idPrefix}-${String(data.sequence).padStart(4, '0')}`,
    customer: input.customer.trim(),
    phone: input.phone.trim(),
    route: input.route.trim(),
    cargo: input.cargo.trim(),
    amount: Number(input.amount) || 0,
    stage: 'request',
    source: input.source || 'WhatsApp',
    automation: bi('需求已录入 · 正在核实资料', 'Request captured · validating details'),
    age: 'now',
  };
  data.items.unshift(item);
  data.events.unshift({ id: Date.now(), time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }), text: bi(`已从${item.source}录入 ${item.id}`, `${item.id} captured from ${item.source}`), type: 'request' });
  return { item, workflow: snapshot(industry) };
}

export function advanceWorkflow(industry, id) {
  const data = WORKFLOWS[industry];
  if (!data) return { error: 'workflow is not configured for this industry' };
  const item = data.items.find((entry) => entry.id === id);
  if (!item) return { error: 'workflow item not found' };
  const index = data.stages.findIndex(([key]) => key === item.stage);
  if (index < 0 || index === data.stages.length - 1) return { error: 'item is already complete' };
  item.stage = data.stages[index + 1][0];
  item.needsAttention = false;
  item.needsApproval = false;
  item.age = 'now';
  item.automation = data.messages[item.stage];
  data.events.unshift({ id: Date.now(), time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }), text: bi(`${item.id}：${item.automation.zh}`, `${item.id}: ${item.automation.en}`), type: item.stage });
  return { item, workflow: snapshot(industry) };
}
